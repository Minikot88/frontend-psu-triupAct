"use client";

import { useMemo, useState, useEffect } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api";

export default function RolesTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(3);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    apiGet("/api/roles")
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.data || [];
        const normalized = list.map((d, i) => ({
          id: d?.id ?? i + 1,
          name: d?.name_th ?? "-",
        }));
        setRows(normalized);
      })
      .catch((e) => setErr(e?.message || "fetch failed"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        !term ||
        String(r.name ?? "").toLowerCase().includes(term) ||
        String(r.id ?? "").toLowerCase().includes(term)
    );
    out.sort((a, b) => {
      if (sort.startsWith("name")) {
        const cmp = String(a.name ?? "").localeCompare(String(b.name ?? ""), "th");
        return sort === "name-asc" ? cmp : -cmp;
      }
      const na = Number(a.id), nb = Number(b.id);
      const cmp = (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
      return sort === "id-asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, q, sort]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const startIdx = (page - 1) * size;
  const pageRows = filtered.slice(startIdx, startIdx + size);
  useEffect(() => { if (page > pages) setPage(1); }, [pages, page]);
  const goTo = (p) => setPage(Math.min(Math.max(1, p), pages));

  return (
    <Card>
      <CardHeader title="ตารางสิทธิ์ /api/roles" onToggle={() => setShowTable(!showTable)} isOpen={showTable} />
      {showTable && (
        <>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input value={q} onChange={(e)=>{setQ(e.target.value);setPage(1);}} placeholder="ค้นหา ชื่อสิทธิ์/ID…" className="w-80 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none" />
              <select value={sort} onChange={(e)=>setSort(e.target.value)} className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none">
                <option value="name-asc">ชื่อ (A→Z)</option>
                <option value="name-desc">ชื่อ (Z→A)</option>
                <option value="id-asc">ID (น้อย→มาก)</option>
                <option value="id-desc">ID (มาก→น้อย)</option>
              </select>
              <div className="flex items-center gap-2">
                <label className="text-sm text-black/60">แถวต่อหน้า</label>
                <select value={size} onChange={(e)=>{setSize(Number(e.target.value));setPage(1);}} className="rounded-xl border border-black/15 bg-white px-2 py-1.5 text-sm outline-none">
                  {[10,20,50,100].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="text-sm text-black/60">แสดง {total === 0 ? 0 : startIdx+1}-{startIdx+pageRows.length} จาก {total} รายการ</div>
          </div>

          {!loading && !err && total>0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-black/10">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-black/[.03] text-left text-black/60">
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">ID</th>
                    <th className="px-4 py-2 font-medium">ชื่อสิทธิ์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {pageRows.map((r,i)=>(
                    <tr key={r.id ?? i} className="hover:bg-black/[.02]">
                      <td className="px-4 py-2">{startIdx+i+1}</td>
                      <td className="px-4 py-2 font-mono">{r.id}</td>
                      <td className="px-4 py-2">{r.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {loading && <div className="mt-4 text-sm text-black/60">กำลังโหลด…</div>}
          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}
          {!loading && !err && total===0 && <div className="mt-4 text-sm text-black/60">ไม่พบข้อมูล</div>}

          {!loading && !err && total>0 && (
            <div className="mt-4 flex items-center justify-center gap-1">
              <button onClick={()=>goTo(1)} disabled={page===1} className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">«</button>
              <button onClick={()=>goTo(page-1)} disabled={page===1} className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">ก่อนหน้า</button>
              {Array.from({length: pages},(_,i)=>i+1).filter(p=>Math.abs(p-page)<=2||p===1||p===pages).reduce((acc,p,idx,arr)=>{if(idx>0&&p-arr[idx-1]>1)acc.push("…");acc.push(p);return acc;},[]).map((p,idx)=>typeof p==="number"?(
                <button key={p} onClick={()=>goTo(p)} className={`rounded-md border px-2 py-1 text-xs ${p===page?"border-black/30 bg-black/5":"border-black/15 bg-white hover:bg-black/5"}`}>{p}</button>
              ):<span key={`e-${idx}`} className="px-2 text-xs text-black/40">…</span>)}
              <button onClick={()=>goTo(page+1)} disabled={page===pages} className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">ถัดไป</button>
              <button onClick={()=>goTo(pages)} disabled={page===pages} className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">»</button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
