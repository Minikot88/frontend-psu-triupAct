// app/(your-page)/FormExtendTable.jsx
"use client";

import { useMemo, useState, useEffect } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api";

export default function FormExtendTable() {
  // ---- state หลัก
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ---- state UI
  const [q, setQ] = useState("");                   // คำค้นหา
  const [sort, setSort] = useState("code-asc");     // code|title|start|end|id|status asc/desc
  const [page, setPage] = useState(1);              // หน้าปัจจุบัน
  const [size, setSize] = useState(5);              // จำนวนต่อหน้า
  const [showTable, setShowTable] = useState(true);

  // ---- โหลดข้อมูล form_extend
  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiGet("/api/form_extend")
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.data || [];
        // normalize
        const normalized = list.map((d, i) => ({
          id: d.form_extend_id ?? i + 1,
          code: d.extend_code ?? "-",
          title: d.report_title_th ?? d.title ?? "-",
          report_code: d.report_code ?? "",
          start_date: d.extend_start_date ?? null,
          end_date: d.extend_end_date ?? null,
          status: d.extend_status ?? null,
          check_status: d.extend_check_status ?? null,
          form_own_id: d.form_own_id ?? null,
          form_new_id: d.form_new_id ?? null,
          create_by: d.create_by ?? null,
        }));
        setRows(normalized);
      })
      .catch((e) => alive && setErr(e?.message || "fetch failed"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // ---- helpers
  const toDate = (v) => (v ? new Date(String(v)) : null);
  const fmtDate = (v) => {
    const d = toDate(v);
    return d && !isNaN(d) ? d.toLocaleDateString("th-TH") : "-";
  };
  const statusLabel = (n) => {
    if (n === 1) return "ใช้งาน/อนุมัติ";
    if (n === 0) return "ไม่อนุมัติ/ปิดใช้งาน";
    return n ?? "-";
  };

  // ---- filter + sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const coll = new Intl.Collator("th-TH", { sensitivity: "base", numeric: true });

    let out = rows.filter((r) => {
      if (!term) return true;
      return (
        String(r.title ?? "").toLowerCase().includes(term) ||
        String(r.code ?? "").toLowerCase().includes(term) ||
        String(r.report_code ?? "").toLowerCase().includes(term) ||
        String(r.id ?? "").toLowerCase().includes(term)
      );
    });

    out.sort((a, b) => {
      if (sort.startsWith("title")) {
        const cmp = coll.compare(String(a.title ?? ""), String(b.title ?? ""));
        return sort === "title-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("code")) {
        const cmp = coll.compare(String(a.code ?? ""), String(b.code ?? ""));
        return sort === "code-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("start")) {
        const da = toDate(a.start_date)?.getTime() ?? -Infinity;
        const db = toDate(b.start_date)?.getTime() ?? -Infinity;
        return sort === "start-asc" ? da - db : db - da;
      }
      if (sort.startsWith("end")) {
        const da = toDate(a.end_date)?.getTime() ?? -Infinity;
        const db = toDate(b.end_date)?.getTime() ?? -Infinity;
        return sort === "end-asc" ? da - db : db - da;
      }
      if (sort.startsWith("status")) {
        const sa = Number(a.status);
        const sb = Number(b.status);
        if (!Number.isNaN(sa) && !Number.isNaN(sb)) {
          return sort === "status-asc" ? sa - sb : sb - sa;
        }
        const cmp = coll.compare(String(a.status ?? ""), String(b.status ?? ""));
        return sort === "status-asc" ? cmp : -cmp;
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

  // ---- pagination
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
        title="ตารางขยายระยะเวลา (Form Extend) /form_extend.controller"
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
                placeholder="ค้นหา ชื่อเรื่อง / เลขที่ขยายเวลา / รหัส / report code…"
                className="w-96 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none"
              >
                <optgroup label="เรียงตามชื่อ/โค้ด">
                  <option value="title-asc">ชื่อเรื่อง (A→Z)</option>
                  <option value="title-desc">ชื่อเรื่อง (Z→A)</option>
                  <option value="code-asc">เลขที่ขยายเวลา (A→Z)</option>
                  <option value="code-desc">เลขที่ขยายเวลา (Z→A)</option>
                </optgroup>
                <optgroup label="เรียงตามวันที่">
                  <option value="start-asc">เริ่ม (เก่า→ใหม่)</option>
                  <option value="start-desc">เริ่ม (ใหม่→เก่า)</option>
                  <option value="end-asc">สิ้นสุด (เก่า→ใหม่)</option>
                  <option value="end-desc">สิ้นสุด (ใหม่→เก่า)</option>
                </optgroup>
                <optgroup label="เรียงตามสถานะ/รหัส">
                  <option value="status-asc">สถานะ (น้อย→มาก)</option>
                  <option value="status-desc">สถานะ (มาก→น้อย)</option>
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
                  {[3, 5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="text-sm text-black/60">
              แสดง {viewStart}-{viewEnd} จาก {total} ข้อมูล
              {q.trim() ? (
                <span className="ml-2 text-black/40">
                  (ทั้งหมด {rawTotal} ข้อมูลก่อนกรอง)
                </span>
              ) : null}
            </div>
          </div>

          {/* Table */}
          {!loading && !err && total > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-black/10">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-black/[.03] text-left text-black/60">
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">รหัส</th>
                    <th className="px-4 py-2 font-medium">เลขที่ขยายเวลา</th>
                    <th className="px-4 py-2 font-medium">ชื่อเรื่อง</th>
                    <th className="px-4 py-2 font-medium">Report Code</th>
                    <th className="px-4 py-2 font-medium">วันที่เริ่ม</th>
                    <th className="px-4 py-2 font-medium">วันที่สิ้นสุด</th>
                    <th className="px-4 py-2 font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {pageRows.map((r, i) => (
                    <tr key={r.id ?? `${startIdx + i}`} className="hover:bg-black/[.02]">
                      <td className="px-4 py-2 text-black/70">{startIdx + i + 1}</td>
                      <td className="px-4 py-2 font-mono">{r.id ?? "-"}</td>
                      <td className="px-4 py-2">{r.code ?? "-"}</td>
                      <td className="px-4 py-2">{r.title ?? "-"}</td>
                      <td className="px-4 py-2">{r.report_code || "-"}</td>
                      <td className="px-4 py-2">{fmtDate(r.start_date)}</td>
                      <td className="px-4 py-2">{fmtDate(r.end_date)}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          Number(r.status) === 1
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-50 text-gray-700 border border-gray-200"
                        }`}>
                          {statusLabel(Number(r.status))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* States */}
          {loading && <div className="mt-4 text-sm text-black/60">กำลังโหลด…</div>}
          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}
          {!loading && !err && total === 0 && (
            <div className="mt-4 text-sm text-black/60">ไม่พบข้อมูล</div>
          )}

          {/* Pagination */}
          {!loading && !err && total > 0 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-xs text-black/50">หน้า {page} / {pages}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => goTo(1)} disabled={page === 1}
                  className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40" aria-label="หน้าแรก">«</button>
                <button onClick={() => goTo(page - 1)} disabled={page === 1}
                  className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40" aria-label="ก่อนหน้า">ก่อนหน้า</button>

                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages)
                  .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p); acc.push(p); return acc; }, [])
                  .map((p) =>
                    typeof p === "number" ? (
                      <button key={p} onClick={() => goTo(p)}
                        className={`rounded-md border px-2 py-1 text-xs ${p === page ? "border-black/30 bg-black/5" : "border-black/15 bg-white hover:bg-black/5"}`}
                        aria-current={p === page ? "page" : undefined}>
                        {p}
                      </button>
                    ) : (
                      <span key={p} className="px-2 text-xs text-black/40">…</span>
                    )
                  )}

                <button onClick={() => goTo(page + 1)} disabled={page === pages}
                  className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40" aria-label="ถัดไป">ถัดไป</button>
                <button onClick={() => goTo(pages)} disabled={page === pages}
                  className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40" aria-label="หน้าสุดท้าย">»</button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
