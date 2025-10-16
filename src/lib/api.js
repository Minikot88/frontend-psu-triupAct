// lib/api.js
const base = process.env.NEXT_PUBLIC_API_URL || "";
const prefix = process.env.NEXT_PUBLIC_API_URL ? "" : "/api";

function joinUrl(...parts) {
  return parts
    .filter(Boolean)
    .map((p, i) =>
      i === 0 ? p.replace(/\/+$/, "") : p.replace(/^\/+|\/+$/g, "")
    )
    .join("/");
}

async function parseRes(res) {
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export async function apiGet(path, opts = {}) {
  const url = joinUrl(base, prefix, path);
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include",
    cache: "no-store",
  });
  return parseRes(res);
}

export async function apiPost(path, body, opts = {}) {
  const url = joinUrl(base, prefix, path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });
  return parseRes(res);
}
