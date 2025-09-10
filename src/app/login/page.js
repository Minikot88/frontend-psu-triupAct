'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setMsg('');
    try {
      const res = await apiPost('/auth/login', { email, password });

      if (res?.success && res?.session?.id) {
        // เก็บ token/flag อะไรก็ได้ให้ RequireAuth ตรวจเจอ
        localStorage.setItem('token', res.session.id); // หรือ 'true'
        setMsg('Login success! กำลังนำคุณไปยัง Dashboard…');

        // ไปหน้าอื่นเลย
        router.replace('/dashboard');
      } else {
        setMsg(`Error: ${res?.error || 'Unknown error'}`);
      }
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
        <p className="mt-1 text-sm text-gray-500">ใส่อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Login
          </button>
        </form>

        {msg && (
          <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}