import json
import os
import decimal
from unittest.mock import patch, MagicMock

import pytest

os.environ.setdefault('TABLE_NAME', 'test-table')
os.environ.setdefault('TRACES_BUCKET', 'test-bucket')

from utils import load_handler
fetch = load_handler('fetch')


def _scan_result(items, last_key=None):
    result = {'Items': items}
    if last_key:
        result['LastEvaluatedKey'] = last_key
    return result


def _call(items):
    mock_table = MagicMock()
    mock_table.scan.return_value = _scan_result(items)
    with patch.object(fetch, 'ddb', mock_table):
        return fetch.lambda_handler({}, {})


class TestFiltering:
    def test_scan_uses_filter_expression(self):
        # Filtering delegated to DynamoDB — verify FilterExpression kwarg is passed.
        from boto3.dynamodb.conditions import ConditionBase
        mock_table = MagicMock()
        mock_table.scan.return_value = {'Items': []}
        with patch.object(fetch, 'ddb', mock_table):
            fetch.lambda_handler({}, {})
        _, kwargs = mock_table.scan.call_args
        assert isinstance(kwargs.get('FilterExpression'), ConditionBase)

    def test_empty_scan_result_returns_empty_list(self):
        # DynamoDB found no approved items.
        resp = _call([])
        assert json.loads(resp['body']) == []

    def test_all_scan_results_returned(self):
        # Whatever DynamoDB returns (post-filter) is passed through.
        resp = _call([
            {'submission_id': '1', 'status': 'approved'},
            {'submission_id': '2', 'status': 'approved'},
        ])
        items = json.loads(resp['body'])
        assert len(items) == 2


class TestContactEmailStripping:
    def test_strips_contact_email(self):
        resp = _call([
            {'submission_id': '1', 'status': 'approved', 'contact_email': 'secret@x.com'},
        ])
        items = json.loads(resp['body'])
        assert 'contact_email' not in items[0]

    def test_other_fields_preserved(self):
        resp = _call([
            {
                'submission_id': '1', 'status': 'approved',
                'model': 'TestNet', 'dataset': 'AhmedBody',
                'contact_email': 'secret@x.com',
            },
        ])
        item = json.loads(resp['body'])[0]
        assert item['model'] == 'TestNet'
        assert item['dataset'] == 'AhmedBody'
        assert 'contact_email' not in item


class TestDecimalSerialisation:
    def test_decimal_converted_to_float(self):
        resp = _call([
            {
                'submission_id': '1', 'status': 'approved',
                'surface_pressure_l1': decimal.Decimal('2.10'),
                'surface_pressure_l2': decimal.Decimal('3.00'),
                'r2_cd': decimal.Decimal('0.971'),
            },
        ])
        item = json.loads(resp['body'])[0]
        assert item['surface_pressure_l1'] == pytest.approx(2.10)
        assert item['surface_pressure_l2'] == pytest.approx(3.00)
        assert item['r2_cd'] == pytest.approx(0.971)


class TestPagination:
    def test_follows_last_evaluated_key(self):
        mock_table = MagicMock()
        mock_table.scan.side_effect = [
            _scan_result(
                [{'submission_id': '1', 'status': 'approved'}],
                last_key={'submission_id': '1'},
            ),
            _scan_result(
                [{'submission_id': '2', 'status': 'approved'}],
            ),
        ]
        with patch.object(fetch, 'ddb', mock_table):
            resp = fetch.lambda_handler({}, {})
        items = json.loads(resp['body'])
        assert len(items) == 2
        assert mock_table.scan.call_count == 2


class TestResponse:
    def test_status_200(self):
        resp = _call([])
        assert resp['statusCode'] == 200

    def test_content_type_header(self):
        resp = _call([])
        assert resp['headers']['Content-Type'] == 'application/json'

    def test_body_is_valid_json(self):
        resp = _call([{'submission_id': '1', 'status': 'approved'}])
        assert isinstance(json.loads(resp['body']), list)
