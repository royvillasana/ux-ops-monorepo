import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Row = { id: string; artifact: string; framework: string; status: string; updatedAt: string };

const stages = ['Script', 'Voz', 'Frames', 'Render', 'Aprobación'];

function App() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8787/api/shorts/pipeline')
      .then((r) => r.json())
      .then((d) => setRows(d.items || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1>Shorts Ops Console</h1>
      <p>Operación del pipeline de shorts con estado por lotes.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {stages.map((s) => (
          <span key={s} style={{ border: '1px solid #ddd', borderRadius: 999, padding: '4px 10px', fontSize: 12 }}>{s}</span>
        ))}
      </div>
      <ul>
        {rows.map((r) => (
          <li key={r.id} style={{ marginBottom: 8 }}>
            <strong>{r.artifact}</strong> — {r.status} — {new Date(r.updatedAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
