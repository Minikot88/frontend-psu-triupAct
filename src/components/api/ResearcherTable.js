"use client";

import { useMemo, useState, useEffect, Fragment } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api"; // ต้องมีฟังก์ชันนี้

export default function ResearcherTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");            // คำค้นหา
  const [sort, setSort] = useState("name-asc"); // ตัวเลือกเรียง
  const [page, setPage] = useState(1);       // หน้าปัจจุบัน
  const [size, setSize] = useState(3);      // แถวต่อหน้า
  const [showTable, setShowTable] = useState(true);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    apiGet("/api/researcher")
      .then((data) => {
        if (!alive) return;

        // รองรับทั้งแบบ { data: [...] } และ [] ตรงๆ
        const list = Array.isArray(data) ? data : data?.data || [];

        const normalized = list.map((d, i) => ({
          id: d?.user_id ?? i + 1,
          userId: d?.user_id ?? null,
          email: d?.email ?? "",
          cardId: d?.card_id ?? "",
          role: d?.default_role_id ?? "",
          departmentId: d?.department_id ?? "",
          fullname: d?.fullname ?? "-",
          departmentName: d?.department_name ?? "-",
        }));

        setRows(normalized);
      })
      .catch((e) => {
        setErr(e?.message || "fetch failed");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // filter + sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (!term) return true;
      return (
        String(r.fullname ?? "").toLowerCase().includes(term) ||
        String(r.departmentName ?? "").toLowerCase().includes(term) ||
        String(r.email ?? "").toLowerCase().includes(term) ||
        String(r.cardId ?? "").toLowerCase().includes(term) ||
        String(r.role ?? "").toLowerCase().includes(term)
      );
    });

    out.sort((a, b) => {
      if (sort.startsWith("name")) {
        const cmp = String(a.fullname ?? "").localeCompare(
          String(b.fullname ?? ""),
          "th"
        );
        return sort === "name-asc" ? cmp : -cmp;
      } else if (sort.startsWith("dept")) {
        const cmp = String(a.departmentName ?? "").localeCompare(
          String(b.departmentName ?? ""),
          "th"
        );
        return sort === "dept-asc" ? cmp : -cmp;
      } else if (sort.startsWith("id")) {
        const na = Number(a.userId);
        const nb = Number(b.userId);
        if (!isNaN(na) && !isNaN(nb)) {
          return sort === "id-asc" ? na - nb : nb - na;
        }
        const cmp = String(a.userId ?? "").localeCompare(String(b.userId ?? ""), "th", { numeric: true });
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

  // mask เลขบัตรแบบง่าย ๆ (โชว์ต้น-ท้าย)
  const maskCard = (v) => {
    if (!v) return "-";
    const s = String(v);
    if (s.length <= 4) return "****";
    return s.slice(0, 2) + "****" + s.slice(-2);
    // ปรับรูปแบบได้ตามนโยบายข้อมูลส่วนบุคคลของโปรเจกต์
  };

  return (
    <Card>
      <CardHeader
        title="ตารางนักวิจัย /api/researcher"
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
                placeholder="ค้นหา ชื่อ/หน่วยงาน/อีเมล/เลขบัตร/บทบาท…"
                className="w-96 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="name-asc">ชื่อ (A→Z)</option>
                <option value="name-desc">ชื่อ (Z→A)</option>
                <option value="dept-asc">หน่วยงาน (A→Z)</option>
                <option value="dept-desc">หน่วยงาน (Z→A)</option>
                <option value="id-asc">User ID (น้อย→มาก)</option>
                <option value="id-desc">User ID (มาก→น้อย)</option>
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
                  {[3, 10, 20, 50, 100].map((n) => (
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
                    <th className="px-4 py-2 font-medium">User&nbsp;ID</th>
                    <th className="px-4 py-2 font-medium">ชื่อ–สกุล</th>
                    <th className="px-4 py-2 font-medium">หน่วยงาน</th>
                    <th className="px-4 py-2 font-medium">อีเมล</th>
                    <th className="px-4 py-2 font-medium">เลขบัตร</th>
                    <th className="px-4 py-2 font-medium">บทบาท</th>
                    <th className="px-4 py-2 font-medium">Dept&nbsp;ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {pageRows.map((r, i) => (
                    <tr key={r.id ?? `${startIdx + i}`} className="hover:bg-black/[.02]">
                      <td className="px-4 py-2 text-black/70">{startIdx + i + 1}</td>
                      <td className="px-4 py-2 font-mono">{r.userId ?? "-"}</td>
                      <td className="px-4 py-2">{r.fullname || "-"}</td>
                      <td className="px-4 py-2">{r.departmentName || "-"}</td>
                      <td className="px-4 py-2">
                        {r.email ? (
                          <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline">
                            {r.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2">{maskCard(r.cardId)}</td>
                      <td className="px-4 py-2">{r.role || "-"}</td>
                      <td className="px-4 py-2 text-right">{r.departmentId ?? "-"}</td>
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
