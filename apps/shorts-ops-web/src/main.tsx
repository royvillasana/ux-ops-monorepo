import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Status = 'queued' | 'running' | 'success' | 'failed';
type Row = { id: string; artifact: string; framework: string; status: Status; updatedAt: string };

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8787';

function App() {
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    const res = await fetch(`${API_BASE}/api/shorts/pipeline`);
    const data = await res.json();
    setRows(data.items || []);
  }

  useEffect(() => {
    load().catch(() => void 0);
    const i = setInterval(() => load().catch(() => void 0), 10000);
    return () => clearInterval(i);
  }, []);

  const counts = useMemo(() => ({
    queued: rows.filter((r) => r.status === 'queued').length,
    running: rows.filter((r) => r.status === 'running').length,
    success: rows.filter((r) => r.status === 'success').length,
    failed: rows.filter((r) => r.status === 'failed').length
  }), [rows]);

  return (
    <main style={{ fontFamily: 'Inter,system-ui,sans-serif', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Shorts Ops Console v2</h1>
      <p style={{ color: '#4b5563' }}>Pipeline operativo de Shorts con control por estado.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8, marginBottom: 16 }}>
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{k}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>
      <ul style={{ paddingLeft: 18 }}>
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
