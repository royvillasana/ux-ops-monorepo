# ux-ops-monorepo

Suite inicial para:
1. UX Ops automation
2. Shorts Ops

## Regla clave
OpenClaw **no se instala aquí**.
Este repo se conecta al OpenClaw del VPS Hostinger por `OPENCLAW_GATEWAY_URL` y `OPENCLAW_GATEWAY_TOKEN`.

## Quickstart
```bash
npm install --workspaces
npm run dev:backend
npm run dev:ux
npm run dev:shorts
```

Backend:
- `GET /health`
- `GET /config`
- `GET /api/ux/artifacts`
- `GET /api/shorts/pipeline`
