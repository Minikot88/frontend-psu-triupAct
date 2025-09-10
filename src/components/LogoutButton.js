'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton({ className = '' }) {
  const router = useRouter();

  function handleLogout() {
    const ok = window.confirm('คุณแน่ใจหรือไม่ที่จะออกจากระบบ?');
    if (!ok) return;

    try {
      localStorage.removeItem('token');
      router.replace('/login');
    } catch (e) {
      router.replace('/login');
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={
        'rounded-xl border border-black/15 bg-white px-3 py-2 text-sm hover:bg-black/[.03] ' +
        className
      }
    >
      ออกจากระบบ
    </button>
  );
}
