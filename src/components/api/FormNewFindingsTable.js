// app/(your-page)/FormNewFindingsTable.jsx
"use client";

import { useMemo, useState, useEffect } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api";

export default function FormNewFindingsTable() {
  // --- state หลัก
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- state UI
  const [q, setQ] = useState("");                 // คำค้นหา
  const [sort, setSort] = useState("code-asc");   // code|title|status|date|id asc/desc
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [showTable, setShowTable] = useState(true);

  // --- โหลดข้อมูล
  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiGet("/api/form_new_findings")
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.data || [];
        const normalized = list.map((d, i) => ({
          id: d.form_new_id ?? i + 1,
          code: d.report_code ?? "-",
          title_th: d.report_title_th ?? "-",
          title_en: d.report_title_en ?? "",
          status_text: d.status ?? "-",   // เช่น "รอตรวจสอบ จากผู้รับทุน"
          form_status_id: d.form_status_id ?? null,
          sla_at: d.sla_at ?? null,
          sla_by: d.sla_by ?? null,
          create_by: d.create_by ?? null,
        }));
        setRows(normalized);
      })
      .catch((e) => alive && setErr(e?.message || "fetch failed"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // --- helpers
  const toDate = (v) => (v ? new Date(String(v).replace(" ", "T")) : null);
  const fmtDateTime = (v) => {
    const d = toDate(v);
    return d && !isNaN(d) ? d.toLocaleString("th-TH") : "-";
  };

  // --- filter + sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const coll = new Intl.Collator("th-TH", { sensitivity: "base", numeric: true });

    let out = rows.filter((r) => {
      if (!term) return true;
      return (
        String(r.code ?? "").toLowerCase().includes(term) ||
        String(r.title_th ?? "").toLowerCase().includes(term) ||
        String(r.title_en ?? "").toLowerCase().includes(term) ||
        String(r.status_text ?? "").toLowerCase().includes(term) ||
        String(r.id ?? "").toLowerCase().includes(term)
      );
    });

    out.sort((a, b) => {
      if (sort.startsWith("title")) {
        const cmp = coll.compare(String(a.title_th ?? ""), String(b.title_th ?? ""));
        return sort === "title-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("code")) {
        const cmp = coll.compare(String(a.code ?? ""), String(b.code ?? ""));
        return sort === "code-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("status")) {
        const cmp = coll.compare(String(a.status_text ?? ""), String(b.status_text ?? ""));
        return sort === "status-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("date")) {
        const da = toDate(a.sla_at)?.getTime() ?? -Infinity;
        const db = toDate(b.sla_at)?.getTime() ?? -Infinity;
        return sort === "date-asc" ? da - db : db - da;
      }
      if (sort.startsWith("id")) {
        const na = Number(a.id), nb = Number(b.id);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) {
          return sort === "id-asc" ? na - nb : nb - na;
        }
        const cmp = coll.compare(String(a.id ?? ""), String(b.id ?? ""));
        return sort === "id-asc" ? cmp : -cmp;
      }
      return 0;
    });

    return out;
  }, [rows, q, sort]);

  // --- pagination
  const total = filtered.length;
  const rawTotal = rows.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const startIdx = (page - 1) * size;
  const pageRows = filtered.slice(startIdx, startIdx + size);
  const viewStart = total === 0 ? 0 : startIdx + 1;
  const viewEnd = startIdx + pageRows.length;

  useEffect(() => { if (page > pages) setPage(1); }, [pages, page]);
  const goTo = (p) => setPage(Math.min(Math.max(1, p), pages));

  return (
    <Card>
      <CardHeader
        title="ตารางคำขอประกาศผลใหม่ (Form New Findings) /form_new_findings.controller"
        onToggle={() => setShowTable(!showTable)}
        isOpen={showTable}
      />

      {showTable && (
        <>
          {/* Toolbar */}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="ค้นหา รหัสรายงาน / ชื่อเรื่อง / สถานะ…"
                className="w-96 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none"
              >
                <optgroup label="เรียงตามรหัส/ชื่อ/สถานะ">
                  <option value="code-asc">รหัสรายงาน (A→Z)</option>
                  <option value="code-desc">รหัสรายงาน (Z→A)</option>
                  <option value="title-asc">ชื่อเรื่อง (A→Z)</option>
                  <option value="title-desc">ชื่อเรื่อง (Z→A)</option>
                  <option value="status-asc">สถานะ (A→Z)</option>
                  <option value="status-desc">สถานะ (Z→A)</option>
                </optgroup>
                <optgroup label="เรียงตามวัน SLA">
                  <option value="date-asc">SLA (เก่า→ใหม่)</option>
                  <option value="date-desc">SLA (ใหม่→เก่า)</option>
                </optgroup>
                <optgroup label="เรียงตามรหัสภายใน">
                  <option value="id-asc">รหัส (1→99)</option>
                  <option value="id-desc">รหัส (99→1)</option>
                </optgroup>
              </select>

              <div className="flex items-center gap-2">
                <label className="text-sm text-black/60">ต่อหน้า</label>
                <select
                  value={size}
                  onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
                  className="rounded-xl border border-black/15 bg-white px-2 py-1.5 text-sm outline-none"
                >
                  {[3, 5, 10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="text-sm text-black/60">
              แสดง {viewStart}-{viewEnd} จาก {total} ข้อมูล
              {q.trim() ? <span className="ml-2 text-black/40">(ทั้งหมด {rawTotal} ข้อมูลก่อนกรอง)</span> : null}
            </div>
          </div>

          {/* Table */}
          {!loading && !err && total > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-black/10">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-black/[.03] text-left text-black/60">
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">รหัสรายงาน</th>
                    <th className="px-4 py-2 font-medium">ชื่อเรื่อง (TH)</th>
                    <th className="px-4 py-2 font-medium">ชื่อเรื่อง (EN)</th>
                    <th className="px-4 py-2 font-medium">สถานะ</th>
                    <th className="px-4 py-2 font-medium">SLA เวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {pageRows.map((r, i) => (
                    <tr key={r.id ?? `${startIdx + i}`} className="hover:bg-black/[.02]">
                      <td className="px-4 py-2 text-black/70">{startIdx + i + 1}</td>
                      <td className="px-4 py-2 font-mono">{r.code}</td>
                      <td className="px-4 py-2">{r.title_th}</td>
                      <td className="px-4 py-2">{r.title_en || "-"}</td>
                      <td className="px-4 py-2">{r.status_text}</td>
                      <td className="px-4 py-2">{fmtDateTime(r.sla_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* States */}
          {loading && <div className="mt-4 text-sm text-black/60">กำลังโหลด…</div>}
          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}
          {!loading && !err && total === 0 && <div className="mt-4 text-sm text-black/60">ไม่พบข้อมูล</div>}

          {/* Pagination */}
          {!loading && !err && total > 0 && (
            <Pagination page={page} pages={pages} goTo={goTo} />
          )}
        </>
      )}
    </Card>
  );
}

function Pagination({ page, pages, goTo }) {
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="text-xs text-black/50">หน้า {page} / {pages}</div>
      <div className="flex items-center gap-1">
        <button onClick={() => goTo(1)} disabled={page === 1} className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">«</button>
        <button onClick={() => goTo(page - 1)} disabled={page === 1} className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">ก่อนหน้า</button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages)
          .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p); acc.push(p); return acc; }, [])
          .map((p) =>
            typeof p === "number" ? (
              <button key={p} onClick={() => goTo(p)}
                className={`rounded-md border px-2 py-1 text-xs ${p === page ? "border-black/30 bg-black/5" : "border-black/15 bg-white hover:bg-black/5"}`}
                aria-current={p === page ? "page" : undefined}>{p}</button>
            ) : (
              <span key={p} className="px-2 text-xs text-black/40">…</span>
            )
          )}
        <button onClick={() => goTo(page + 1)} disabled={page === pages} className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">ถัดไป</button>
        <button onClick={() => goTo(pages)} disabled={page === pages} className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">»</button>
      </div>
    </div>
  );
}
