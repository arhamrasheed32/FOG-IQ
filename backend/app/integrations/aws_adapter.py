"""
FOG-IQ AWS Adapter & Dual-Mode Integration Layer
Provides unified interface for both LOCAL MODE (file-based Parquet lake, local state)
and AWS MODE (S3, DynamoDB, SNS, IoT Core, Kinesis).
Ensures zero hardcoded credentials, least-privilege handling, and failsafe local execution.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

class AWSAdapter:
    def __init__(self):
        self.region = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
        self.enabled = os.getenv("FOGIQ_AWS_ENABLED", "false").lower() == "true"
        self.s3_bucket = os.getenv("FOGIQ_S3_BUCKET", "fog-iq-telemetry-datalake")
        self.dynamo_table = os.getenv("FOGIQ_DYNAMO_TABLE", "fog-iq-sensor-state")
        self.sns_topic_arn = os.getenv("FOGIQ_SNS_TOPIC_ARN", "")

        self._s3 = None
        self._dynamodb = None
        self._sns = None
        self.mode = "LOCAL_MODE"
        self.health_status = {
            "mode": "LOCAL_MODE",
            "aws_configured": False,
            "boto3_installed": BOTO3_AVAILABLE,
            "s3_connected": False,
            "dynamodb_connected": False,
            "sns_connected": False,
            "iot_core_connected": False,
            "last_check": datetime.utcnow().isoformat() + "Z"
        }

        self._verify_connection()

    def _verify_connection(self):
        if not self.enabled or not BOTO3_AVAILABLE:
            self.mode = "LOCAL_MODE"
            self.health_status["mode"] = "LOCAL_MODE"
            self.health_status["aws_configured"] = False
            return

        try:
            # Check STS caller identity without hardcoding
            sts = boto3.client("sts", region_name=self.region)
            caller = sts.get_caller_identity()
            self.health_status["aws_configured"] = True
            self.health_status["account_id"] = caller.get("Account")
            self.health_status["arn"] = caller.get("Arn")

            # Try S3
            self._s3 = boto3.client("s3", region_name=self.region)
            self._s3.list_buckets()
            self.health_status["s3_connected"] = True

            # Try DynamoDB
            self._dynamodb = boto3.resource("dynamodb", region_name=self.region)
            self.health_status["dynamodb_connected"] = True

            # Try SNS
            if self.sns_topic_arn:
                self._sns = boto3.client("sns", region_name=self.region)
                self.health_status["sns_connected"] = True

            self.mode = "AWS_MODE"
            self.health_status["mode"] = "AWS_MODE"
            print(f"[+] AWSAdapter connected in AWS_MODE (Account: {caller.get('Account')})")

        except (ClientError, NoCredentialsError, Exception) as e:
            self.mode = "LOCAL_MODE"
            self.health_status["mode"] = "LOCAL_MODE"
            self.health_status["aws_configured"] = False
            self.health_status["error"] = str(e)
            print(f"[*] AWS credentials not detected or service unavailable. Operating cleanly in LOCAL_MODE.")

    def get_status(self) -> Dict[str, Any]:
        self.health_status["last_check"] = datetime.utcnow().isoformat() + "Z"
        return self.health_status

    def persist_sensor_reading(self, reading: Dict[str, Any]) -> bool:
        """Persists reading to DynamoDB in AWS Mode or returns False for local storage."""
        if self.mode == "AWS_MODE" and self._dynamodb:
            try:
                table = self._dynamodb.Table(self.dynamo_table)
                item = {
                    "sensor_id": reading["sensor_id"],
                    "timestamp": reading.get("timestamp", datetime.utcnow().isoformat() + "Z"),
                    "speed_kmh": str(reading.get("current_speed", 0)),
                    "congestion_index": str(reading.get("congestion_index", 0)),
                    "corridor_id": reading.get("corridor_id", ""),
                    "operating_status": reading.get("operating_status", "NORMAL")
                }
                table.put_item(Item=item)
                return True
            except Exception as e:
                print(f"[!] DynamoDB write failed: {e}")
                return False
        return False

    def publish_alert(self, alert: Dict[str, Any]) -> bool:
        """Publishes critical incident alert to Amazon SNS topic if in AWS Mode."""
        if self.mode == "AWS_MODE" and self._sns and self.sns_topic_arn:
            try:
                subject = f"FOG-IQ Alert: {alert.get('severity', 'INCIDENT')} on {alert.get('corridor_id', 'Corridor')}"
                message = json.dumps(alert, indent=2)
                self._sns.publish(
                    TopicArn=self.sns_topic_arn,
                    Subject=subject[:100],
                    Message=message
                )
                return True
            except Exception as e:
                print(f"[!] SNS Publish failed: {e}")
                return False
        return False

aws_adapter = AWSAdapter()

