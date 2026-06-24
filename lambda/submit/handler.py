import json
import os
import uuid
from datetime import datetime, timezone

import boto3

TABLE = os.environ['TABLE_NAME']
TRACES_BUCKET = os.environ['TRACES_BUCKET']
ddb = boto3.resource('dynamodb').Table(TABLE)
s3 = boto3.client('s3')

HEADERS = {'Content-Type': 'application/json'}

REQUIRED_FIELDS = [
    'model', 'model_type', 'dataset', 'target_variable',
    'l1_error', 'r2_score', 'num_parameters', 'year',
    'submitter_name', 'contact_email',
]


def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        return _error(400, 'Request body must be valid JSON.')

    missing = [f for f in REQUIRED_FIELDS if not body.get(f) and body.get(f) != 0]
    if missing:
        return _error(400, f"Missing required fields: {', '.join(missing)}")

    try:
        l1_error = float(body['l1_error'])
        r2_score = float(body['r2_score'])
        year = int(body['year'])
    except (ValueError, TypeError) as exc:
        return _error(400, f'Invalid numeric value: {exc}')

    if l1_error <= 0:
        return _error(400, 'l1_error must be > 0.')
    if not (0 <= r2_score <= 1):
        return _error(400, 'r2_score must be between 0 and 1.')

    submission_id = str(uuid.uuid4())
    trace_file_key = f'traces/{submission_id}.zip'
    submitted_at = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    item = {
        'submission_id': submission_id,
        'model': str(body['model']),
        'model_type': str(body['model_type']),
        'dataset': str(body['dataset']),
        'target_variable': str(body['target_variable']),
        'l1_error': str(l1_error),
        'r2_score': str(r2_score),
        'num_parameters': str(body['num_parameters']),
        'year': year,
        'submitter_name': str(body['submitter_name']),
        'contact_email': str(body['contact_email']),
        'trace_file_key': trace_file_key,
        'status': 'pending',
        'submitted_at': submitted_at,
    }
    for optional in ('paper_url', 'code_url', 'institution'):
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
