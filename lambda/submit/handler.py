import json
import os
import uuid
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone

import boto3

TABLE = os.environ['TABLE_NAME']
TRACES_BUCKET = os.environ['TRACES_BUCKET']
ddb = boto3.resource('dynamodb').Table(TABLE)
s3 = boto3.client('s3')

HEADERS = {'Content-Type': 'application/json'}

REQUIRED_FIELDS = [
    'model',
    'model_type',
    'dataset',
    'parameter_count',
    'submitter_name',
    'contact_email',
    'surface_pressure_l2',
    'surface_pressure_l1',
    'surface_tau_l2',
    'surface_tau_l1',
    'volume_velocity_l2',
    'volume_velocity_l1',
    'volume_pressure_l2',
    'volume_pressure_l1',
    'r2_cd',
    'r2_cl',
    'velocity_profile_r2',
    'cp_cut_r2',
]

ERROR_FIELDS = [
    'surface_pressure_l2',
    'surface_pressure_l1',
    'surface_tau_l2',
    'surface_tau_l1',
    'volume_velocity_l2',
    'volume_velocity_l1',
    'volume_pressure_l2',
    'volume_pressure_l1',
]

R2_FIELDS = ['r2_cd', 'r2_cl', 'velocity_profile_r2', 'cp_cut_r2']


def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        return _error(400, 'Request body must be valid JSON.')

    missing = [f for f in REQUIRED_FIELDS if not body.get(f) and body.get(f) != 0]
    if missing:
        return _error(400, f"Missing required fields: {', '.join(missing)}")

    try:
        metrics = {field: _decimal(body[field]) for field in ERROR_FIELDS + R2_FIELDS}
        parameter_count = _decimal(body['parameter_count'])
    except (ValueError, TypeError) as exc:
        return _error(400, f'Invalid numeric value: {exc}')

    if parameter_count < 0:
        return _error(400, 'parameter_count must be >= 0.')
    for field in ERROR_FIELDS:
        if metrics[field] < 0:
            return _error(400, f'{field} must be >= 0.')
    for field in R2_FIELDS:
        if metrics[field] > 1:
            return _error(400, f'{field} must be <= 1.')

    submission_id = str(uuid.uuid4())
    trace_file_key = f'traces/{submission_id}.zip'
    submitted_at = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    submission_date = submitted_at[:10]

    item = {
        'submission_id': submission_id,
        'model': str(body['model']),
        'model_type': str(body['model_type']),
        'dataset': str(body['dataset']),
        'parameter_count': parameter_count,
        'submitter_name': str(body['submitter_name']),
        'contact_email': str(body['contact_email']),
        'trace_file_key': trace_file_key,
        'status': 'pending',
        'submitted_at': submitted_at,
        'submission_date': submission_date,
        **metrics,
    }
    for optional in ('paper_url', 'code_url', 'institution', 'details_url'):
        if body.get(optional):
            item[optional] = str(body[optional])

    ddb.put_item(Item=item)

    upload_url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': TRACES_BUCKET,
            'Key': trace_file_key,
            'ContentType': 'application/zip',
        },
        ExpiresIn=900,
    )

    return {
        'statusCode': 201,
        'headers': HEADERS,
        'body': json.dumps({'submission_id': submission_id, 'upload_url': upload_url}),
    }


def _error(status, message):
    return {
        'statusCode': status,
        'headers': HEADERS,
        'body': json.dumps({'error': message}),
    }


def _decimal(value):
    try:
        number = Decimal(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f'{value!r} is not numeric') from exc
    if not number.is_finite():
        raise ValueError(f'{value!r} is not finite')
    return number
