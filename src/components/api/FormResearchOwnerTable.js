// app/(your-page)/FormResearchOwnerAllTable.jsx
"use client";

import { useMemo, useState, useEffect, Fragment } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api";

function CellValue({ value }) {
  const isPrimitive =
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";

  if (isPrimitive) {
    return (
      <span>
        {value === null || value === undefined || value === "" ? "-" : String(value)}
      </span>
    );
  }

  // Array หรือ Object
  return (
    <pre className="max-h-40 overflow-auto rounded-md bg-gray-50 p-2 text-xs leading-snug text-gray-800">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

// helper แปลงวันเวลาเป็น พ.ศ. (รูปแบบย่อ)
function formatThaiDate(input) {
  if (!input) return "-";
  // รองรับ "YYYY-MM-DD HH:mm:ss" ด้วย
  const d = new Date(String(input).replace(" ", "T"));
  if (isNaN(d)) return String(input);
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const yearBE = d.getFullYear() + 543;
  return `${day} ${month} ${yearBE}`;
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
  const [size, setSize] = useState(3);
  const [showTable, setShowTable] = useState(true);
  const [expanded, setExpanded] = useState({});   // แสดง/ซ่อนรายละเอียดรายแถว

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

  // --- รวมคีย์ทั้งหมดเป็นคอลัมน์ (ออโต้) เพื่อใช้ในรายละเอียด (fallback)
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

  const allColumns = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => Object.keys(r || {}).forEach((k) => set.add(k)));
    const all = Array.from(set);
    const preferred = preferredOrder.filter((k) => set.has(k));
    const rest = all.filter((k) => !preferred.includes(k)).sort((a, b) => a.localeCompare(b));
    return [...preferred, ...rest];
  }, [rows]);

  // --- helper วันเวลา
  const toDate = (v) => (v ? new Date(String(v).replace(" ", "T")) : null);

  // --- สร้าง “summary แถว” ให้อ่านง่ายในตารางหลัก
  const displayRows = useMemo(() => {
    return rows.map((r, idx) => ({
      _key: r?.form_own_id ?? r?.id ?? `${r?.form_own_code ?? "row"}-${idx}`,
      code: r?.form_own_code ?? r?.code ?? "-",
      name: r?.form_own_form_name ?? r?.name ?? "-",
      status: r?.form_own_status ?? r?.status ?? "-",
      ownership: r?.is_ownership ?? r?.is_ownership_status ?? null, // true/false/1/0/str
      approvedAt: r?.form_own_date_approve ?? r?.approved_at ?? null,
      createdAt: r?.form_own_created_at ?? r?.created_at ?? null,
      updatedAt: r?.form_own_updated_at ?? r?.updated_at ?? null,
      checkedAt: r?.form_own_checked_date ?? r?.checked_at ?? null,
      _raw: r, // เก็บของเดิมไว้ใช้ในรายละเอียด
    }));
  }, [rows]);

  // --- filter + sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const coll = new Intl.Collator("th-TH", { sensitivity: "base", numeric: true });

    let out = displayRows.filter((r) => {
      if (!term) return true;
      try {
        const s = JSON.stringify(r._raw).toLowerCase();
        return s.includes(term);
      } catch {
        return true;
      }
    });

    // เรียงแบบ generic พื้นฐาน: code / id / created / approved
    out.sort((a, b) => {
      if (sort.startsWith("code")) {
        const ca = String(a.code ?? "");
        const cb = String(b.code ?? "");
        const cmp = coll.compare(ca, cb);
        return sort === "code-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("id")) {
        const ia = Number(a._raw?.form_own_id ?? a._raw?.id);
        const ib = Number(b._raw?.form_own_id ?? b._raw?.id);
        if (!Number.isNaN(ia) && !Number.isNaN(ib)) {
          return sort === "id-asc" ? ia - ib : ib - ia;
        }
        const sa = String(a._raw?.form_own_id ?? a._raw?.id ?? "");
        const sb = String(b._raw?.form_own_id ?? b._raw?.id ?? "");
        const cmp = coll.compare(sa, sb);
        return sort === "id-asc" ? cmp : -cmp;
      }
      if (sort.startsWith("created")) {
        const da = toDate(a.createdAt)?.getTime() ?? -Infinity;
        const db = toDate(b.createdAt)?.getTime() ?? -Infinity;
        return sort === "created-asc" ? da - db : db - da;
      }
      if (sort.startsWith("approved")) {
        const da = toDate(a.approvedAt)?.getTime() ?? -Infinity;
        const db = toDate(b.approvedAt)?.getTime() ?? -Infinity;
        return sort === "approved-asc" ? da - db : db - da;
      }
      return 0;
    });

    return out;
  }, [displayRows, q, sort]);

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
  const toggleExpand = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // ป้ายสถานะสั้น ๆ
  const StatusPill = ({ text }) => (
    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
      {text || "-"}
    </span>
  );

  const BoolBadge = ({ val }) => {
    const v = typeof val === "string" ? val.trim().toLowerCase() : val;
    const truthy = v === true || v === 1 || v === "1" || v === "true" || v === "yes";
    const falsy = v === false || v === 0 || v === "0" || v === "false" || v === "no";
    return (
      <span
        className={
          "rounded-md px-2 py-0.5 text-xs ring-1 " +
          (truthy
            ? "bg-green-50 text-green-700 ring-green-200"
            : falsy
            ? "bg-gray-50 text-gray-600 ring-gray-200"
            : "bg-sky-50 text-sky-700 ring-sky-200")
        }
      >
        {truthy ? "เป็นเจ้าของ" : falsy ? "ไม่เป็นเจ้าของ" : String(val ?? "-")}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader
        title="ตารางเจ้าของผลงานวิจัย /api/form_research_owner"
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
                  {[3, 5, 10, 20, 50, 100].map((n) => (
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
            <div className="mt-4 overflow-x-auto rounded-xl border border-black/10">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-black/[.03] text-left text-black/60">
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">รหัส</th>
                    <th className="px-4 py-2 font-medium">ชื่อฟอร์ม/ผลงาน</th>
                    <th className="px-4 py-2 font-medium">สถานะ</th>
                    <th className="px-4 py-2 font-medium">ความเป็นเจ้าของ</th>
                    <th className="px-4 py-2 font-medium">วันอนุมัติ</th>
                    <th className="px-4 py-2 font-medium">สร้างเมื่อ</th>
                    <th className="px-4 py-2 font-medium">อัปเดตล่าสุด</th>
                    <th className="px-4 py-2 font-medium">การทำงาน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {pageRows.map((r, i) => {
                    const isOpen = !!expanded[r._key];
                    const raw = r._raw || {};
                    return (
                      <Fragment key={r._key}>
                        <tr className="hover:bg-black/[.02] align-top">
                          <td className="px-4 py-2 text-black/70">{startIdx + i + 1}</td>
                          <td className="px-4 py-2 font-mono">{r.code || "-"}</td>
                          <td className="px-4 py-2 w-30 min-w-[10rem]">{r.name || "-"}</td>
                          <td className="px-4 py-2 w-30 min-w-[8rem] "><StatusPill text={r.status} /></td>
                          <td className="px-4 py-2 w-30 min-w-[8rem] "><BoolBadge val={r.ownership} /></td>
                          <td className="px-4 py-2 whitespace-nowrap">{formatThaiDate(r.approvedAt)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{formatThaiDate(r.createdAt)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{formatThaiDate(r.updatedAt)}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => toggleExpand(r._key)}
                              className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs hover:bg-black/5"
                              aria-expanded={isOpen}
                              aria-controls={`detail-${r._key}`}
                            >
                              {isOpen ? "ซ่อนรายละเอียด" : "รายละเอียด"}
                            </button>
                          </td>
                        </tr>

                        {/* แถวรายละเอียด (Expandable) */}
                        {isOpen && (
                          <tr id={`detail-${r._key}`} className="bg-black/[.015]">
                            <td colSpan={9} className="px-4 py-3">
                              {/* บล็อกข้อมูลแบบอ่านง่าย */}
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="rounded-lg border border-black/10 p-3">
                                  <div className="text-xs text-black/50">รหัสภายใน</div>
                                  <div className="text-sm">
                                    <CellValue value={raw.form_own_id ?? raw.id} />
                                  </div>
                                </div>
                                <div className="rounded-lg border border-black/10 p-3">
                                  <div className="text-xs text-black/50">สถานะระบบ</div>
                                  <div className="text-sm">
                                    <CellValue value={raw.status ?? raw.form_own_status} />
                                  </div>
                                </div>
                                <div className="rounded-lg border border-black/10 p-3">
                                  <div className="text-xs text-black/50">ตรวจสอบเมื่อ</div>
                                  <div className="text-sm">{formatThaiDate(raw.form_own_checked_date)}</div>
                                </div>
                              </div>

                              {/* ตาราง “ฟิลด์สำคัญ” */}
                              <div className="mt-3">
                                <div className="font-medium">ฟิลด์สำคัญ</div>
                                <div className="mt-1 overflow-x-auto">
                                  <table className="min-w-[640px] text-sm">
                                    <thead>
                                      <tr className="text-left text-black/60">
                                        <th className="border-b border-black/10 px-2 py-1.5 font-medium">ฟิลด์</th>
                                        <th className="border-b border-black/10 px-2 py-1.5 font-medium">ค่า</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {[
                                        ["form_own_code", raw.form_own_code],
                                        ["form_own_form_name", raw.form_own_form_name],
                                        ["form_own_status", raw.form_own_status],
                                        ["is_ownership", raw.is_ownership],
                                        ["is_ownership_status", raw.is_ownership_status],
                                        ["form_own_date_approve", formatThaiDate(raw.form_own_date_approve)],
                                        ["form_own_checked_date", formatThaiDate(raw.form_own_checked_date)],
                                        ["form_own_created_at", formatThaiDate(raw.form_own_created_at)],
                                        ["form_own_updated_at", formatThaiDate(raw.form_own_updated_at)],
                                        ["form_own_deleted_at", formatThaiDate(raw.form_own_deleted_at)],
                                      ].map(([k, v]) => (
                                        <tr key={k} className="align-top">
                                          <td className="border-b border-black/10 px-2 py-1.5 whitespace-nowrap">{k}</td>
                                          <td className="border-b border-black/10 px-2 py-1.5">
                                            {k.startsWith("is_ownership") ? <BoolBadge val={v} /> : <CellValue value={v} />}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Fallback: แสดงทุกฟิลด์ (อัตโนมัติ) */}
                              <div className="mt-3">
                                <details className="group">
                                  <summary className="cursor-pointer select-none text-sm text-black/70 hover:text-black">
                                    แสดงทุกฟิลด์ทั้งหมด
                                  </summary>
                                  <div className="mt-2 overflow-x-auto">
                                    <table className="min-w-[720px] text-sm">
                                      <thead>
                                        <tr className="text-left text-black/60">
                                          <th className="border-b border-black/10 px-2 py-1.5 font-medium">ฟิลด์</th>
                                          <th className="border-b border-black/10 px-2 py-1.5 font-medium">ค่า</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {allColumns.map((col) => (
                                          <tr key={col} className="align-top">
                                            <td className="border-b border-black/10 px-2 py-1.5 whitespace-nowrap">{col}</td>
                                            <td className="border-b border-black/10 px-2 py-1.5">
                                              {/* แปลงวันที่อัตโนมัติหากชื่อฟิลด์สื่อความเป็น date */}
                                              {/(date|_at)$/i.test(col)
                                                ? formatThaiDate(raw[col])
                                                : <CellValue value={raw[col]} />}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </details>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
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
