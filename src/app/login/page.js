'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const data = await apiPost('/auth/login', { email, password });
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      setMsg('Logged in!');
    } catch (err) {
      setMsg('Login failed: ' + err.message);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" /><br />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" /><br />
        <button type="submit">Sign in</button>
      </form>
      <p>{msg}</p>
    </main>
  );
}