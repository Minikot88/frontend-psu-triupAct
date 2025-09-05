const base = process.env.NEXT_PUBLIC_API_URL || '';
const prefix = process.env.NEXT_PUBLIC_API_URL ? '' : '/api';

export async function apiGet(path, opts = {}) {
  const res = await fetch(`${base}${prefix}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost(path, body, opts = {}) {
  const res = await fetch(`${base}${prefix}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}