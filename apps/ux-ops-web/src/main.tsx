import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <h1>UX Ops Console</h1>
      <p>Estado inicial del producto. Próximo: registry de artefactos + ejecución de pipelines.</p>
      <ul>
        <li>Frameworks mapeados</li>
        <li>Artefactos por etapa</li>
        <li>Runs y trazabilidad</li>
      </ul>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
