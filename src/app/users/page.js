'use client';
import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest'); 
  
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    setLoading(true);
    apiGet('/users', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e.message || 'Failed to fetch'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = users.filter((u) =>
      !term ? true : String(u.email || '').toLowerCase().includes(term)
    );
    list = list.sort((a, b) => {
      if (sort === 'email') return String(a.email||'').localeCompare(String(b.email||''));
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sort === 'newest' ? db - da : da - db;
    });
    return list;
  }, [users, q, sort]);

  function initialsFromEmail(email='') {
    const name = String(email).split('@')[0] || '';
    const letters = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
    return letters || 'U';
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); alert('Copied!'); }
    catch { alert('Copy failed'); }
  }

  function fmtDate(d) {
    if (!d) return '-';
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(d));
    } catch { return String(d); }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Users</h1>
            <p className="text-neutral-500 text-sm">
              {loading ? 'Loading…' : `${filtered.length} user(s)`}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative sm:w-72">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by email…"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none ring-0 focus:border-neutral-300 focus:shadow-sm"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">⌕</span>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-300 focus:shadow-sm"
              title="Sort"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="email">Email (A→Z)</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <span>⚠️</span>
              <div className="flex-1">
                <strong className="font-semibold">Failed to fetch</strong>
                <div className="whitespace-pre-wrap">{err}</div>
              </div>
              <button
                onClick={() => location.reload()}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-3 h-12 w-12 rounded-full bg-neutral-200" />
                <div className="mb-2 h-4 w-2/3 rounded bg-neutral-200" />
                <div className="h-3 w-1/2 rounded bg-neutral-200" />
                <div className="mt-4 h-8 w-full rounded-xl bg-neutral-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center">👤</div>
            <h2 className="text-lg font-semibold">No users found</h2>
            <p className="text-sm text-neutral-500">Try another search.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold">
                    {initialsFromEmail(u.email)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-neutral-900">{u.email || '-'}</div>
                    <div className="text-xs text-neutral-500">ID: <span className="font-mono">{(u.id||'').slice(0,8)}…</span></div>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Created</span>
                    <span className="text-neutral-900">{fmtDate(u.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Updated</span>
                    <span className="text-neutral-900">{fmtDate(u.updatedAt)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => copy(u.email)}
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
                    title="Copy email"
                  >
                    Copy email
                  </button>
                  <button
                    onClick={() => navigator?.share?.({ title: 'User', text: u.email }) ?? copy(u.email)}
                    className="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-black"
                    title="Share"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}