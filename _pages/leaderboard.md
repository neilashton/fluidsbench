---
layout: page
permalink: /leaderboards/
title: leaderboards
description:
nav: true
nav_order: 6
---

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css">

<style>
  .skeleton { background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 4px; }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .skeleton-row td { padding: 0.75rem 0.5rem; }
  .skeleton-cell { height: 1rem; display: block; }
  #leaderboard-chart-container { max-height: 320px; }
  .modal-body .progress { height: 1.5rem; }
  .step-panel { display: none; }
  .step-panel.active { display: block; }
  #submission-error, #upload-error { display: none; }
</style>

<div class="container-fluid px-0">

  <div class="d-flex justify-content-between align-items-center mb-3">
    <div>
      <label for="dataset-select" class="form-label mb-0 me-2 fw-semibold">Dataset:</label>
      <select id="dataset-select" class="form-select form-select-sm d-inline-block w-auto">
        <option value="">Loading…</option>
      </select>
    </div>
    <button class="btn btn-primary" id="submit-btn" disabled>
      <i class="bi bi-plus-circle me-1"></i>Submit Result
    </button>
  </div>

  <div id="leaderboard-chart-container" class="mb-4">
    <canvas id="leaderboard-chart"></canvas>
  </div>

  <div class="table-responsive">
    <table class="table table-hover table-sm align-middle" id="leaderboard-table">
      <thead class="table-dark">
        <tr>
          <th>#</th>
          <th>Model</th>
          <th>Type</th>
          <th>Dataset</th>
          <th>Target</th>
          <th>L1 Error ↑</th>
          <th>R²</th>
          <th>Params</th>
          <th>Year</th>
          <th>Links</th>
        </tr>
      </thead>
      <tbody id="leaderboard-body">
        {% for i in (1..6) %}
        <tr class="skeleton-row">
          {% for j in (1..10) %}
          <td><span class="skeleton skeleton-cell" style="width: {{ 40 | plus: j | times: 8 }}%;"></span></td>
          {% endfor %}
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>

  <div id="fetch-error" class="alert alert-danger mt-3" style="display:none;"></div>
</div>

<!-- Submit Modal -->
<div class="modal fade" id="submitModal" tabindex="-1" aria-labelledby="submitModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="submitModalLabel">Submit Result</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

        <!-- Step indicator -->
        <div class="d-flex align-items-center mb-4">
          <span id="step-indicator-1" class="badge bg-primary me-2">1</span>
          <span class="me-3">Metadata</span>
          <span id="step-indicator-2" class="badge bg-secondary me-2">2</span>
          <span>Upload Trace</span>
        </div>

        <!-- Step 1 -->
        <div id="step1-panel" class="step-panel active">
          <form id="submit-form" novalidate>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Model Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="f-model" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Model Type <span class="text-danger">*</span></label>
                <select class="form-select" id="f-model-type" required>
                  <option value="">Select…</option>
                  <option>GNN</option>
                  <option>Transolver</option>
                  <option>PointNet++</option>
                  <option>CNN</option>
                  <option>FNO</option>
                  <option>Other</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Dataset <span class="text-danger">*</span></label>
                <select class="form-select" id="f-dataset" required>
                  <option value="">Select…</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Target Variable <span class="text-danger">*</span></label>
                <select class="form-select" id="f-target" required>
                  <option value="">Select…</option>
                  <option>pressure</option>
                  <option>velocity</option>
                  <option>wss</option>
                  <option>other</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">L1 Error <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="f-l1" min="0" step="any" required>
              </div>
              <div class="col-md-4">
                <label class="form-label">R² Score <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="f-r2" min="0" max="1" step="any" required>
              </div>
              <div class="col-md-4">
                <label class="form-label">Parameters <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="f-params" placeholder="e.g. 4.2M" required>
              </div>
              <div class="col-md-3">
                <label class="form-label">Year <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="f-year" min="2000" max="2099" required>
              </div>
              <div class="col-md-9">
                <label class="form-label">Paper URL</label>
                <input type="url" class="form-control" id="f-paper-url">
              </div>
              <div class="col-12">
                <label class="form-label">Code / GitHub URL</label>
                <input type="url" class="form-control" id="f-code-url">
              </div>
              <div class="col-md-6">
                <label class="form-label">Submitter Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="f-name" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Institution</label>
                <input type="text" class="form-control" id="f-institution">
              </div>
              <div class="col-md-6">
                <label class="form-label">Contact Email <span class="text-danger">*</span></label>
                <input type="email" class="form-control" id="f-email" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Trace File (.zip) <span class="text-danger">*</span></label>
                <input type="file" class="form-control" id="f-trace" accept=".zip" required>
              </div>
            </div>
          </form>
          <div id="submission-error" class="alert alert-danger mt-3"></div>
        </div>

        <!-- Step 2 -->
        <div id="step2-panel" class="step-panel">
          <p class="mb-2">Uploading trace file: <strong id="upload-filename"></strong></p>
          <div class="progress mb-3">
            <div id="upload-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated"
                 role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
          </div>
          <div id="upload-success" class="alert alert-success" style="display:none;">
            Your submission has been received and is under review.
          </div>
          <div id="upload-error" class="alert alert-danger"></div>
        </div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" id="next-btn">
          Next <i class="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js"></script>

