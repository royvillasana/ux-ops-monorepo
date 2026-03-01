import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <h1>Shorts Ops Console</h1>
      <p>Panel inicial para operación de pipeline de videos cortos.</p>
      <ol>
        <li>Script + voz</li>
        <li>Frames + render</li>
        <li>Aprobaciones por etapa</li>
      </ol>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
