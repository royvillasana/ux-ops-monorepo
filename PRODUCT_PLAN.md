# Product Plan (v0 -> v1)

## Objetivo
Construir una suite operativa con dos frentes:
1. UX Ops Automation (frameworks + artefactos + runs)
2. Shorts Ops (pipeline de assets/video/publicación)

## Módulos UX Ops
- Registry de artefactos
- Pipeline runner (input -> procesamiento -> output)
- Estado de ejecución (queued/running/success/failed)
- Conectores (Figma, Forms, Docs, tracking)

## Módulos Shorts Ops
- Cola de tareas por video
- Estado por etapa (script/voz/frame/render/publicación)
- Evidencias y aprobación humana

## Integración OpenClaw
- Solo vía Gateway remoto (Hostinger VPS)
- No instalar OpenClaw en el repo
