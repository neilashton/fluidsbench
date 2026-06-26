import json
import os
from unittest.mock import patch, MagicMock

import pytest

os.environ.setdefault('TABLE_NAME', 'test-table')
os.environ.setdefault('TRACES_BUCKET', 'test-bucket')

from utils import load_handler
submit = load_handler('submit')

VALID = {
    'model': 'TestNet',
    'model_type': 'GNN',
    'dataset': 'AhmedML',
    'surface_pressure_l2': 3.0,
    'surface_pressure_l1': 2.1,
    'surface_tau_l2': 3.8,
    'surface_tau_l1': 2.6,
    'volume_velocity_l2': 1.8,
    'volume_velocity_l1': 1.3,
    'volume_pressure_l2': 1.9,
    'volume_pressure_l1': 1.4,
    'r2_cd': 0.97,
    'r2_cl': 0.96,
    'velocity_profile_r2': 0.95,
    'cp_cut_r2': 0.94,
    'parameter_count': 1.2,
    'submitter_name': 'Dev User',
    'contact_email': 'dev@test.com',
}


def _event(body):
    return {'body': json.dumps(body)}


def _call(body, *, upload_url='https://s3.example.com/upload'):
    mock_table = MagicMock()
    mock_s3 = MagicMock()
    mock_s3.generate_presigned_url.return_value = upload_url
    with patch.object(submit, 'ddb', mock_table), patch.object(submit, 's3', mock_s3):
        resp = submit.lambda_handler(_event(body), {})
    return resp, mock_table, mock_s3


class TestValidSubmission:
    def test_returns_201(self):
        resp, _, _ = _call(VALID)
        assert resp['statusCode'] == 201

    def test_body_contains_submission_id_and_upload_url(self):
        resp, _, _ = _call(VALID)
        body = json.loads(resp['body'])
        assert 'submission_id' in body
        assert 'upload_url' in body

    def test_upload_url_from_presigned_call(self):
        url = 'https://s3.example.com/custom'
        resp, _, _ = _call(VALID, upload_url=url)
        assert json.loads(resp['body'])['upload_url'] == url

    def test_item_written_to_dynamodb(self):
        _, mock_table, _ = _call(VALID)
        mock_table.put_item.assert_called_once()
        item = mock_table.put_item.call_args[1]['Item']
        assert item['model'] == 'TestNet'
        assert item['status'] == 'pending'
        assert item['dataset'] == 'AhmedML'

    def test_status_set_to_pending(self):
        _, mock_table, _ = _call(VALID)
        item = mock_table.put_item.call_args[1]['Item']
        assert item['status'] == 'pending'

    def test_trace_key_uses_submission_id(self):
        resp, mock_table, mock_s3 = _call(VALID)
        submission_id = json.loads(resp['body'])['submission_id']
        item = mock_table.put_item.call_args[1]['Item']
        assert item['trace_file_key'] == f'traces/{submission_id}.zip'

    def test_presigned_url_uses_correct_bucket_and_key(self):
        resp, _, mock_s3 = _call(VALID)
        submission_id = json.loads(resp['body'])['submission_id']
        _, kwargs = mock_s3.generate_presigned_url.call_args
        params = kwargs['Params']
        assert params['Bucket'] == 'test-bucket'
        assert params['Key'] == f'traces/{submission_id}.zip'
        assert params['ContentType'] == 'application/zip'

    def test_submitted_at_present(self):
        _, mock_table, _ = _call(VALID)
        item = mock_table.put_item.call_args[1]['Item']
        assert 'submitted_at' in item
        assert item['submitted_at'].endswith('Z')
        assert item['submission_date'] == item['submitted_at'][:10]


class TestOptionalFields:
    def test_optional_fields_stored_when_provided(self):
        body = {**VALID, 'paper_url': 'https://arxiv.org/1', 'institution': 'MIT'}
        _, mock_table, _ = _call(body)
        item = mock_table.put_item.call_args[1]['Item']
        assert item['paper_url'] == 'https://arxiv.org/1'
        assert item['institution'] == 'MIT'

    def test_optional_fields_absent_when_not_provided(self):
        _, mock_table, _ = _call(VALID)
        item = mock_table.put_item.call_args[1]['Item']
        assert 'paper_url' not in item
        assert 'institution' not in item

    def test_contact_email_stored(self):
        _, mock_table, _ = _call(VALID)
        item = mock_table.put_item.call_args[1]['Item']
        assert item['contact_email'] == 'dev@test.com'


class TestMissingRequiredFields:
    @pytest.mark.parametrize('field', [
        'model', 'model_type', 'dataset',
        'surface_pressure_l2', 'surface_pressure_l1',
        'surface_tau_l2', 'surface_tau_l1',
        'volume_velocity_l2', 'volume_velocity_l1',
        'volume_pressure_l2', 'volume_pressure_l1',
        'r2_cd', 'r2_cl', 'velocity_profile_r2', 'cp_cut_r2',
        'parameter_count',
        'submitter_name', 'contact_email',
    ])
    def test_missing_field_returns_400(self, field):
        body = {k: v for k, v in VALID.items() if k != field}
        resp, mock_table, _ = _call(body)
        assert resp['statusCode'] == 400
        mock_table.put_item.assert_not_called()

    def test_error_body_names_missing_field(self):
        body = {k: v for k, v in VALID.items() if k != 'model'}
        resp, _, _ = _call(body)
        assert 'model' in json.loads(resp['body'])['error']


class TestValidation:
    def test_surface_pressure_l1_zero_is_accepted(self):
        resp, _, _ = _call({**VALID, 'surface_pressure_l1': 0})
        assert resp['statusCode'] == 201

    def test_surface_pressure_l1_negative_returns_400(self):
        resp, _, _ = _call({**VALID, 'surface_pressure_l1': -0.1})
        assert resp['statusCode'] == 400

    def test_r2_above_one_returns_400(self):
        resp, _, _ = _call({**VALID, 'r2_cd': 1.01})
        assert resp['statusCode'] == 400

    def test_r2_negative_is_accepted(self):
        resp, _, _ = _call({**VALID, 'r2_cd': -0.1})
        assert resp['statusCode'] == 201

    def test_r2_exactly_one_accepted(self):
        resp, _, _ = _call({**VALID, 'r2_cd': 1})
        assert resp['statusCode'] == 201

    def test_non_numeric_l1_returns_400(self):
        resp, _, _ = _call({**VALID, 'surface_pressure_l1': 'bad'})
        assert resp['statusCode'] == 400

    def test_invalid_json_body_returns_400(self):
        mock_table = MagicMock()
        mock_s3 = MagicMock()
        with patch.object(submit, 'ddb', mock_table), patch.object(submit, 's3', mock_s3):
            resp = submit.lambda_handler({'body': 'not-json'}, {})
        assert resp['statusCode'] == 400

    def test_missing_body_returns_400(self):
        mock_table = MagicMock()
        mock_s3 = MagicMock()
        with patch.object(submit, 'ddb', mock_table), patch.object(submit, 's3', mock_s3):
            resp = submit.lambda_handler({}, {})
        assert resp['statusCode'] == 400


class TestResponse:
    def test_content_type_header(self):
        resp, _, _ = _call(VALID)
        assert resp['headers']['Content-Type'] == 'application/json'

    def test_error_content_type_header(self):
        body = {k: v for k, v in VALID.items() if k != 'model'}
        resp, _, _ = _call(body)
        assert resp['headers']['Content-Type'] == 'application/json'
