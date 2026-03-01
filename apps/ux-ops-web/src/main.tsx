import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Row = { id: string; artifact: string; framework: string; status: string; updatedAt: string };

function Badge({ status }: { status: string }) {
  const color = status === 'success' ? '#0a7d35' : status === 'running' ? '#1565c0' : status === 'failed' ? '#c62828' : '#6b7280';
  return <span style={{ padding: '4px 8px', borderRadius: 999, background: color, color: '#fff', fontSize: 12 }}>{status}</span>;
}

function App() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8787/api/ux/artifacts')
      .then((r) => r.json())
      .then((d) => setRows(d.items || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1>UX Ops Console</h1>
      <p>Automatización de artefactos UX por framework/etapa.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Artefacto</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Framework</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Estado</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8 }}>{r.artifact}</td>
              <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8 }}>{r.framework}</td>
              <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8 }}><Badge status={r.status} /></td>
              <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8 }}>{new Date(r.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
