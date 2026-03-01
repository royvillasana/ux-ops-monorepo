import http from 'node:http';
const port = Number(process.env.API_PORT || 8787);
const server = http.createServer((req, res) => {
  if (req.url === '/health') return res.end(JSON.stringify({ ok: true, service: 'ux-ops-monorepo-backend' }));
  if (req.url === '/config') return res.end(JSON.stringify({ openclawGatewayUrl: process.env.OPENCLAW_GATEWAY_URL || null, hasGatewayToken: Boolean(process.env.OPENCLAW_GATEWAY_TOKEN) }));
  res.statusCode = 404; res.end(JSON.stringify({ ok:false }));
});
server.listen(port, () => console.log(`[ux-ops-monorepo] backend :${port}`));
