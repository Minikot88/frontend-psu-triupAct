'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');   // ใช้ email ให้ตรงกับ API
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setMsg('');
    try {
      const res = await apiPost('/auth/login', { email, password });
      if (res?.success && res?.session?.id) {
        setMsg(`Login success! Session ID: ${res.session.id}`);
      } else {
        setMsg(`Error: ${res?.error || 'Unknown error'}`);
      }
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit">Login</button>
      </form>
      {msg && <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{msg}</pre>}
    </main>
  );
}
