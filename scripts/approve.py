#!/usr/bin/env python3
"""Approval CLI for FluidsBench submissions.

Usage:
  python scripts/approve.py list
  python scripts/approve.py approve <submission_id>
  python scripts/approve.py reject <submission_id> [--note "reason"]
"""

import argparse
import os
import sys
from datetime import datetime, timezone

import boto3

TABLE_NAME = os.environ.get('TABLE_NAME', 'fluidsbench-submissions-dev')


def get_table():
    return boto3.resource('dynamodb').Table(TABLE_NAME)


def cmd_list(args):
    table = get_table()
    resp = table.scan()
    items = resp['Items']
    while 'LastEvaluatedKey' in resp:
        resp = table.scan(ExclusiveStartKey=resp['LastEvaluatedKey'])
        items.extend(resp['Items'])

    pending = [i for i in items if i.get('status') == 'pending']
    if not pending:
        print('No pending submissions.')
        return

    fmt = '{:<38} {:<20} {:<20} {:<20} {}'
    print(fmt.format('ID', 'Model', 'Dataset', 'Submitter', 'Date'))
    print('-' * 110)
    for item in pending:
        print(fmt.format(
            item.get('submission_id', ''),
            item.get('model', '')[:18],
            item.get('dataset', '')[:18],
            item.get('submitter_name', '')[:18],
            item.get('submitted_at', ''),
        ))


def cmd_approve(args):
    table = get_table()
    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    table.update_item(
        Key={'submission_id': args.submission_id},
        UpdateExpression='SET #s = :approved, reviewed_at = :now',
        ExpressionAttributeNames={'#s': 'status'},
        ExpressionAttributeValues={':approved': 'approved', ':now': now},
    )
    print(f'Approved: {args.submission_id}')


def cmd_reject(args):
    table = get_table()
    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    expr = 'SET #s = :rejected, reviewed_at = :now'
    vals = {':rejected': 'rejected', ':now': now}
    if args.note:
        expr += ', rejection_note = :note'
        vals[':note'] = args.note
    table.update_item(
        Key={'submission_id': args.submission_id},
        UpdateExpression=expr,
        ExpressionAttributeNames={'#s': 'status'},
        ExpressionAttributeValues=vals,
    )
    print(f'Rejected: {args.submission_id}')


def main():
    parser = argparse.ArgumentParser(description='FluidsBench submission approval CLI')
    parser.add_argument('--table', help='DynamoDB table name (overrides TABLE_NAME env var)')
    sub = parser.add_subparsers(dest='command')

    sub.add_parser('list', help='List pending submissions')

    p_approve = sub.add_parser('approve', help='Approve a submission')
    p_approve.add_argument('submission_id')

    p_reject = sub.add_parser('reject', help='Reject a submission')
    p_reject.add_argument('submission_id')
    p_reject.add_argument('--note', help='Rejection reason')

    args = parser.parse_args()

    if args.table:
        global TABLE_NAME
        TABLE_NAME = args.table

    if args.command == 'list':
        cmd_list(args)
    elif args.command == 'approve':
        cmd_approve(args)
    elif args.command == 'reject':
        cmd_reject(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
