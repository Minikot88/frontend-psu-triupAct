// app/(your-page)/FormResearchOwnerJsonTable.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api";

/** utility: แปลงค่าใดๆ เป็น string ที่อ่านง่าย + ตัดให้สั้น (พร้อม title tooltip) */
function preview(value, max = 80) {
  const isPrimitive =
    value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";

  const full =
    isPrimitive ? String(value ?? "") : JSON.stringify(value, (_k, v) => (v === null ? "" : v));

  if (full.length <= max) return { short: full, full };
  return { short: full.slice(0, max) + "…", full };
}

/** utility: สร้างชุดคอลัมน์จาก union ของ key ทั้งหมด */
function buildColumns(rows) {
  const set = new Set();
  rows.forEach((r) => Object.keys(r || {}).forEach((k) => set.add(k)));
  const all = Array.from(set);

  // จัดลำดับ: id/code/ชื่อก่อน แล้วที่เหลือเรียง A→Z
  const head = ["form_own_id", "form_own_code", "form_own_form_name", "form_own_status"];
  const rest = all.filter((c) => !head.includes(c)).sort((a, b) => a.localeCompare(b));
  return head.filter((c) => set.has(c)).concat(rest);
}

export default function FormResearchOwnerTable() {
  // data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ui state
  const [q, setQ] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showTable, setShowTable] = useState(true);

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
    return () => {
      alive = false;
    };
  }, []);

  // filter
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      JSON.stringify(r ?? {}, (_k, v) => (v === null ? "" : v))
        .toLowerCase()
        .includes(term)
    );
  }, [rows, q]);

  // columns
  const columns = useMemo(() => buildColumns(filtered), [filtered]);

  // pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const startIdx = (page - 1) * size;
  const pageRows = filtered.slice(startIdx, startIdx + size);
  useEffect(() => {
    if (page > pages) setPage(1);
  }, [pages, page]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), pages));

  return (
    <Card>
      <CardHeader
        title="Form Research Owner — ตารางแสดงทุกฟิลด์จาก JSON"
        onToggle={() => setShowTable(!showTable)}
        isOpen={showTable}
      />

      {/* Toolbar */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาทุกฟิลด์… (รหัส/ชื่อฟอร์ม/สถานะ/หน่วยงาน/อีเมล/ฯลฯ)"
            className="w-[28rem] rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-black/60">ต่อหน้า</label>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
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

        <div className="text-sm text-black/60">
          ทั้งหมด {total} รายการ
          {q.trim() ? (
            <span className="ml-2 text-black/40">(ก่อนกรอง {rows.length})</span>
          ) : null}
        </div>
      </div>

      {/* states */}
      {loading && <div className="mt-4 text-sm text-black/60">กำลังโหลด…</div>}
      {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

      {/* table */}
      {!loading && !err && showTable && total > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-black/10">
          <table className="min-w-full bg-white text-xs sm:text-sm">
            <thead className="sticky top-0 z-10 bg-black/[.03]">
              <tr className="text-left text-black/60">
                <th className="px-3 py-2 font-medium">#</th>
                {columns.map((c) => (
                  <th key={c} className="px-3 py-2 font-medium whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {pageRows.map((row, i) => (
                <tr key={row.form_own_id ?? `${startIdx + i}`} className="hover:bg-black/[.02] align-top">
                  <td className="px-3 py-2 text-black/70">{startIdx + i + 1}</td>
                  {columns.map((c) => {
                    const v = row?.[c];
                    const { short, full } = preview(v);
                    // พิเศษ: ถ้ามี url ในอ็อบเจ็กต์ไฟล์ ให้โชว์ลิงก์ตัวแรก
                    if (Array.isArray(v) && v.length && typeof v[0] === "object" && "url" in v[0]) {
                      return (
                        <td key={c} className="px-3 py-2">
                          <div className="flex flex-col gap-1">
                            {v.map((f, idx) => (
                              <a
                                key={idx}
                                href={f.url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className={`truncate text-blue-600 hover:underline ${f.url ? "" : "pointer-events-none opacity-50"}`}
                                title={f.fu_name || f.url}
                              >
                                {f.fu_name || f.url || "ไฟล์แนบ"}
                              </a>
                            ))}
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={c} className="px-3 py-2">
                        <span className="inline-block max-w-[360px] truncate align-top" title={full}>
                          {short === "" ? "-" : short}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination */}
      {!loading && !err && total > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xs text-black/50">
            หน้า {page} / {pages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goTo(1)}
              disabled={page === 1}
              className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40"
            >
              «
            </button>
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40"
            >
              ก่อนหน้า
            </button>

            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p);
                acc.push(p);
                return acc;
              }, [])
              .map((p) =>
                typeof p === "number" ? (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      p === page ? "border-black/30 bg-black/5" : "border-black/15 bg-white hover:bg-black/5"
                    }`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={p} className="px-2 text-xs text-black/40">
                    …
                  </span>
                )
              )}

            <button
              onClick={() => goTo(page + 1)}
              disabled={page === pages}
              className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40"
            >
              ถัดไป
            </button>
            <button
              onClick={() => goTo(pages)}
              disabled={page === pages}
              className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40"
            >
              »
            </button>
          </div>
        </div>
      )}

      {!loading && !err && total === 0 && (
        <div className="mt-4 text-sm text-black/60">ไม่พบข้อมูล</div>
      )}
    </Card>
  );
}
