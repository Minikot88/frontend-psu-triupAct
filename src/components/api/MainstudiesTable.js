"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api"; // ต้อง import มาด้วย

export default function MainstudiesTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");               // คำค้นหา
  const [sort, setSort] = useState("title-asc"); // เรียงชื่อ A→Z
  const [page, setPage] = useState(1);          // หน้าปัจจุบัน
  const [size, setSize] = useState(3);         // แถวต่อหน้า
  const [showTable, setShowTable] = useState(true);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    apiGet("/api/mainstudies")
      .then((data) => {
        if (!alive) return;

        // รองรับทั้ง { data: [...] } หรือ array ตรง ๆ
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const normalized = list.map((d, i) => ({
          id: d?.id ?? i + 1,
          title: d?.title ?? d?.name ?? "-",
        }));

        setRows(normalized);
      })
      .catch((e) => alive && setErr(e?.message || "fetch failed"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  // filter + sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = rows.filter(
      (r) =>
        !term ||
        String(r.title ?? "").toLowerCase().includes(term) ||
        String(r.id ?? "").toLowerCase().includes(term)
    );

    out.sort((a, b) => {
      if (sort.startsWith("title")) {
        const cmp = String(a.title ?? "").localeCompare(String(b.title ?? ""), "th", {
          sensitivity: "base",
        });
        return sort === "title-asc" ? cmp : -cmp;
      } else if (sort.startsWith("id")) {
        const na = Number(a.id);
        const nb = Number(b.id);
        if (!isNaN(na) && !isNaN(nb)) {
          return sort === "id-asc" ? na - nb : nb - na;
        }
        const cmp = String(a.id ?? "").localeCompare(String(b.id ?? ""), "th", {
          numeric: true,
          sensitivity: "base",
        });
        return sort === "id-asc" ? cmp : -cmp;
      }
      return 0;
    });

    return out;
  }, [rows, q, sort]);

  // pagination
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
        title="ตารางสาขาหลัก /api/mainstudies"
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
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหา ชื่อสาขา หรือ ID…"
                className="w-80 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="title-asc">ชื่อ (A→Z)</option>
                <option value="title-desc">ชื่อ (Z→A)</option>
                <option value="id-asc">ID (น้อย→มาก)</option>
                <option value="id-desc">ID (มาก→น้อย)</option>
              </select>

              <div className="flex items-center gap-2">
                <label className="text-sm text-black/60">แถวต่อหน้า</label>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-xl border border-black/15 bg-white px-2 py-1.5 text-sm outline-none"
                >
                  {[3,6,].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="text-sm text-black/60">
              แสดง {viewStart}-{viewEnd} จาก {total} รายการ
              {q.trim() ? (
                <span className="ml-2 text-black/40">
                  (ทั้งหมด {rawTotal} ก่อนกรอง)
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
                    <th className="px-4 py-2 font-medium">ID</th>
                    <th className="px-4 py-2 font-medium">ชื่อสาขาหลัก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {pageRows.map((r, i) => (
                    <tr key={r.id ?? `${startIdx + i}`} className="hover:bg-black/[.02]">
                      <td className="px-4 py-2 text-black/70">{startIdx + i + 1}</td>
                      <td className="px-4 py-2 font-mono">{r.id}</td>
                      <td className="px-4 py-2">{r.title || "-"}</td>
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
              <div className="text-xs text-black/50">
                หน้า {page} / {pages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goTo(1)}
                  disabled={page === 1}
                  className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40"
                  aria-label="หน้าแรก"
                >
                  «
                </button>
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 1}
                  className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40"
                  aria-label="ก่อนหน้า"
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
                          p === page
                            ? "border-black/30 bg-black/5"
                            : "border-black/15 bg-white hover:bg-black/5"
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
                  aria-label="ถัดไป"
                >
                  ถัดไป
                </button>
                <button
                  onClick={() => goTo(pages)}
                  disabled={page === pages}
                  className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs disabled:opacity-40"
                  aria-label="หน้าสุดท้าย"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
