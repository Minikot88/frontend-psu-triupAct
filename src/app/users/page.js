'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    apiGet('/users')
      .then(setUsers)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Users</h1>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </main>
  );
}