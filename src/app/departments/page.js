'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function DepartmentsPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet('/departments')
      .then((data) => {
        // บาง API คืนเป็น array ตรง ๆ หรือ { data: [...] }
        const list = Array.isArray(data) ? data : (data?.data || []);
        setItems(list);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1>Departments</h1>
      {err && <div style={{ color: '#b91c1c', background: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 12 }}>{err}</div>}
      {loading && <p>Loading…</p>}
      {!loading && !err && items.length === 0 && <p>No data (login first?)</p>}

      <div style={{marginTop:16,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
        {items.map((d, i) => (
          <div key={d.id || d.code || d.name || i}
               style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
            <div style={{ fontWeight:600 }}>{d.name || d.departmentName || '-'}</div>
            <div style={{ color:'#6b7280', fontSize:12, marginTop:4 }}>
              {d.code ? `Code: ${d.code}` : (d.id ? `ID: ${d.id}` : '')}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
