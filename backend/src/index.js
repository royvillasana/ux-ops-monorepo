import http from 'node:http';
import { uxArtifacts, shortsPipeline } from './data.js';
import { getOpenClawStatus } from './openclaw.js';

const port = Number(process.env.API_PORT || 8787);

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS'
  });
  res.end(JSON.stringify(payload));
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
  if (req.url === '/api/shorts/pipeline') return json(res, 200, { items: shortsPipeline });

  return json(res, 404, { ok: false, error: 'Not found' });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`[ux-ops-monorepo] backend listening on :${port}`);
  });
}
