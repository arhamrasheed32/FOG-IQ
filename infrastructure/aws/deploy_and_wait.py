import boto3
import time

def check_stack():
    cf = boto3.client('cloudformation', region_name='us-east-1')
    stack_name = 'fog-iq-production-stack'
    print(f"[*] Checking CloudFormation status for {stack_name}...")

    seen = set()
    while True:
        try:
            events = cf.describe_stack_events(StackName=stack_name)['StackEvents']
            for ev in reversed(events):
                eid = ev['EventId']
                if eid not in seen:
                    seen.add(eid)
                    reason = f" - {ev.get('ResourceStatusReason')}" if ev.get('ResourceStatusReason') else ""
                    print(f"  [{ev['LogicalResourceId']}] {ev['ResourceStatus']}{reason}")

            stacks = cf.describe_stacks(StackName=stack_name)['Stacks']
            status = stacks[0]['StackStatus']
            if status in ['CREATE_COMPLETE', 'UPDATE_COMPLETE']:
                print(f"\n[+] Stack reached {status} successfully!")
                print("[+] Stack Outputs:")
                for out in stacks[0].get('Outputs', []):
                    print(f"    {out['OutputKey']}: {out['OutputValue']}")
                return True
            elif 'FAILED' in status or 'ROLLBACK' in status:
                print(f"\n[!] Stack entered {status}!")
                return False
        except Exception as e:
            print(f"Error checking stack: {e}")
            return False
        time.sleep(5)

if __name__ == '__main__':
    check_stack()

