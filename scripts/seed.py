#!/usr/bin/env python3
"""Seed DynamoDB with one approved test entry and upload a placeholder trace zip."""

import io
import os
import uuid
import zipfile
from decimal import Decimal
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
        'model': 'AB-UPT',
        'model_type': 'Transformer',
        'dataset': 'AhmedML',
        'surface_pressure_l2': Decimal('3.00'),
        'surface_pressure_l1': Decimal('2.16'),
        'surface_tau_l2': Decimal('3.88'),
        'surface_tau_l1': Decimal('2.64'),
        'volume_velocity_l2': Decimal('1.88'),
        'volume_velocity_l1': Decimal('1.32'),
        'volume_pressure_l2': Decimal('1.98'),
        'volume_pressure_l1': Decimal('1.37'),
        'r2_cd': Decimal('0.993'),
        'r2_cl': Decimal('0.987'),
        'velocity_profile_r2': Decimal('0.982'),
        'cp_cut_r2': Decimal('0.976'),
        'parameter_count': Decimal('8.75'),
        'paper_url': 'https://arxiv.org/abs/2502.09692',
        'code_url': 'https://github.com/example/ab-upt',
        'submitter_name': 'Seed Script',
        'contact_email': 'seed@fluidsbench.org',
        'institution': 'FluidsBench',
        'trace_file_key': trace_key,
        'status': 'approved',
        'submitted_at': now,
        'submission_date': now[:10],
        'reviewed_at': now,
    }

    print(f'Inserting seed entry (id={submission_id}) into {TABLE_NAME} ...')
    ddb.put_item(Item=item)
    print('Done. Seed entry inserted with status=approved.')


if __name__ == '__main__':
    main()
