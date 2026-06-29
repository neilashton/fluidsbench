#!/usr/bin/env python3
"""Import CarBench leaderboard results into the FluidsBench DynamoDB table.

CarBench (https://decode.mit.edu/carbench/) publishes its leaderboard as an
embedded ``const modelData = [...]`` JavaScript array in the page HTML -- there is
no API. This script parses that array and writes one canonical leaderboard item
per model, using the flexible *metrics-map* schema:

    {
      "submission_id": <deterministic uuid5>,
      "dataset": "DrivAerNet++",
      "model": "AB-UPT",
      "model_type": "Transformer",
      "parameter_count": Decimal("6.01"),        # millions, top-level model property
      "metrics": {
        "surface_pressure_rel_l2": {"value": Decimal("0.1358"), "std": Decimal("0.0024")},
        "surface_pressure_r2":     {"value": Decimal("0.9675"), "std": Decimal("0.0019")},
        "surface_pressure_mse":    {"value": Decimal("559")},
        "surface_pressure_rmse":   {"value": Decimal("23.6")},
        "inference_latency_ms":    {"value": Decimal("30.65")},
      },
      "status": "approved", "source": "carbench-import", ...
    }

Metric ids and units are defined in ``_data/metrics.yml`` (the registry). Re-running
is idempotent: the submission_id is derived from (dataset, model), so a second run
updates the same items instead of creating duplicates -- this is the "refresh as
CarBench updates" path. Writes go straight to DynamoDB (like scripts/seed.py), NOT
through the public submit Lambda (which requires all CFD metrics and forces
status=pending).

Usage:
    python scripts/import_carbench.py --dry-run                 # parse + print, no writes
    python scripts/import_carbench.py --env dev                 # write to fluidsbench-submissions-dev
    python scripts/import_carbench.py --source file             # parse the bundled fixture offline
    AWS_PROFILE=fluidsbench python scripts/import_carbench.py --env dev
"""

import argparse
import json
import os
import re
import urllib.request
import uuid
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone

# --- Constants the CarBench author may want to edit -------------------------
CARBENCH_URL = 'https://decode.mit.edu/carbench/'
DATASET = 'DrivAerNet++'
DEFAULT_YEAR = 2025
DEFAULT_PAPER_URL = 'https://decode.mit.edu/carbench/'   # TODO: replace with the CarBench arXiv URL
DEFAULT_CODE_URL = 'https://github.com/Mohamedelrefaie/CarBench'
SUBMITTER_NAME = 'CarBench import'
INSTITUTION = 'MIT DECODE Lab'
SOURCE = 'carbench-import'        # provenance: how the row entered the table
BENCHMARK = 'CarBench'           # branded identity for the CarBench view within the shared board

# Offline fallback: the committed test fixture (real modelData, identical content).
DEFAULT_FILE = os.path.join(
    os.path.dirname(__file__), '..', 'tests', 'fixtures', 'carbench_index.html'
)

# --- model -> canonical model_type ------------------------------------------
# "Geometric DL" is heterogeneous, so map per model. The two judgment calls
# (marked) are easy one-line overrides for the author to confirm.
MODEL_TYPE = {
    'AB-UPT': 'Transformer',
    'TransolverLarge': 'Transformer',
    'Transolver': 'Transformer',
    'Transolver++': 'Transformer',
    'TripNet': 'Implicit field',
    'PointTransformer': 'Point cloud',   # judgment call: attention over points; could be 'Transformer'
    'RegDGCNN': 'GNN',                    # dynamic-graph CNN
    'PointNetLarge': 'Point cloud',
    'PointMAE': 'Point cloud',
    'NeuralOperator': 'FNO',             # judgment call: use 'Neural operator' if not specifically Fourier
    'PointNet': 'Point cloud',
}

# Fallback for models not in the table above, keyed by CarBench "family".
FAMILY_FALLBACK = {
    'Transformer': 'Transformer',
    'Geometric DL': 'Point cloud',
    'Implicit': 'Implicit field',
    'Neural Operator': 'Neural operator',
}


def map_model_type(model, family):
    """Map a CarBench (model, family) to the unified FluidsBench model_type enum."""
    if model in MODEL_TYPE:
        return MODEL_TYPE[model]
    return FAMILY_FALLBACK.get(family, 'Other')


def parse_unc(value):
    """Parse an uncertainty string like '±0.0024' into a float, or None."""
    if value is None:
        return None
    text = str(value).replace('±', '').replace('+', '').strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def to_decimal(value):
    """Convert a number to a finite Decimal (DynamoDB rejects floats)."""
    try:
        number = Decimal(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f'{value!r} is not numeric') from exc
    if not number.is_finite():
        raise ValueError(f'{value!r} is not finite')
    return number


def fetch_html(source, url, path):
    """Return the CarBench page HTML from the live URL or a local file."""
    if source == 'file':
        with open(path, encoding='utf-8') as handle:
            return handle.read()
    with urllib.request.urlopen(url, timeout=30) as resp:
        return resp.read().decode('utf-8')


