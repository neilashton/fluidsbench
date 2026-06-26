# FluidsBench Leaderboard — Developer Workflow Guide

This guide covers how to develop, debug, and test the leaderboard backend
(`lambda/`, `infra/`) and frontend (`_pages/leaderboard.md`) without deploying
to the live site or requiring a merge to `main`.

---

## Prerequisites

| Tool        | Install                                                       | Verify                 |
| ----------- | ------------------------------------------------------------- | ---------------------- |
| Python 3.12 | `brew install python@3.12`                                    | `python3.12 --version` |
| AWS SAM CLI | `brew install aws-sam-cli`                                    | `sam --version`        |
| AWS CLI     | `brew install awscli`                                         | `aws --version`        |
| Docker      | [docker.com](https://www.docker.com/products/docker-desktop/) | `docker info`          |
| Ruby 3.3    | `brew install ruby@3.3`                                       | `ruby --version`       |
| direnv      | `brew install direnv`                                         | `direnv version`       |

AWS credentials use the `fluidsbench` named profile. Add your credentials to
`~/.aws/credentials` under `[fluidsbench]` (key shared by Astrid). Then set
`AWS_PROFILE=fluidsbench` in your shell or add it to your shell profile.

> **Note for Astrid only:** the `.envrc` sets `AWS_PROFILE=personal` (admin).
> Override for dev work: `export AWS_PROFILE=fluidsbench` in your session.

---

## Python virtual environment

All Python work (Lambda testing, scripts, seed data) runs in a local venv.
Create it once; activate it every session.

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install boto3 pytest
```

---

## Three-tier testing strategy

Pick the tier that matches your change. Start at Tier 1 before reaching for
Tier 2 or 3.

```
Tier 1 — Unit tests         no AWS, no Docker, runs in seconds
Tier 2 — Local emulation    Docker + real AWS dev resources
Tier 3 — Dev stack + CI     full browser test, isolated from prod
```

---

## Tier 1 — Unit tests

Test Lambda handlers as plain Python functions using mocks. No network, no
credentials, no AWS bill.

### Setup

```bash
source .venv/bin/activate
pip install pytest
```

### Write tests

Create `tests/test_fetch.py` and `tests/test_submit.py` alongside your handler:

```python
# tests/test_fetch.py
import json, os, importlib
from unittest.mock import patch, MagicMock

os.environ.update({'TABLE_NAME': 'test-table', 'TRACES_BUCKET': 'test-bucket'})
fetch = importlib.import_module('lambda.fetch.handler')

def test_returns_only_approved():
    mock_table = MagicMock()
    mock_table.scan.return_value = {'Items': [
        {'submission_id': '1', 'status': 'approved', 'contact_email': 'a@b.com'},
        {'submission_id': '2', 'status': 'pending'},
    ]}
    with patch.object(fetch, 'ddb', mock_table):
        resp = fetch.lambda_handler({}, {})
    items = json.loads(resp['body'])
    assert len(items) == 1
    assert items[0]['submission_id'] == '1'

def test_strips_contact_email():
    mock_table = MagicMock()
    mock_table.scan.return_value = {'Items': [
        {'submission_id': '1', 'status': 'approved', 'contact_email': 'secret@x.com'},
    ]}
    with patch.object(fetch, 'ddb', mock_table):
        resp = fetch.lambda_handler({}, {})
    items = json.loads(resp['body'])
    assert 'contact_email' not in items[0]
```

```python
# tests/test_submit.py
import json, os, importlib
from unittest.mock import patch, MagicMock

os.environ.update({'TABLE_NAME': 'test-table', 'TRACES_BUCKET': 'test-bucket'})
submit = importlib.import_module('lambda.submit.handler')

VALID_PAYLOAD = {
    'model': 'TestNet', 'model_type': 'GNN', 'dataset': 'AhmedML',
    'parameter_count': 1.2,
    'surface_pressure_l2': 3.0, 'surface_pressure_l1': 2.1,
    'surface_tau_l2': 3.8, 'surface_tau_l1': 2.6,
    'volume_velocity_l2': 1.8, 'volume_velocity_l1': 1.3,
    'volume_pressure_l2': 1.9, 'volume_pressure_l1': 1.4,
    'r2_cd': 0.97, 'r2_cl': 0.96,
    'velocity_profile_r2': 0.95, 'cp_cut_r2': 0.94,
    'submitter_name': 'Dev', 'contact_email': 'dev@test.com',
}

def _event(body):
    return {'body': json.dumps(body)}

def test_valid_submission_returns_201():
    mock_table = MagicMock()
    mock_s3 = MagicMock()
    mock_s3.generate_presigned_url.return_value = 'https://s3.example.com/upload'
    with patch.object(submit, 'ddb', mock_table), patch.object(submit, 's3', mock_s3):
        resp = submit.lambda_handler(_event(VALID_PAYLOAD), {})
    assert resp['statusCode'] == 201
    body = json.loads(resp['body'])
    assert 'submission_id' in body
    assert 'upload_url' in body

def test_missing_field_returns_400():
    payload = {**VALID_PAYLOAD}
    del payload['model']
    resp = submit.lambda_handler(_event(payload), {})
    assert resp['statusCode'] == 400

def test_invalid_l1_error_returns_400():
    payload = {**VALID_PAYLOAD, 'surface_pressure_l1': -1}
    resp = submit.lambda_handler(_event(payload), {})
    assert resp['statusCode'] == 400

def test_invalid_r2_returns_400():
    payload = {**VALID_PAYLOAD, 'r2_cd': 1.5}
    resp = submit.lambda_handler(_event(payload), {})
    assert resp['statusCode'] == 400
```

### Run

```bash
source .venv/bin/activate
pytest tests/ -v
```

**Good for:** validation logic, error paths, field stripping, any change to
handler business logic.

---

## Tier 2 — Local Lambda emulation

`sam local start-api` runs handlers inside a Lambda-compatible Docker container.
Calls go to real DynamoDB and S3 in the dev AWS account — no prod data touched.

### Prerequisites

- Docker running
- Dev stack deployed (see Tier 3 setup below)
- `AWS_PROFILE=fluidsbench` active (`export AWS_PROFILE=fluidsbench`)

### Create a local environment override file

```bash
cat > local-env.json << 'EOF'
{
  "FetchFunction": {
    "TABLE_NAME": "fluidsbench-submissions-dev",
    "TRACES_BUCKET": "fluidsbench-traces-dev"
  },
  "SubmitFunction": {
    "TABLE_NAME": "fluidsbench-submissions-dev",
    "TRACES_BUCKET": "fluidsbench-traces-dev"
  }
}
EOF
```

Add `local-env.json` to `.gitignore` — it is already excluded.

### Invoke handlers directly

The template uses Lambda Function URLs (not API Gateway), so `sam local start-api`
does not apply. Use `sam local invoke` to test individual handlers against real
dev DynamoDB/S3:

```bash
sam build --template infra/template.yaml

# Fetch
echo '{}' | sam local invoke FetchFunction \
  --template infra/template.yaml \
  --env-vars local-env.json

# Submit
python - << 'PY' | sam local invoke SubmitFunction \
  --template infra/template.yaml \
  --env-vars local-env.json
import json
payload = {
    'model': 'LocalTest', 'model_type': 'GNN', 'dataset': 'AhmedML',
    'parameter_count': 1.0,
    'surface_pressure_l2': 3.0, 'surface_pressure_l1': 2.1,
    'surface_tau_l2': 3.8, 'surface_tau_l1': 2.6,
    'volume_velocity_l2': 1.8, 'volume_velocity_l1': 1.3,
    'volume_pressure_l2': 1.9, 'volume_pressure_l1': 1.4,
    'r2_cd': 0.97, 'r2_cl': 0.96,
    'velocity_profile_r2': 0.95, 'cp_cut_r2': 0.94,
    'submitter_name': 'Dev', 'contact_email': 'dev@test.com',
}
print(json.dumps({'body': json.dumps(payload)}))
PY
```

### Browser testing

The leaderboard frontend uses the dev Lambda Function URLs automatically when
the page is served from `localhost` or `127.0.0.1`; deployed pages use the prod
URLs. No temporary URL edits are needed.

Run Jekyll (separate terminal):

```bash
export PATH="/opt/homebrew/opt/ruby@3.3/bin:/opt/homebrew/bin:$PATH"
source .venv/bin/activate
bundle exec jekyll serve --port 4000
open http://127.0.0.1:4000/leaderboards/
```

**Good for:** handler ↔ DynamoDB ↔ S3 integration, full request/response cycle,
debugging presigned URL generation.

---

## Tier 3 — Persistent dev stack + branch CI

A `fluidsbench-leaderboard-dev` CloudFormation stack mirrors prod but uses
separate resources (`fluidsbench-submissions-dev`, `fluidsbench-traces-dev`).
A GitHub Actions workflow redeploys it automatically on every push to a
non-`main` branch — no merge required, no Neil needed.

### One-time setup

> **Status (2026-06-23):** Steps 1–5 completed. Dev stack is live. Skip to
> [Day-to-day dev loop](#day-to-day-dev-loop) unless setting up from scratch.

**Step 1 — Extend OIDC trust to all branches** ✓ Done

By default the deploy role only trusts pushes to `main`. Widen it to any branch:

```bash
aws iam update-assume-role-policy \
  --role-name fluidsbench-github-deploy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::196723718079:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:neilashton/fluidsbench:ref:refs/heads/*"
        }
      }
    }]
  }' \
  --profile personal
```

> **Note:** this command requires admin (`personal` profile) — it modifies the IAM role trust policy.

**Step 2 — Add `deploy-dev.yml` workflow** ✓ Done

This workflow is already committed at `.github/workflows/deploy-dev.yml`.
It triggers on any push to a non-`main` branch that touches `infra/` or
`lambda/`, and deploys the dev stack automatically.

**Step 3 — Deploy dev stack manually for the first time** ✓ Done

```bash
sam build --template infra/template.yaml
AWS_PROFILE=fluidsbench sam deploy \
  --stack-name fluidsbench-leaderboard-dev \
  --parameter-overrides Environment=dev AllowedOrigin=https://fluidsbench.org \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --no-confirm-changeset
```

Dev stack outputs (deployed 2026-06-23):

| Output            | URL                                                                     |
| ----------------- | ----------------------------------------------------------------------- |
| FetchFunctionUrl  | `https://ezmaejyn7i7f4djjlgzqycukw40gjojx.lambda-url.us-east-1.on.aws/` |
| SubmitFunctionUrl | `https://aynbbamhdmpw5jbjdnwygs46qe0nbgwy.lambda-url.us-east-1.on.aws/` |

**Step 4 — Allow localhost CORS on dev resources** ✓ Done (re-run after each stack update)

Prod CORS is locked to `https://fluidsbench.org`. For local browser testing
against dev, add the local Jekyll origins to both Lambda Function URLs and the
trace upload bucket:

```bash
aws lambda update-function-url-config \
  --function-name fluidsbench-fetch-dev \
  --cors '{"AllowOrigins":["http://127.0.0.1:4000","http://localhost:4000","http://127.0.0.1:4001","http://localhost:4001","https://fluidsbench.org"],"AllowMethods":["GET"],"AllowHeaders":["*"]}' \
  --profile fluidsbench --region us-east-1

aws lambda update-function-url-config \
  --function-name fluidsbench-submit-dev \
  --cors '{"AllowOrigins":["http://127.0.0.1:4000","http://localhost:4000","http://127.0.0.1:4001","http://localhost:4001","https://fluidsbench.org"],"AllowMethods":["POST"],"AllowHeaders":["*"]}' \
  --profile fluidsbench --region us-east-1

aws s3api put-bucket-cors \
  --bucket fluidsbench-traces-dev \
  --cors-configuration '{"CORSRules":[{"AllowedOrigins":["http://127.0.0.1:4000","http://localhost:4000","http://127.0.0.1:4001","http://localhost:4001","https://fluidsbench.org"],"AllowedMethods":["GET","PUT"],"AllowedHeaders":["*"],"MaxAgeSeconds":3600}]}' \
  --profile fluidsbench --region us-east-1
```

> Note: CloudFormation overwrites CORS on the next SAM deploy — re-run Step 4 after any stack update.

**Step 5 — Seed dev data** ✓ Done

```bash
source .venv/bin/activate
AWS_PROFILE=fluidsbench AWS_DEFAULT_REGION=us-east-1 \
TABLE_NAME=fluidsbench-submissions-dev \
TRACES_BUCKET=fluidsbench-traces-dev \
  python scripts/seed.py
```

### Day-to-day dev loop

1. Edit handler or template.
2. Run Tier 1 tests (`pytest tests/ -v`) — fast feedback.
3. Push to feature branch → `deploy-dev.yml` updates dev stack automatically.
4. Run Jekyll locally and test the leaderboard page against the dev backend.
5. When ready: open PR to `main` → `validate-sam.yml` runs → Neil reviews → merge → prod deploys.

### Approve a dev submission via CLI

```bash
source .venv/bin/activate
AWS_DEFAULT_REGION=us-east-1 TABLE_NAME=fluidsbench-submissions-dev \
  python scripts/approve.py list

AWS_DEFAULT_REGION=us-east-1 TABLE_NAME=fluidsbench-submissions-dev \
  python scripts/approve.py approve <submission_id>
```

---

## When something goes wrong during merge

Merging to `main` triggers two automatic actions: GitHub Pages rebuilds the site,
and `deploy-backend.yml` redeploys the prod AWS stack. Both need to be addressed
when reverting.

### Step 1 — Revert the merge in git

Do **not** `git reset` on `main` — it rewrites shared history. Use a revert commit instead:

```bash
# Find the merge commit SHA
git log --oneline main | head -5

# Revert it (-m 1 keeps main's side of the merge)
git revert -m 1 <merge-commit-sha>
git push origin main
```

GitHub alternative: open the merged PR → click **Revert** → merge the generated revert PR.

Pushing the revert commit to `main` triggers `deploy-backend.yml` automatically —
prod infrastructure redeploys with the old Lambda code.

### Step 2 — If the AWS stack itself is broken

Redeploy from the last known-good commit:

```bash
git checkout <last-good-sha> -- infra/ lambda/
sam build --template infra/template.yaml
AWS_PROFILE=fluidsbench sam deploy \
  --stack-name fluidsbench-leaderboard \
  --parameter-overrides Environment=prod AllowedOrigin=https://fluidsbench.org \
  --region us-east-1 --capabilities CAPABILITY_IAM --resolve-s3 --no-confirm-changeset
```

Nuclear option — delete the prod stack entirely (leaderboard goes offline):

```bash
aws cloudformation delete-stack \
  --stack-name fluidsbench-leaderboard \
  --profile fluidsbench --region us-east-1
```

### Step 3 — If only the leaderboard page is broken

If the backend is fine but `_pages/leaderboard.md` is the problem, revert just
that file and push — GitHub Pages rebuilds on every push to `main`:

```bash
git revert -m 1 <merge-commit-sha> -- _pages/leaderboard.md
git push origin main
```

---

## Resource map

| Resource             | Dev                           | Prod                           |
| -------------------- | ----------------------------- | ------------------------------ |
| CloudFormation stack | `fluidsbench-leaderboard-dev` | `fluidsbench-leaderboard`      |
| DynamoDB table       | `fluidsbench-submissions-dev` | `fluidsbench-submissions-prod` |
| S3 bucket            | `fluidsbench-traces-dev`      | `fluidsbench-traces`           |
| Lambda — fetch       | `fluidsbench-fetch-dev`       | `fluidsbench-fetch`            |
| Lambda — submit      | `fluidsbench-submit-dev`      | `fluidsbench-submit`           |
| Deployed by          | push to any non-`main` branch | push to `main`                 |

---

## Quick reference

```bash
# Run unit tests
source .venv/bin/activate && pytest tests/ -v

# Build SAM
sam build --template infra/template.yaml

# Local Lambda invocation (Docker required)
echo '{}' | sam local invoke FetchFunction --template infra/template.yaml --env-vars local-env.json

# Deploy dev stack manually
AWS_PROFILE=fluidsbench sam deploy \
  --stack-name fluidsbench-leaderboard-dev \
  --parameter-overrides Environment=dev AllowedOrigin=https://fluidsbench.org \
  --region us-east-1 --capabilities CAPABILITY_IAM --resolve-s3 --no-confirm-changeset

# Run Jekyll locally
export PATH="/opt/homebrew/opt/ruby@3.3/bin:/opt/homebrew/bin:$PATH"
source .venv/bin/activate && bundle exec jekyll serve --port 4001

# Seed dev table
AWS_DEFAULT_REGION=us-east-1 TABLE_NAME=fluidsbench-submissions-dev \
TRACES_BUCKET=fluidsbench-traces-dev python scripts/seed.py

# List / approve pending submissions (dev)
AWS_DEFAULT_REGION=us-east-1 TABLE_NAME=fluidsbench-submissions-dev \
  python scripts/approve.py list
AWS_DEFAULT_REGION=us-east-1 TABLE_NAME=fluidsbench-submissions-dev \
  python scripts/approve.py approve <id>
```
