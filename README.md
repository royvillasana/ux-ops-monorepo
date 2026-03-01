# ux-ops-monorepo

Monorepo para dos frentes:
- `apps/ux-ops-web` → UX Ops automation (frameworks + artefactos)
- `apps/shorts-ops-web` → operación de pipeline shorts/video

## Importante
Este repo **NO instala OpenClaw**.
Se conecta a tu OpenClaw ya corriendo en VPS Hostinger vía Gateway URL.

## Stack
- Frontend: React + TypeScript + Vite (pendiente scaffold completo)
- Backend: Fastify (API/orquestación)
- DB/Auth/Realtime: Supabase

## Variables de entorno
Copia `.env.example` a `.env` y completa valores.
