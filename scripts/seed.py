#!/usr/bin/env python3
"""Seed DynamoDB with one approved test entry and upload a placeholder trace zip."""

import io
import os
import uuid
import zipfile
from datetime import datetime, timezone

import boto3

TABLE_NAME = os.environ.get('TABLE_NAME', 'fluidsbench-submissions-dev')
TRACES_BUCKET = os.environ.get('TRACES_BUCKET', 'fluidsbench-traces')


def main():
    ddb = boto3.resource('dynamodb').Table(TABLE_NAME)
    s3 = boto3.client('s3')

    submission_id = str(uuid.uuid4())
    trace_key = f'traces/{submission_id}.zip'
    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    # Build a minimal placeholder zip in memory
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w') as zf:
        zf.writestr('README.txt', 'Placeholder trace file for seed data.')
    buf.seek(0)

    print(f'Uploading placeholder trace to s3://{TRACES_BUCKET}/{trace_key} ...')
    s3.put_object(
        Bucket=TRACES_BUCKET,
        Key=trace_key,
        Body=buf.read(),
        ContentType='application/zip',
    )

    item = {
        'submission_id': submission_id,
        'model': 'FlowNet-GNN',
        'model_type': 'GNN',
        'dataset': 'AhmedBody',
        'target_variable': 'pressure',
        'l1_error': '0.0421',
        'r2_score': '0.971',
        'num_parameters': '2.3M',
        'year': 2024,
        'paper_url': 'https://arxiv.org/abs/2401.00000',
        'code_url': 'https://github.com/example/flownet-gnn',
        'submitter_name': 'Seed Script',
        'contact_email': 'seed@fluidsbench.org',
        'institution': 'FluidsBench',
        'trace_file_key': trace_key,
        'status': 'approved',
        'submitted_at': now,
        'reviewed_at': now,
    }

    print(f'Inserting seed entry (id={submission_id}) into {TABLE_NAME} ...')
    ddb.put_item(Item=item)
    print('Done. Seed entry inserted with status=approved.')


if __name__ == '__main__':
    main()