def extract_modeldata(html):
    """Extract and parse the ``const modelData = [...]`` array from the page.

    The array is a JS object-literal list with unquoted keys and "±..." string
    values. We isolate it, quote the keys, strip any trailing commas, and json.loads.
    """
    match = re.search(r'const\s+modelData\s*=\s*(\[.*?\])\s*;', html, re.DOTALL)
    if not match:
        raise ValueError('Could not find `const modelData = [...]` in the page HTML.')
    body = match.group(1)
    body = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', body)  # quote keys
    body = re.sub(r',(\s*[}\]])', r'\1', body)                                  # strip trailing commas
    return json.loads(body)


def _metric(value, std=None):
    entry = {'value': to_decimal(value)}
    if std is not None:
        entry['std'] = to_decimal(std)
    return entry


def build_metrics(row):
    """Map one CarBench row to the canonical surface-pressure metrics map."""
    return {
        'surface_pressure_rel_l2': _metric(row['rel_l2'], parse_unc(row.get('unc_l2'))),
        'surface_pressure_r2': _metric(row['r2'], parse_unc(row.get('unc_r2'))),
        'surface_pressure_mse': _metric(row['mse']),
        'surface_pressure_rmse': _metric(row['rmse']),
        'inference_latency_ms': _metric(row['latency']),
    }


def build_item(row, *, dataset, year, paper_url, code_url,
               submitter_name, institution, source, status, now, benchmark=None):
    """Build one canonical DynamoDB item from a CarBench row."""
    model = str(row['model'])
    submission_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f'carbench:{dataset}:{model}'))
    item = {
        'submission_id': submission_id,
        'dataset': dataset,
        'model': model,
        'model_type': map_model_type(model, row.get('family', '')),
        'parameter_count': to_decimal(row['params']),
        'metrics': build_metrics(row),
        'year': int(year),
        'source': source,
        'submitter_name': submitter_name,
        'institution': institution,
        'status': status,
        'submitted_at': now,
        'submission_date': now[:10],
        'reviewed_at': now,
    }
    if benchmark:
        item['benchmark'] = benchmark
    if paper_url:
        item['paper_url'] = paper_url
    if code_url:
        item['code_url'] = code_url
    return item


def build_items(rows, **opts):
    return [build_item(row, **opts) for row in rows]


def write_items(items, table_name):
    """Write items to DynamoDB. boto3 is imported lazily so parsing/--dry-run need no creds."""
    import boto3
    table = boto3.resource('dynamodb').Table(table_name)
    for item in items:
        print(f"  put {item['model']:<18} ({item['dataset']})  id={item['submission_id']}")
        table.put_item(Item=item)


def parse_args(argv):
    parser = argparse.ArgumentParser(description='Import CarBench results into FluidsBench DynamoDB.')
    parser.add_argument('--source', choices=['url', 'file'], default='url',
                        help='Fetch the live CarBench page (url, default) or a local file.')
    parser.add_argument('--url', default=CARBENCH_URL, help='CarBench leaderboard URL.')
    parser.add_argument('--file', default=DEFAULT_FILE, help='Local HTML path when --source file.')
    parser.add_argument('--env', choices=['dev', 'prod'], default='dev',
                        help='Target environment -> table fluidsbench-submissions-<env>.')
    parser.add_argument('--table', default=None, help='Override the DynamoDB table name.')
    parser.add_argument('--status', choices=['approved', 'pending'], default='approved',
                        help='Status for imported rows (canonical published results default to approved).')
    parser.add_argument('--dataset', default=DATASET)
    parser.add_argument('--benchmark', default=BENCHMARK,
                        help="Benchmark label that brands these rows in the CarBench view ('' to omit).")
    parser.add_argument('--year', type=int, default=DEFAULT_YEAR)
    parser.add_argument('--paper-url', default=DEFAULT_PAPER_URL)
    parser.add_argument('--code-url', default=DEFAULT_CODE_URL)
    parser.add_argument('--dry-run', action='store_true', help='Parse and print items without writing.')
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    table_name = args.table or f'fluidsbench-submissions-{args.env}'

    html = fetch_html(args.source, args.url, args.file)
    rows = extract_modeldata(html)
    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    items = build_items(
        rows,
        dataset=args.dataset, year=args.year,
        paper_url=args.paper_url, code_url=args.code_url,
        submitter_name=SUBMITTER_NAME, institution=INSTITUTION,
        source=SOURCE, benchmark=args.benchmark, status=args.status, now=now,
    )

    print(f"Parsed {len(rows)} CarBench models -> {len(items)} items "
          f"for dataset '{args.dataset}' (status={args.status}).")

    if args.dry_run:
        print(json.dumps(items, indent=2, default=str))
        print(f"[dry-run] would write {len(items)} items to {table_name}. No changes made.")
        return 0

    write_items(items, table_name)
    print(f"Done. Wrote {len(items)} items to {table_name}.")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
