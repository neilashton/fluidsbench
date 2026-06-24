import json
import os
import decimal
import boto3
from boto3.dynamodb.conditions import Attr

TABLE = os.environ['TABLE_NAME']
ddb = boto3.resource('dynamodb').Table(TABLE)

HEADERS = {'Content-Type': 'application/json'}


def _decimal_default(o):
    if isinstance(o, decimal.Decimal):
        return float(o)
    raise TypeError


def lambda_handler(event, context):
    resp = ddb.scan(FilterExpression=Attr('status').eq('approved'))
    items = resp['Items']
    while 'LastEvaluatedKey' in resp:
        resp = ddb.scan(
            FilterExpression=Attr('status').eq('approved'),
            ExclusiveStartKey=resp['LastEvaluatedKey'],
        )
        items.extend(resp['Items'])

    for item in items:
        item.pop('contact_email', None)

    return {
        'statusCode': 200,
        'headers': HEADERS,
        'body': json.dumps(items, default=_decimal_default),
    }
