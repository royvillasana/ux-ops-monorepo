import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

type PipelineRow = { id: string; artifact: string; framework: string; status: string; updatedAt: string };
type OutFile = { name: string; sizeKb: number; updatedAt: string };

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8787';

function App() {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [files, setFiles] = useState<OutFile[]>([]);
  const [logTail, setLogTail] = useState('');

  async function load() {
    const [p, o] = await Promise.all([
      fetch(`${API_BASE}/api/shorts/pipeline`).then((r) => r.json()),
      fetch(`${API_BASE}/api/shorts/outputs`).then((r) => r.json())
    ]);
    setRows(p.items || []);
    setFiles(o.files || []);
    setLogTail(o.logTail || '');
  }

  useEffect(() => {
    load().catch(() => void 0);
    const i = setInterval(() => load().catch(() => void 0), 10000);
    return () => clearInterval(i);
  }, []);

  return (
    <main style={{ fontFamily: 'Inter,system-ui,sans-serif', padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Shorts Ops Console v3</h1>
      <p style={{ color: '#4b5563' }}>Estado del pipeline + archivos de salida reales de <code>shorts-pipeline/outputs</code>.</p>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Pipeline actual</h3>
          <ul style={{ paddingLeft: 18 }}>
            {rows.map((r) => (
              <li key={r.id}><strong>{r.artifact}</strong> — {r.status} — {new Date(r.updatedAt).toLocaleString()}</li>
            ))}
          </ul>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Outputs recientes</h3>
          <ul style={{ paddingLeft: 18, maxHeight: 260, overflow: 'auto' }}>
            {files.map((f) => (
              <li key={f.name}>{f.name} — {f.sizeKb} KB — {new Date(f.updatedAt).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Tail status_6.log</h3>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#0b1020', color: '#d1e0ff', padding: 12, borderRadius: 8 }}>
{logTail || 'Sin log disponible'}
        </pre>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
