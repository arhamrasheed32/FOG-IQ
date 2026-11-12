"""
FOG-IQ Frontend AWS Deployment Script
Deploys frontend build to AWS S3 Static Website and creates/updates AWS CloudFront CDN distribution.
"""

import os
import sys
import json
import time
import mimetypes
from pathlib import Path
import boto3
from botocore.exceptions import ClientError

REGION = "us-east-1"
BUCKET_NAME = "fog-iq-frontend-654524017474"
DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

s3 = boto3.client("s3", region_name=REGION)
cloudfront = boto3.client("cloudfront", region_name=REGION)

def setup_s3_website():
    print(f"[*] Checking/Creating S3 bucket: {BUCKET_NAME} in {REGION}...")
    try:
        # In us-east-1, LocationConstraint is not passed
        if REGION == "us-east-1":
            s3.create_bucket(Bucket=BUCKET_NAME)
        else:
            s3.create_bucket(
                Bucket=BUCKET_NAME,
                CreateBucketConfiguration={"LocationConstraint": REGION}
            )
        print(f"[+] Bucket {BUCKET_NAME} created.")
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code")
        if code in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
            print(f"[+] Bucket {BUCKET_NAME} already exists.")
        else:
            raise

    # 1. Disable Block Public Access
    print("[*] Configuring S3 Public Access Block settings...")
    try:
        s3.put_public_access_block(
            Bucket=BUCKET_NAME,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": False,
                "IgnorePublicAcls": False,
                "BlockPublicPolicy": False,
                "RestrictPublicBuckets": False,
            }
        )
        print("[+] Public access block disabled.")
    except Exception as e:
        print(f"[!] Warning updating public access block: {e}")

    # 2. Put Bucket Policy for public read
    print("[*] Setting bucket policy for public read access...")
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
            }
        ]
    }
    s3.put_bucket_policy(
        Bucket=BUCKET_NAME,
        Policy=json.dumps(bucket_policy)
    )
    print("[+] Public read bucket policy applied.")

    # 3. Enable Static Website Hosting
    print("[*] Enabling S3 Static Website Hosting...")
    s3.put_bucket_website(
        Bucket=BUCKET_NAME,
        WebsiteConfiguration={
            "IndexDocument": {"Suffix": "index.html"},
            "ErrorDocument": {"Key": "index.html"}
        }
    )
    website_url = f"http://{BUCKET_NAME}.s3-website-{REGION}.amazonaws.com"
    print(f"[+] Static website configured: {website_url}")
    return website_url

def upload_dist_files():
    print(f"[*] Uploading files from {DIST_DIR} to s3://{BUCKET_NAME}...")
    if not DIST_DIR.exists():
        raise FileNotFoundError(f"Dist directory {DIST_DIR} not found. Run 'npm run build' first.")

    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("text/css", ".css")
    mimetypes.add_type("image/svg+xml", ".svg")
    mimetypes.add_type("image/jpeg", ".jpg")
    mimetypes.add_type("image/png", ".png")
    mimetypes.add_type("application/json", ".json")

    uploaded = 0
    for root, _, files in os.walk(DIST_DIR):
        for file in files:
            full_path = Path(root) / file
            rel_path = full_path.relative_to(DIST_DIR).as_posix()
            
            content_type, _ = mimetypes.guess_type(str(full_path))
            if not content_type:
                content_type = "application/octet-stream"

            extra_args = {"ContentType": content_type}
            if rel_path.endswith(".html"):
                extra_args["CacheControl"] = "no-cache, no-store, must-revalidate"
            else:
                extra_args["CacheControl"] = "public, max-age=31536000, immutable"

            with open(full_path, "rb") as data:
                s3.put_object(
                    Bucket=BUCKET_NAME,
                    Key=rel_path,
                    Body=data,
                    **extra_args
                )
            print(f"  -> Uploaded: {rel_path} ({content_type})")
            uploaded += 1

    print(f"[+] Successfully uploaded {uploaded} assets.")

