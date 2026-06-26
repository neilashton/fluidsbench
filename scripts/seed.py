#!/usr/bin/env python3
"""Seed DynamoDB with approved test entries and upload placeholder trace zips."""

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

    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    for item in seed_items(now):
        submission_id = item['submission_id']
        trace_key = item['trace_file_key']

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, 'w') as zf:
            zf.writestr('README.txt', f'Placeholder trace file for {item["dataset"]} seed data.')
        buf.seek(0)

        print(f'Uploading placeholder trace to s3://{TRACES_BUCKET}/{trace_key} ...')
        s3.put_object(
            Bucket=TRACES_BUCKET,
            Key=trace_key,
            Body=buf.read(),
            ContentType='application/zip',
        )

        print(f'Inserting {item["dataset"]} seed entry (id={submission_id}) into {TABLE_NAME} ...')
        ddb.put_item(Item=item)
    print('Done. Seed entries inserted with status=approved.')


def seed_items(now):
    common = {
        'model': 'AB-UPT',
        'model_type': 'Transformer',
        'parameter_count': Decimal('8.75'),
        'submitter_name': 'Seed Script',
        'contact_email': 'seed@fluidsbench.org',
        'institution': 'FluidsBench',
        'status': 'approved',
        'submitted_at': now,
        'submission_date': now[:10],
        'reviewed_at': now,
    }

    rows = [
        {
            'dataset': 'AhmedML',
            'paper_url': 'https://arxiv.org/abs/2502.09692',
            'code_url': 'https://github.com/example/ab-upt',
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
        },
        {
            'dataset': 'DrivAerML',
            'paper_url': 'https://arxiv.org/abs/2502.09692',
            'code_url': 'https://github.com/example/ab-upt',
            'surface_pressure_l2': Decimal('3.82'),
            'surface_pressure_l1': Decimal('2.75'),
            'surface_tau_l2': Decimal('7.29'),
            'surface_tau_l1': Decimal('4.96'),
            'volume_velocity_l2': Decimal('5.93'),
            'volume_velocity_l1': Decimal('4.15'),
            'volume_pressure_l2': Decimal('6.08'),
            'volume_pressure_l1': Decimal('4.20'),
            'r2_cd': Decimal('0.991'),
            'r2_cl': Decimal('0.984'),
            'velocity_profile_r2': Decimal('0.970'),
            'cp_cut_r2': Decimal('0.968'),
        },
        {
            'dataset': 'WindsorML',
            'paper_url': 'https://arxiv.org/abs/2407.19320',
            'surface_pressure_l2': Decimal('4.10'),
            'surface_pressure_l1': Decimal('2.95'),
            'surface_tau_l2': Decimal('6.85'),
            'surface_tau_l1': Decimal('4.66'),
            'volume_velocity_l2': Decimal('4.35'),
            'volume_velocity_l1': Decimal('3.05'),
            'volume_pressure_l2': Decimal('4.80'),
            'volume_pressure_l1': Decimal('3.31'),
            'r2_cd': Decimal('0.989'),
            'r2_cl': Decimal('0.982'),
            'velocity_profile_r2': Decimal('0.966'),
            'cp_cut_r2': Decimal('0.964'),
        },
        {
            'model': 'GeoTransolver (full split)',
            'model_type': 'Transformer',
            'dataset': 'HiLiftAeroML',
            'parameter_count': Decimal('9.05'),
            'paper_url': 'https://arxiv.org/abs/2605.19565',
            'surface_pressure_l2': Decimal('8.84'),
            'surface_pressure_l1': Decimal('6.36'),
            'surface_tau_l2': Decimal('11.09'),
            'surface_tau_l1': Decimal('7.54'),
            'volume_velocity_l2': Decimal('8.78'),
            'volume_velocity_l1': Decimal('6.15'),
            'volume_pressure_l2': Decimal('8.06'),
            'volume_pressure_l1': Decimal('5.56'),
            'r2_cd': Decimal('0.995'),
            'r2_cl': Decimal('0.992'),
            'velocity_profile_r2': Decimal('0.940'),
            'cp_cut_r2': Decimal('0.952'),
        },
    ]

    items = []
    for row in rows:
        submission_id = str(uuid.uuid4())
        items.append({
            **common,
            **row,
            'submission_id': submission_id,
            'trace_file_key': f'traces/{submission_id}.zip',
        })
    return items


if __name__ == '__main__':
    main()
