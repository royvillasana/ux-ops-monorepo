import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Status = 'queued' | 'running' | 'success' | 'failed';
type Row = { id: string; artifact: string; framework: string; status: Status; updatedAt: string };

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8787';

function Badge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    queued: '#6b7280',
    running: '#2563eb',
    success: '#15803d',
    failed: '#b91c1c'
  };
  return (
    <span style={{ background: map[status], color: '#fff', borderRadius: 999, fontSize: 12, padding: '4px 8px' }}>
      {status}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, minWidth: 120 }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [lastSync, setLastSync] = useState<string>('');

  const [ocConnected, setOcConnected] = useState<boolean | null>(null);

  async function load() {
    const [res, oc] = await Promise.all([
      fetch(`${API_BASE}/api/ux/artifacts`),
      fetch(`${API_BASE}/api/openclaw/status`).catch(() => null)
    ]);

    const data = await res.json();
    setRows(data.items || []);
    if (oc) {
      try { const d = await oc.json(); setOcConnected(Boolean(d?.ok)); } catch { setOcConnected(false); }
    } else {
      setOcConnected(false);
    }
    setLastSync(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    load().catch(() => void 0);
    const i = setInterval(() => load().catch(() => void 0), 10000);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okStatus = status === 'all' ? true : r.status === status;
      const term = q.trim().toLowerCase();
      const okQ = !term || r.artifact.toLowerCase().includes(term) || r.framework.toLowerCase().includes(term);
      return okStatus && okQ;
    });
  }, [rows, q, status]);

  const counts = useMemo(() => {
    return {
      total: rows.length,
      running: rows.filter((r) => r.status === 'running').length,
      queued: rows.filter((r) => r.status === 'queued').length,
      success: rows.filter((r) => r.status === 'success').length,
      failed: rows.filter((r) => r.status === 'failed').length
    };
  }, [rows]);

  return (
    <main style={{ fontFamily: 'Inter,system-ui,sans-serif', padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 6 }}>UX Ops Console v2</h1>
      <p style={{ marginTop: 0, color: '#4b5563' }}>Registro, seguimiento y estado de artefactos UX automatizados.</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="Total" value={counts.total} />
        <Stat label="Running" value={counts.running} />
        <Stat label="Queued" value={counts.queued} />
        <Stat label="Success" value={counts.success} />
        <Stat label="Failed" value={counts.failed} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar artefacto o framework"
          style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', minWidth: 280 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option value="all">Todos los estados</option>
          <option value="queued">queued</option>
          <option value="running">running</option>
          <option value="success">success</option>
          <option value="failed">failed</option>
        </select>
        <button onClick={() => load().catch(() => void 0)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #111827', background: '#111827', color: '#fff' }}>
          Refrescar
        </button>
        <span style={{ fontSize: 12, color: '#6b7280' }}>Última sync: {lastSync || '-'}</span>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: 10 }}>Artefacto</th>
              <th style={{ textAlign: 'left', padding: 10 }}>Framework</th>
              <th style={{ textAlign: 'left', padding: 10 }}>Estado</th>
              <th style={{ textAlign: 'left', padding: 10 }}>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 10, borderTop: '1px solid #f3f4f6' }}>{r.artifact}</td>
                <td style={{ padding: 10, borderTop: '1px solid #f3f4f6' }}>{r.framework}</td>
                <td style={{ padding: 10, borderTop: '1px solid #f3f4f6' }}><Badge status={r.status} /></td>
                <td style={{ padding: 10, borderTop: '1px solid #f3f4f6' }}>{new Date(r.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={4} style={{ padding: 16, color: '#6b7280', textAlign: 'center' }}>Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