def setup_cloudfront():
    print("[*] Checking existing CloudFront distributions...")
    website_domain = f"{BUCKET_NAME}.s3-website-{REGION}.amazonaws.com"
    origin_id = f"S3-Website-{BUCKET_NAME}"

    existing_dist = None
    try:
        dists = cloudfront.list_distributions().get("DistributionList", {}).get("Items", [])
        for d in dists:
            origins = d.get("Origins", {}).get("Items", [])
            for o in origins:
                if BUCKET_NAME in o.get("DomainName", ""):
                    existing_dist = d
                    break
            if existing_dist:
                break
    except Exception as e:
        print(f"[!] Error listing distributions: {e}")

    if existing_dist:
        dist_id = existing_dist["Id"]
        cf_domain = existing_dist["DomainName"]
        print(f"[+] Found existing CloudFront distribution: {dist_id} ({cf_domain})")
        
        # Create Invalidation
        print(f"[*] Invalidating CloudFront cache for distribution {dist_id}...")
        try:
            invalidation = cloudfront.create_invalidation(
                DistributionId=dist_id,
                InvalidationBatch={
                    "Paths": {
                        "Quantity": 1,
                        "Items": ["/*"]
                    },
                    "CallerReference": f"fog-iq-inval-{int(time.time())}"
                }
            )
            print(f"[+] Cache invalidation created: {invalidation['Invalidation']['Id']}")
        except Exception as e:
            print(f"[!] Warning on invalidation: {e}")

        return f"https://{cf_domain}"

    # Create new CloudFront distribution
    print("[*] Creating new CloudFront distribution (this provisions in the background)...")
    dist_config = {
        "CallerReference": f"fog-iq-cf-{int(time.time())}",
        "Comment": "FOG-IQ Intelligent Urban Traffic Platform Frontend",
        "Enabled": True,
        "DefaultRootObject": "index.html",
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": origin_id,
                    "DomainName": website_domain,
                    "CustomOriginConfig": {
                        "HTTPPort": 80,
                        "HTTPSPort": 443,
                        "OriginProtocolPolicy": "http-only",
                        "OriginSslProtocols": {
                            "Quantity": 3,
                            "Items": ["TLSv1", "TLSv1.1", "TLSv1.2"]
                        }
                    }
                }
            ]
        },
        "DefaultCacheBehavior": {
            "TargetOriginId": origin_id,
            "ViewerProtocolPolicy": "redirect-to-https",
            "AllowedMethods": {
                "Quantity": 3,
                "Items": ["GET", "HEAD", "OPTIONS"],
                "CachedMethods": {
                    "Quantity": 2,
                    "Items": ["GET", "HEAD"]
                }
            },
            "ForwardedValues": {
                "QueryString": False,
                "Cookies": {"Forward": "none"}
            },
            "MinTTL": 0,
            "DefaultTTL": 86400,
            "MaxTTL": 31536000,
            "Compress": True
        },
        "CustomErrorResponses": {
            "Quantity": 2,
            "Items": [
                {
                    "ErrorCode": 404,
                    "ResponsePagePath": "/index.html",
                    "ResponseCode": "200",
                    "ErrorCachingMinTTL": 300
                },
                {
                    "ErrorCode": 403,
                    "ResponsePagePath": "/index.html",
                    "ResponseCode": "200",
                    "ErrorCachingMinTTL": 300
                }
            ]
        },
        "PriceClass": "PriceClass_100"
    }

    try:
        response = cloudfront.create_distribution(DistributionConfig=dist_config)
        dist = response["Distribution"]
        dist_id = dist["Id"]
        cf_domain = dist["DomainName"]
        print(f"[+] Created CloudFront distribution: {dist_id} -> https://{cf_domain}")
        return f"https://{cf_domain}"
    except Exception as e:
        print(f"[!] Failed to create CloudFront distribution: {e}")
        return None

if __name__ == "__main__":
    print("=" * 65)
    print("       FOG-IQ AWS S3 + CLOUDFRONT DEPLOYMENT PIPELINE       ")
    print("=" * 65)
    s3_url = setup_s3_website()
    upload_dist_files()
    cf_url = setup_cloudfront()
    print("=" * 65)
    print("DEPLOYMENT COMPLETE!")
    print(f"  S3 Static Website URL: {s3_url}")
    if cf_url:
        print(f"  CloudFront CDN URL:    {cf_url}")
    print("=" * 65)