<script>

// prod urls
const FETCH_URL = 'https://7qdywdyxlfmc7neivnarewbvpy0gkjvg.lambda-url.us-east-1.on.aws/';
const SUBMIT_URL = 'https://vjfjkk3bwskka2qezpzksof3s40cpowl.lambda-url.us-east-1.on.aws/';

// dev urls
// const FETCH_URL  = 'https://ezmaejyn7i7f4djjlgzqycukw40gjojx.lambda-url.us-east-1.on.aws/';
// const SUBMIT_URL = 'https://aynbbamhdmpw5jbjdnwygs46qe0nbgwy.lambda-url.us-east-1.on.aws/';

let allEntries = [];
let chartInstance = null;

function skeletonRows() {
  return Array.from({length: 6}, () =>
    '<tr class="skeleton-row">' +
    Array.from({length: 10}, (_, i) =>
      `<td><span class="skeleton skeleton-cell" style="width:${40 + i * 6}%"></span></td>`
    ).join('') +
    '</tr>'
  ).join('');
}

function renderTable(dataset) {
  const body = document.getElementById('leaderboard-body');
  const rows = allEntries.filter(e => !dataset || e.dataset === dataset);
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">No approved entries yet.</td></tr>';
    return;
  }
  rows.sort((a, b) => parseFloat(a.l1_error) - parseFloat(b.l1_error));
  body.innerHTML = rows.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(e.model)}</td>
      <td><span class="badge bg-secondary">${esc(e.model_type || '')}</span></td>
      <td>${esc(e.dataset)}</td>
      <td>${esc(e.target_variable || '')}</td>
      <td>${Number(e.l1_error).toFixed(4)}</td>
      <td>${e.r2_score != null ? Number(e.r2_score).toFixed(4) : '—'}</td>
      <td>${esc(e.num_parameters || '—')}</td>
      <td>${e.year || '—'}</td>
      <td>
        ${e.paper_url ? `<a href="${esc(e.paper_url)}" target="_blank" rel="noopener" title="Paper"><i class="bi bi-file-earmark-text"></i></a> ` : ''}
        ${e.code_url ? `<a href="${esc(e.code_url)}" target="_blank" rel="noopener" title="Code"><i class="bi bi-github"></i></a>` : ''}
      </td>
    </tr>
  `).join('');
}

function renderChart(dataset) {
  const rows = allEntries.filter(e => !dataset || e.dataset === dataset)
    .sort((a, b) => parseFloat(a.l1_error) - parseFloat(b.l1_error));
  const labels = rows.map(e => e.model);
  const values = rows.map(e => parseFloat(e.l1_error));
  if (chartInstance) chartInstance.destroy();
  const ctx = document.getElementById('leaderboard-chart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'L1 Error',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, title: { display: true, text: `L1 Error by Model${dataset ? ' — ' + dataset : ''}` } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'L1 Error' } } }
    }
  });
}

function populateDatasetSelects(entries) {
  const datasets = [...new Set(entries.map(e => e.dataset))].sort();
  const sel = document.getElementById('dataset-select');
  const fSel = document.getElementById('f-dataset');
  sel.innerHTML = datasets.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
  fSel.innerHTML = '<option value="">Select…</option>' +
    datasets.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadLeaderboard() {
  try {
    const resp = await fetch(FETCH_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
    allEntries = await resp.json();
    populateDatasetSelects(allEntries);
    const firstDataset = allEntries.length ? allEntries[0].dataset : '';
    document.getElementById('dataset-select').value = firstDataset;
    renderTable(firstDataset);
    renderChart(firstDataset);
    document.getElementById('submit-btn').disabled = false;
  } catch (err) {
    document.getElementById('leaderboard-body').innerHTML =
      '<tr><td colspan="10" class="text-center text-danger py-4">Failed to load data.</td></tr>';
    const errEl = document.getElementById('fetch-error');
    errEl.textContent = `Error loading leaderboard: ${err.message}`;
    errEl.style.display = 'block';
    document.getElementById('submit-btn').disabled = false;
  }
}

document.getElementById('dataset-select').addEventListener('change', function() {
  renderTable(this.value);
  renderChart(this.value);
});

// Modal state
let uploadFile = null;
let currentSubmissionId = null;
let currentUploadUrl = null;

const submitModal = new bootstrap.Modal(document.getElementById('submitModal'));

document.getElementById('submit-btn').addEventListener('click', () => {
  resetModal();
  submitModal.show();
});

function resetModal() {
  document.getElementById('step1-panel').classList.add('active');
  document.getElementById('step2-panel').classList.remove('active');
  document.getElementById('step-indicator-1').className = 'badge bg-primary me-2';
  document.getElementById('step-indicator-2').className = 'badge bg-secondary me-2';
  document.getElementById('submit-form').reset();
  document.getElementById('submission-error').style.display = 'none';
  document.getElementById('upload-error').style.display = 'none';
  document.getElementById('upload-success').style.display = 'none';
  document.getElementById('upload-progress-bar').style.width = '0%';
  document.getElementById('upload-progress-bar').textContent = '0%';
  document.getElementById('next-btn').textContent = 'Next ';
  document.getElementById('next-btn').innerHTML = 'Next <i class="bi bi-arrow-right ms-1"></i>';
  document.getElementById('next-btn').disabled = false;
  uploadFile = null;
  currentSubmissionId = null;
  currentUploadUrl = null;
}

document.getElementById('next-btn').addEventListener('click', async () => {
  const step1 = document.getElementById('step1-panel');
  if (step1.classList.contains('active')) {
    await doStep1();
  }
});

async function doStep1() {
  const errEl = document.getElementById('submission-error');
  errEl.style.display = 'none';
  const btn = document.getElementById('next-btn');

  const model = document.getElementById('f-model').value.trim();
  const model_type = document.getElementById('f-model-type').value;
  const dataset = document.getElementById('f-dataset').value;
  const target_variable = document.getElementById('f-target').value;
  const l1_error = parseFloat(document.getElementById('f-l1').value);
  const r2_score = parseFloat(document.getElementById('f-r2').value);
  const num_parameters = document.getElementById('f-params').value.trim();
  const year = parseInt(document.getElementById('f-year').value);
  const paper_url = document.getElementById('f-paper-url').value.trim() || null;
  const code_url = document.getElementById('f-code-url').value.trim() || null;
  const submitter_name = document.getElementById('f-name').value.trim();
  const institution = document.getElementById('f-institution').value.trim() || null;
  const contact_email = document.getElementById('f-email').value.trim();
  const traceInput = document.getElementById('f-trace');

  const missing = [];
  if (!model) missing.push('Model Name');
  if (!model_type) missing.push('Model Type');
  if (!dataset) missing.push('Dataset');
  if (!target_variable) missing.push('Target Variable');
  if (!l1_error || l1_error <= 0) missing.push('L1 Error (must be > 0)');
  if (isNaN(r2_score) || r2_score < 0 || r2_score > 1) missing.push('R² Score (0–1)');
  if (!num_parameters) missing.push('Parameters');
  if (!year) missing.push('Year');
  if (!submitter_name) missing.push('Submitter Name');
  if (!contact_email) missing.push('Contact Email');
  if (!traceInput.files.length) missing.push('Trace File');

  if (missing.length) {
    errEl.textContent = 'Required fields missing: ' + missing.join(', ');
    errEl.style.display = 'block';
    return;
  }

  uploadFile = traceInput.files[0];
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Submitting…';

  const payload = { model, model_type, dataset, target_variable, l1_error, r2_score,
                    num_parameters, year, paper_url, code_url, submitter_name,
                    institution, contact_email };

  try {
    const resp = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    if (resp.status !== 201) throw new Error(`HTTP ${resp.status}: ${text}`);
    const data = JSON.parse(text);
    currentSubmissionId = data.submission_id;
    currentUploadUrl = data.upload_url;
    advanceToStep2();
  } catch (err) {
    errEl.textContent = `Submission failed: ${err.message}`;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = 'Next <i class="bi bi-arrow-right ms-1"></i>';
  }
}

function advanceToStep2() {
  document.getElementById('step1-panel').classList.remove('active');
  document.getElementById('step2-panel').classList.add('active');
  document.getElementById('step-indicator-1').className = 'badge bg-success me-2';
  document.getElementById('step-indicator-2').className = 'badge bg-primary me-2';
  document.getElementById('upload-filename').textContent = uploadFile.name;
  document.getElementById('next-btn').style.display = 'none';
  doUpload();
}

function doUpload() {
  const errEl = document.getElementById('upload-error');
  const bar = document.getElementById('upload-progress-bar');
  const successEl = document.getElementById('upload-success');

  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const pct = Math.round((e.loaded / e.total) * 100);
      bar.style.width = pct + '%';
      bar.textContent = pct + '%';
      bar.setAttribute('aria-valuenow', pct);
    }
  });
  xhr.addEventListener('load', () => {
    if (xhr.status === 200 || xhr.status === 204) {
      bar.style.width = '100%';
      bar.textContent = '100%';
      bar.classList.remove('progress-bar-animated');
      successEl.style.display = 'block';
      setTimeout(() => {
        submitModal.hide();
      }, 3000);
    } else {
      errEl.textContent = `Upload failed: HTTP ${xhr.status}: ${xhr.responseText}`;
      errEl.style.display = 'block';
    }
  });
  xhr.addEventListener('error', () => {
    errEl.textContent = 'Upload failed: network error.';
    errEl.style.display = 'block';
  });
  xhr.open('PUT', currentUploadUrl);
  xhr.setRequestHeader('Content-Type', 'application/zip');
  xhr.send(uploadFile);
}

document.addEventListener('DOMContentLoaded', loadLeaderboard);
</script>
