import http from 'node:http';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { uxArtifacts, shortsPipeline } from './data.js';
import { getOpenClawStatus } from './openclaw.js';

const port = Number(process.env.API_PORT || 8787);
const WS = '/data/.openclaw/workspace';

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

async function getUxBlueprintSummary() {
  const p = path.join(WS, 'ux_artifacts_l123_matrix.json');
  try {
    const raw = await readFile(p, 'utf8');
    const rows = JSON.parse(raw);
    const byLevel = rows.reduce((acc, r) => {
      const k = r.automation_level || 'unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const byFramework = rows.reduce((acc, r) => {
      const k = r.framework || 'Unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const topFrameworks = Object.entries(byFramework)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([framework, count]) => ({ framework, count }));

    return {
      ok: true,
      total: rows.length,
      byLevel,
      topFrameworks,
      sample: rows.slice(0, 12)
    };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

async function getShortsOutputs() {
  const outDir = path.join(WS, 'shorts-pipeline', 'outputs');
  try {
    const files = await readdir(outDir);
    const mapped = [];
    for (const f of files) {
      const full = path.join(outDir, f);
      const st = await stat(full);
      mapped.push({
        name: f,
        sizeKb: Math.round(st.size / 1024),
        updatedAt: new Date(st.mtimeMs).toISOString()
      });
    }
    mapped.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

    let logTail = '';
    try {
      const log = await readFile(path.join(outDir, 'status_6.log'), 'utf8');
      logTail = log.split('\n').slice(-20).join('\n');
    } catch {}

    return { ok: true, files: mapped.slice(0, 50), logTail };
  } catch (e) {
    return { ok: false, error: String(e?.message || e), files: [] };
  }
}

export const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });

  if (req.url === '/health') return json(res, 200, { ok: true, service: 'ux-ops-monorepo-backend' });

  if (req.url === '/config') {
    return json(res, 200, {
      openclawGatewayUrl: process.env.OPENCLAW_GATEWAY_URL || null,
      hasGatewayToken: Boolean(process.env.OPENCLAW_GATEWAY_TOKEN),
      note: 'OpenClaw corre en Hostinger VPS; este repo no instala OpenClaw.'
    });
  }

  if (req.url === '/api/openclaw/status') {
    try {
      const status = await getOpenClawStatus();
      return json(res, 200, { ok: true, connected: true, status });
    } catch (error) {
      return json(res, 500, { ok: false, connected: false, error: String(error?.message || error) });
    }
  }

  if (req.url === '/api/ux/artifacts') return json(res, 200, { items: uxArtifacts });
  if (req.url === '/api/ux/blueprint') return json(res, 200, await getUxBlueprintSummary());

  if (req.url === '/api/shorts/pipeline') return json(res, 200, { items: shortsPipeline });
  if (req.url === '/api/shorts/outputs') return json(res, 200, await getShortsOutputs());

  return json(res, 404, { ok: false, error: 'Not found' });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`[ux-ops-monorepo] backend listening on :${port}`);
  });
}
