import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Status = 'queued' | 'running' | 'success' | 'failed';
type Row = { id: string; artifact: string; framework: string; status: Status; updatedAt: string };
type Blueprint = {
  ok: boolean;
  total?: number;
  byLevel?: Record<string, number>;
  topFrameworks?: { framework: string; count: number }[];
  sample?: any[];
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8787';

function Badge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    queued: '#6b7280',
    running: '#2563eb',
    success: '#15803d',
    failed: '#b91c1c'
  };
  return <span style={{ background: map[status], color: '#fff', borderRadius: 999, fontSize: 12, padding: '4px 8px' }}>{status}</span>;
}

function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [bp, setBp] = useState<Blueprint>({ ok: false });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [lastSync, setLastSync] = useState<string>('');
  const [ocConnected, setOcConnected] = useState<boolean | null>(null);

  async function load() {
    const [res, oc, bpr] = await Promise.all([
      fetch(`${API_BASE}/api/ux/artifacts`),
      fetch(`${API_BASE}/api/openclaw/status`).catch(() => null),
      fetch(`${API_BASE}/api/ux/blueprint`).catch(() => null)
    ]);
    const data = await res.json();
    setRows(data.items || []);

    if (oc) {
      try { const d = await oc.json(); setOcConnected(Boolean(d?.ok)); } catch { setOcConnected(false); }
    } else setOcConnected(false);

    if (bpr) {
      try { setBp(await bpr.json()); } catch {}
    }

    setLastSync(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    load().catch(() => void 0);
    const i = setInterval(() => load().catch(() => void 0), 10000);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    const okStatus = status === 'all' ? true : r.status === status;
    const term = q.trim().toLowerCase();
    const okQ = !term || r.artifact.toLowerCase().includes(term) || r.framework.toLowerCase().includes(term);
    return okStatus && okQ;
  }), [rows, q, status]);

  return (
    <main style={{ fontFamily: 'Inter,system-ui,sans-serif', padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 6 }}>UX Ops Console v3</h1>
      <p style={{ marginTop: 0, color: '#4b5563' }}>Ahora sí con datos de auditoría real (L1/L2/L3) + estado operativo.</p>
      <p style={{ marginTop: 0, fontSize: 13, color: ocConnected ? '#15803d' : '#b91c1c' }}>
        OpenClaw: {ocConnected === null ? 'verificando...' : ocConnected ? 'conectado' : 'sin conexión'} · última sync: {lastSync || '-'}
      </p>

      <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Resumen auditoría UX</h3>
          <p style={{ margin: 0 }}>Total artefactos: <strong>{bp.total ?? '-'}</strong></p>
          <p style={{ margin: '6px 0 0' }}>
            L1: <strong>{bp.byLevel?.L1 ?? 0}</strong> · L2: <strong>{bp.byLevel?.L2 ?? 0}</strong> · L3: <strong>{bp.byLevel?.L3 ?? 0}</strong>
          </p>
          <div style={{ marginTop: 10 }}>
            <strong>Top frameworks</strong>
            <ul style={{ margin: '6px 0 0 18px' }}>
              {(bp.topFrameworks || []).slice(0, 6).map((f) => <li key={f.framework}>{f.framework} — {f.count}</li>)}
            </ul>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Pipeline operativo</h3>
          <p style={{ marginTop: 0 }}>Esta tabla te deja filtrar artefactos activos y su estado de ejecución.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar artefacto/framework" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }}>
              <option value="all">Todos</option>
              <option value="queued">queued</option>
              <option value="running">running</option>
              <option value="success">success</option>
              <option value="failed">failed</option>
            </select>
            <button onClick={() => load()} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #111827', background: '#111827', color: '#fff' }}>Refrescar</button>
          </div>
        </div>
      </section>

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
          </tbody>
        </table>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
