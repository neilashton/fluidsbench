import importlib.util
import os
from decimal import Decimal
from unittest.mock import patch, MagicMock

HERE = os.path.dirname(__file__)
FIXTURE = os.path.join(HERE, 'fixtures', 'carbench_index.html')


def _load_importer():
    """Load scripts/import_carbench.py by path (mirrors tests/utils.load_handler)."""
    path = os.path.join(HERE, '..', 'scripts', 'import_carbench.py')
    spec = importlib.util.spec_from_file_location('import_carbench', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ic = _load_importer()

# Fixed build options so submission_ids and timestamps are deterministic in tests.
OPTS = dict(
    dataset='DrivAerNet++',
    year=2025,
    paper_url='https://decode.mit.edu/carbench/',
    code_url='https://github.com/Mohamedelrefaie/CarBench',
    submitter_name='CarBench import',
    institution='MIT DECODE Lab',
    source='carbench-import',
    benchmark='CarBench',
    status='approved',
    now='2026-06-28T00:00:00Z',
)


def _html():
    with open(FIXTURE, encoding='utf-8') as handle:
        return handle.read()


def _no_floats(obj):
    """DynamoDB rejects float; assert every numeric is int or Decimal."""
    if isinstance(obj, float):
        return False
    if isinstance(obj, dict):
        return all(_no_floats(v) for v in obj.values())
    if isinstance(obj, list):
        return all(_no_floats(v) for v in obj)
    return True


class TestParsing:
    def test_extracts_eleven_rows(self):
        assert len(ic.extract_modeldata(_html())) == 11

    def test_unquoted_keys_and_values_parse(self):
        rows = ic.extract_modeldata(_html())
        first = rows[0]
        assert first['model'] == 'AB-UPT'
        assert first['family'] == 'Transformer'
        assert first['params'] == 6.01
        assert first['unc_l2'] == '±0.0024'

    def test_missing_array_raises(self):
        import pytest
        with pytest.raises(ValueError):
            ic.extract_modeldata('<html>no data here</html>')


class TestParseUnc:
    def test_strips_plus_minus(self):
        assert ic.parse_unc('±0.0024') == 0.0024

    def test_zero(self):
        assert ic.parse_unc('±0') == 0.0

    def test_empty_is_none(self):
        assert ic.parse_unc('') is None

    def test_none_is_none(self):
        assert ic.parse_unc(None) is None

    def test_garbage_is_none(self):
        assert ic.parse_unc('±abc') is None


class TestModelTypeMapping:
    def test_known_models(self):
        assert ic.map_model_type('AB-UPT', 'Transformer') == 'Transformer'
        assert ic.map_model_type('TripNet', 'Implicit') == 'Implicit field'
        assert ic.map_model_type('RegDGCNN', 'Geometric DL') == 'GNN'
        assert ic.map_model_type('PointNet', 'Geometric DL') == 'Point cloud'
        assert ic.map_model_type('PointMAE', 'Geometric DL') == 'Point cloud'

    def test_judgment_call_defaults(self):
        # Documented defaults; one-line overrides in scripts/import_carbench.py.
        assert ic.map_model_type('PointTransformer', 'Geometric DL') == 'Point cloud'
        assert ic.map_model_type('NeuralOperator', 'Neural Operator') == 'FNO'

    def test_unknown_model_falls_back_to_family(self):
        assert ic.map_model_type('FutureNet', 'Neural Operator') == 'Neural operator'
        assert ic.map_model_type('FutureNet', 'Transformer') == 'Transformer'

    def test_unknown_family_is_other(self):
        assert ic.map_model_type('Mystery', 'Whatever') == 'Other'


class TestBuildItem:
    def setup_method(self):
        self.items = ic.build_items(ic.extract_modeldata(_html()), **OPTS)
        self.ab = next(i for i in self.items if i['model'] == 'AB-UPT')

    def test_count(self):
        assert len(self.items) == 11

    def test_core_fields(self):
        assert self.ab['dataset'] == 'DrivAerNet++'
        assert self.ab['model_type'] == 'Transformer'
        assert self.ab['parameter_count'] == Decimal('6.01')
        assert self.ab['status'] == 'approved'
        assert self.ab['source'] == 'carbench-import'
        assert self.ab['benchmark'] == 'CarBench'
        assert self.ab['year'] == 2025
        assert self.ab['paper_url'] == 'https://decode.mit.edu/carbench/'
        assert self.ab['submission_date'] == '2026-06-28'

    def test_metric_values_and_std(self):
        m = self.ab['metrics']
        assert m['surface_pressure_rel_l2']['value'] == Decimal('0.1358')
        assert m['surface_pressure_rel_l2']['std'] == Decimal('0.0024')
        assert m['surface_pressure_r2']['value'] == Decimal('0.9675')
        assert m['surface_pressure_r2']['std'] == Decimal('0.0019')
        assert m['surface_pressure_mse']['value'] == Decimal('559')
        assert m['surface_pressure_rmse']['value'] == Decimal('23.6')
        assert m['inference_latency_ms']['value'] == Decimal('30.65')

    def test_metrics_without_uncertainty_have_no_std(self):
        m = self.ab['metrics']
        assert 'std' not in m['surface_pressure_mse']
        assert 'std' not in m['inference_latency_ms']

    def test_benchmark_can_be_omitted(self):
        opts = {**OPTS, 'benchmark': None}
        item = ic.build_items(ic.extract_modeldata(_html()), **opts)[0]
        assert 'benchmark' not in item

    def test_no_floats_anywhere(self):
        assert all(_no_floats(item) for item in self.items)

    def test_submission_id_is_deterministic(self):
        again = ic.build_items(ic.extract_modeldata(_html()), **OPTS)
        assert [i['submission_id'] for i in self.items] == [i['submission_id'] for i in again]

    def test_submission_id_unique_per_model(self):
        ids = [i['submission_id'] for i in self.items]
        assert len(set(ids)) == len(ids)


class TestMain:
    def test_dry_run_writes_nothing(self):
        with patch.object(ic, 'write_items', MagicMock()) as writer:
            rc = ic.main(['--source', 'file', '--file', FIXTURE, '--dry-run'])
        assert rc == 0
        writer.assert_not_called()

    def test_run_writes_items_to_env_table(self):
        with patch.object(ic, 'write_items', MagicMock()) as writer:
            rc = ic.main(['--source', 'file', '--file', FIXTURE, '--env', 'dev'])
        assert rc == 0
        writer.assert_called_once()
        items, table_name = writer.call_args[0]
        assert len(items) == 11
        assert table_name == 'fluidsbench-submissions-dev'

    def test_status_override(self):
        with patch.object(ic, 'write_items', MagicMock()) as writer:
            ic.main(['--source', 'file', '--file', FIXTURE, '--status', 'pending'])
        items, _ = writer.call_args[0]
        assert all(i['status'] == 'pending' for i in items)
