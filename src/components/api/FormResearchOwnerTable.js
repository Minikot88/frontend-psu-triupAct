// app/(your-page)/FormResearchOwnerAllTable.jsx
"use client";

import { useMemo, useState, useEffect } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api";

/**
 * แปลงค่าทุกประเภทให้พร้อมแสดงในเซลล์
 * - primitive: แสดงตรง ๆ
 * - array/object: แสดงเป็น JSON จัดรูป และเลื่อนดูได้
 */
function CellValue({ value }) {
  const isPrimitive =
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";

  if (isPrimitive) {
    return <span>{value === null || value === undefined || value === "" ? "-" : String(value)}</span>;
  }

  // Array หรือ Object
  return (
    <pre className="max-h-40 overflow-auto rounded-md bg-gray-50 p-2 text-xs leading-snug text-gray-800">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function FormResearchOwnerTable() {
  // --- state หลัก
  const [rows, setRows] = useState([]);  // เก็บ data array ดิบ (data[].*)
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- state UI
  const [q, setQ] = useState("");                 // คำค้นหา (ค้นหาทุกฟิลด์จาก JSON string)
  const [sort, setSort] = useState("code-asc");   // code|id|created|approved asc/desc (generic fields)
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [showTable, setShowTable] = useState(true);

  // --- โหลดข้อมูล
  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiGet("/api/form_research_owner")
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.data || [];
        setRows(list);
      })
      .catch((e) => alive && setErr(e?.message || "fetch failed"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // --- รวมคีย์ทั้งหมดเป็นคอลัมน์ (ออโต้)
  const preferredOrder = [
    "form_own_id",
    "form_own_code",
    "form_own_form_name",
    "form_own_status",
    "status",
    "is_ownership",
    "is_ownership_status",
    "form_own_date_approve",
    "form_own_checked_date",
    "form_own_created_at",
    "form_own_updated_at",
    "form_own_deleted_at",
  ];

  const columns = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => Object.keys(r || {}).forEach((k) => set.add(k)));
    const all = Array.from(set);

    // เรียง: preferred ก่อน แล้วที่เหลือเรียงตามตัวอักษร
    const preferred = preferredOrder.filter((k) => set.has(k));
    const rest = all.filter((k) => !preferred.includes(k)).sort((a, b) => a.localeCompare(b));
    return [...preferred, ...rest];
  }, [rows]);

  // --- helper วันเวลา
  const toDate = (v) => (v ? new Date(String(v).replace(" ", "T")) : null);

  // --- filter + sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const coll = new Intl.Collator("th-TH", { sensitivity: "base", numeric: true });

    let out = rows.filter((r) => {
      if (!term) return true;
      try {
        const s = JSON.stringify(r).toLowerCase();
        return s.includes(term);
      } catch {
        // ถ้า stringify ไม่ได้ (ไม่ค่อยเกิด) ก็ไม่กรอง
        return true;
      }
    });

    // เรียงแบบ generic พื้นฐาน: code / id / created / approved
    out.sort((a, b) => {
      if (sort.startsWith("code")) {
        const ca = String(a.form_own_code ?? a.code ?? "");
        const cb = String(b.form_own_code ?? b.code ?? "");
        const cmp = coll.compare(ca, cb);
        return sort === "code-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("id")) {
        const ia = Number(a.form_own_id ?? a.id);
        const ib = Number(b.form_own_id ?? b.id);
        if (!Number.isNaN(ia) && !Number.isNaN(ib)) {
          return sort === "id-asc" ? ia - ib : ib - ia;
        }
        const sa = String(a.form_own_id ?? a.id ?? "");
        const sb = String(b.form_own_id ?? b.id ?? "");
        const cmp = coll.compare(sa, sb);
        return sort === "id-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("created")) {
        const da = toDate(a.form_own_created_at)?.getTime() ?? -Infinity;
        const db = toDate(b.form_own_created_at)?.getTime() ?? -Infinity;
        return sort === "created-asc" ? da - db : db - da;
      }
      if (sort.startsWith("approved")) {
        const da = toDate(a.form_own_date_approve)?.getTime() ?? -Infinity;
        const db = toDate(b.form_own_date_approve)?.getTime() ?? -Infinity;
        return sort === "approved-asc" ? da - db : db - da;
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

  useEffect(() => {
    if (page > pages) setPage(1);
  }, [pages, page]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), pages));

  return (
    <Card>
      <CardHeader
        title="ตารางเจ้าของผลงานวิจัย (แสดงทุกฟิลด์) /form_research_owner.controller"
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
                placeholder="ค้นหาในทุกฟิลด์…"
                className="w-96 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none"
              >
                <optgroup label="เรียงตามรหัส/วันเวลา">
                  <option value="code-asc">รหัสฟอร์ม (A→Z)</option>
                  <option value="code-desc">รหัสฟอร์ม (Z→A)</option>
                  <option value="id-asc">รหัสภายใน (1→99)</option>
                  <option value="id-desc">รหัสภายใน (99→1)</option>
                  <option value="created-asc">วันที่สร้าง (เก่า→ใหม่)</option>
                  <option value="created-desc">วันที่สร้าง (ใหม่→เก่า)</option>
                  <option value="approved-asc">วันอนุมัติ (เก่า→ใหม่)</option>
                  <option value="approved-desc">วันอนุมัติ (ใหม่→เก่า)</option>
                </optgroup>
              </select>

              <div className="flex items-center gap-2">
                <label className="text-sm text-black/60">ต่อหน้า</label>
                <select
                  value={size}
                  onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
                  className="rounded-xl border border-black/15 bg-white px-2 py-1.5 text-sm outline-none"
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="text-sm text-black/60">
              แสดง {viewStart}-{viewEnd} จาก {total} ข้อมูล
              {q.trim() ? (
                <span className="ml-2 text-black/40">(ทั้งหมด {rawTotal} ข้อมูลก่อนกรอง)</span>
              ) : null}
            </div>
          </div>

          {/* Table */}
          {!loading && !err && total > 0 && (
            <div className="mt-4 overflow-auto rounded-xl border border-black/10">
              <table className="min-w-full bg-white text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="bg-black/[.03] text-left text-black/60">
                    <th className="px-4 py-2 font-medium">#</th>
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-2 font-medium whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {pageRows.map((row, i) => (
                    <tr key={(row.form_own_id ?? row.id ?? startIdx + i) + "-row"} className="hover:bg-black/[.02] align-top">
                      <td className="px-4 py-2 text-black/70 whitespace-nowrap">
                        {startIdx + i + 1}
                      </td>
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2">
                          <CellValue value={row[col]} />
                        </td>
                      ))}
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
                        className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">«</button>
                <button onClick={() => goTo(page - 1)} disabled={page === 1}
                        className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">ก่อนหน้า</button>

                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p);
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p) =>
                    typeof p === "number" ? (
                      <button key={p} onClick={() => goTo(p)}
                              className={`rounded-md border px-2 py-1 text-xs ${
                                p === page ? "border-black/30 bg-black/5" : "border-black/15 bg-white hover:bg-black/5"
                              }`}
                              aria-current={p === page ? "page" : undefined}>
                        {p}
                      </button>
                    ) : (
                      <span key={p} className="px-2 text-xs text-black/40">…</span>
                    )
                  )}

                <button onClick={() => goTo(page + 1)} disabled={page === pages}
                        className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">ถัดไป</button>
                <button onClick={() => goTo(pages)} disabled={page === pages}
                        className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40">»</button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
