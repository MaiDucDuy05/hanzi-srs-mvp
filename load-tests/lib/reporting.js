// Reporting cho k6 handleSummary — ghi JSON + HTML vào reports/. Không external dep.

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// Built-in metrics k6 có sẵn.
const BUILTIN_KEYS = [
  'http_req_duration',
  'http_req_failed',
  'http_reqs',
  'checks',
  'vus',
  'iterations',
  'data_received',
  'data_sent',
];

// Custom Counter — load-tests/lib/metrics.js
const CUSTOM_COUNTERS = [
  'practice_attempts_total',
  'practice_submits_total',
  'srs_reviews_total',
  'achievements_unlocked_total',
  'admin_writes_total',
  'quota_blocked_total',
  'quota_passed_total',
  'business_errors_total',
];

function rows(metrics, keys) {
  return keys.filter((k) => metrics[k])
    .map((k) => {
      const v = metrics[k].values;
      return `<tr><td>${k}</td><td>${v.avg ?? '-'}</td><td>${v['p(95)'] ?? '-'}</td><td>${v['p(99)'] ?? '-'}</td><td>${v.max ?? '-'}</td><td>${v.rate ?? v.count ?? '-'}</td></tr>`;
    })
    .join('');
}

// Extract per-endpoint metrics từ k6 metrics object.
function getEndpointMetrics(metrics) {
  const endpoints = {};
  for (const [key, metric] of Object.entries(metrics)) {
    const match = key.match(/http_req_duration\{endpoint:([^}]+)\}/);
    if (match) {
      const endpoint = match[1];
      if (!endpoints[endpoint]) {
        endpoints[endpoint] = { reads: [], writes: [], errors: [] };
      }
      endpoints[endpoint].reads.push({
        key,
        avg: metric.values.avg,
        p95: metric.values['p(95)'],
        p99: metric.values['p(99)'],
        max: metric.values.max,
      });
    }
  }
  for (const [key, metric] of Object.entries(metrics)) {
    const match = key.match(/http_req_failed\{endpoint:([^}]+)\}/);
    if (match) {
      const endpoint = match[1];
      if (!endpoints[endpoint]) {
        endpoints[endpoint] = { reads: [], writes: [], errors: [] };
      }
      endpoints[endpoint].errors.push({
        rate: (metric.values.rate * 100).toFixed(2) + '%',
      });
    }
  }
  return endpoints;
}

/** Trả object {filePath: content} cho k6 handleSummary. */
export function writeReport(profile, data) {
  const name = `${profile}-${ts()}`;
  const metrics = data.metrics || {};
  const endpoints = getEndpointMetrics(metrics);

  const endpointRows = Object.entries(endpoints)
    .map(([endpoint, data]) => {
      const read = data.reads[0];
      const error = data.errors[0];
      return `<tr>
        <td><strong>${endpoint}</strong></td>
        <td>${read?.avg?.toFixed(0) ?? '-'}</td>
        <td>${read?.p95?.toFixed(0) ?? '-'}</td>
        <td>${read?.p99?.toFixed(0) ?? '-'}</td>
        <td>${read?.max?.toFixed(0) ?? '-'}</td>
        <td>${error?.rate ?? '-'}</td>
      </tr>`;
    })
    .join('');

  const html =
    `<!doctype html><html><head><meta charset="utf-8"><title>k6 ${profile}</title>` +
    `<style>body{font-family:system-ui;padding:2rem}h2{margin-top:2rem}table{border-collapse:collapse;margin-bottom:2rem}td,th{border:1px solid #ccc;padding:8px 12px;text-align:left}.warning{background:#fff3cd}table tbody tr:nth-child(odd){background:#f9f9f9}</style></head>` +
    `<body><h1>k6 Load Test — ${profile}</h1><p><em>${new Date().toISOString()}</em></p>` +
    `<h2>Built-in metrics</h2>` +
    `<table><tr><th>metric</th><th>avg</th><th>p95</th><th>p99</th><th>max</th><th>rate/count</th></tr>${rows(metrics, BUILTIN_KEYS)}</table>` +
    `<h2>Response Time by Endpoint</h2>` +
    `<table><tr><th>Endpoint</th><th>Avg (ms)</th><th>p95 (ms)</th><th>p99 (ms)</th><th>Max (ms)</th><th>Error Rate</th></tr>${endpointRows}</table>` +
    `<h2>Custom business counters</h2>` +
    `<table><tr><th>counter</th><th>total</th></tr>` +
    CUSTOM_COUNTERS.filter((k) => metrics[k])
      .map((k) => `<tr><td>${k}</td><td>${metrics[k].values.count ?? '-'}</td></tr>`).join('') +
    `</table></body></html>`;
  return {
    [`reports/${name}.json`]: JSON.stringify(data, null, 2),
    [`reports/${name}.html`]: html,
  };
}