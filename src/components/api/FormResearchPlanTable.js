"use client";

import { useMemo, useState, useEffect } from "react";
import Card from "@/components/Card";
import CardHeader from "@/components/CardHeader";
import { apiGet } from "@/lib/api"; // ต้อง import มาด้วย

export default function FormResearchPlanTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState(""); // คำค้นหา
  const [sort, setSort] = useState("name-asc"); // เรียงตามชื่อ/รหัส
  const [page, setPage] = useState(1); // หน้าปัจจุบัน
  const [size, setSize] = useState(3); // แถวต่อหน้า
  const [showTable, setShowTable] = useState(true);
  const [expanded, setExpanded] = useState({}); // แสดงรายละเอียดรายแถว

  // ---- helpers ----
  const pad2 = (n) => String(n).padStart(2, "0");

  // แปลงวันที่เป็น พ.ศ. แบบย่อ (10 มิ.ย. 2567)
  const formatThaiDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const yearBE = d.getFullYear() + 543;
    return `${day} ${month} ${yearBE}`;
  };

  const formatMoney = (val) => {
    const num = Number(val);
    if (isNaN(num)) return val ?? "-";
    return num.toLocaleString("th-TH", { maximumFractionDigits: 2 });
  };

  const safeArr = (v) => (Array.isArray(v) ? v : []);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    apiGet("/api/form_research_plan")
      .then((data) => {
        if (!alive) return;

        // บางครั้ง API ภายนอกอาจส่ง {data: [...]} หรือเป็น object เดี่ยว
        const raw = data?.data ?? data;
        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

        const normalized = list.map((d, i) => {
          const fullname =
            d?.fullname ||
            [d?.form_plan_fullname, d?.form_plan_lastname]
              .filter(Boolean)
              .join(" ") ||
            "-";
          return {
            id: d?.form_plan_id ?? i + 1,
            code: d?.form_plan_code ?? "-",
            fullname,
            department: d?.form_plan_department ?? "-",
            position: d?.form_plan_position ?? "-",
            tel: d?.form_plan_tel ?? "-",
            email: d?.form_plan_email ?? "-",
            typeStatus: d?.form_plan_type_status ?? "-",
            periodMonths: d?.form_plan_period ?? "",
            startDate: d?.form_plan_start_date ?? "",
            usageValue: d?.form_plan_usage_value ?? "",
            status: (d?.form_plan_status ?? "").trim() || "-",
            checkedDate: d?.form_plan_checked_date ?? "",
            // รายละเอียดเสริม
            target: d?.form_plan_target ?? "",
            userTarget: d?.form_plan_user_target ?? "",
            result: d?.form_plan_result ?? "",
            userResult: d?.form_plan_user_result ?? "",
            objectives: safeArr(d?.objective),
            periods: safeArr(d?.period),
            createdAt: d?.form_plan_created_at ?? "",
            updatedAt: d?.form_plan_updated_at ?? "",
          };
        });

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
    let out = rows.filter((r) => {
      if (!term) return true;
      return (
        String(r.code ?? "")
          .toLowerCase()
          .includes(term) ||
        String(r.fullname ?? "")
          .toLowerCase()
          .includes(term) ||
        String(r.department ?? "")
          .toLowerCase()
          .includes(term) ||
        String(r.email ?? "")
          .toLowerCase()
          .includes(term) ||
        String(r.status ?? "")
          .toLowerCase()
          .includes(term)
      );
    });

    out.sort((a, b) => {
      if (sort.startsWith("name")) {
        const cmp = String(a.fullname ?? "").localeCompare(
          String(b.fullname ?? ""),
          "th"
        );
        return sort === "name-asc" ? cmp : -cmp;
      } else if (sort.startsWith("code")) {
        const cmp = String(a.code ?? "").localeCompare(
          String(b.code ?? ""),
          "th",
          {
            numeric: true,
            sensitivity: "base",
          }
        );
        return sort === "code-asc" ? cmp : -cmp;
      } else if (sort.startsWith("budget")) {
        const na = Number(a.usageValue);
        const nb = Number(b.usageValue);
        const cmp = (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
        return sort === "budget-asc" ? cmp : -cmp;
      } else if (sort.startsWith("start")) {
        const da = new Date(a.startDate).getTime();
        const db = new Date(b.startDate).getTime();
        const cmp = (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db);
        return sort === "start-asc" ? cmp : -cmp;
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
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Card>
      <CardHeader
        title="ตารางข้อมูลแบบฟอร์มแผนวิจัย /api/form_research_plan"
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
                placeholder="ค้นหา โค้ด/ชื่อ/หน่วยงาน/อีเมล/สถานะ…"
                className="w-80 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="name-asc">ชื่อ (A→Z)</option>
                <option value="name-desc">ชื่อ (Z→A)</option>
                <option value="code-asc">รหัส (A→Z)</option>
                <option value="code-desc">รหัส (Z→A)</option>
                <option value="budget-asc">งบประมาณ (น้อย→มาก)</option>
                <option value="budget-desc">งบประมาณ (มาก→น้อย)</option>
                <option value="start-asc">วันเริ่ม (เก่า→ใหม่)</option>
                <option value="start-desc">วันเริ่ม (ใหม่→เก่า)</option>
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
                    <th className="px-4 py-2 font-medium">รหัส</th>
                    <th className="px-4 py-2 font-medium">ชื่อ–สกุล</th>
                    <th className="px-4 py-2 font-medium">หน่วยงาน</th>
                    <th className="px-4 py-2 font-medium">โทร</th>
                    <th className="px-4 py-2 font-medium">อีเมล</th>
                    <th className="px-4 py-2 font-medium">งบประมาณ</th>
                    <th className="px-4 py-2 font-medium">เริ่ม</th>
                    <th className="px-4 py-2 font-medium">ระยะ(ด.)</th>
                    <th className="px-4 py-2 font-medium">สถานะ</th>
                    <th className="px-4 py-2 font-medium">การทำงาน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {pageRows.map((r, i) => {
                    const isOpen = !!expanded[r.id];
                    return (
                      <Fragment key={r.id ?? `${startIdx + i}`}>
                        <tr className="hover:bg-black/[.02] align-top">
                          <td className="px-4 py-2 text-black/70">
                            {startIdx + i + 1}
                          </td>
                          <td className="px-4 py-2 font-mono">
                            {r.code || "-"}
                          </td>
                          <td className="px-4 py-2">{r.fullname || "-"}</td>
                          <td className="px-4 py-2">{r.department || "-"}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {r.tel || "-"}
                          </td>
                          <td className="px-4 py-2">
                            {r.email ? (
                              <a
                                href={`mailto:${r.email}`}
                                className="text-blue-600 hover:underline"
                              >
                                {r.email}
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {r.usageValue ? formatMoney(r.usageValue) : "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {formatThaiDate(r.startDate)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {r.periodMonths || "-"}
                          </td>
                          <td className="px-4 py-2 w-30 min-w-[8rem]">
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
                              {r.status || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-2 w-30 min-w-[8rem] ">
                            <button
                              onClick={() => toggleExpand(r.id)}
                              className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs hover:bg-black/5"
                              aria-expanded={isOpen}
                              aria-controls={`detail-${r.id}`}
                            >
                              {isOpen ? "ซ่อนรายละเอียด" : "รายละเอียด"}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded details */}
                        {isOpen && (
                          <tr id={`detail-${r.id}`} className="bg-black/[.015]">
                            <td colSpan={11} className="px-4 py-3">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="rounded-lg border border-black/10 p-3">
                                  <div className="text-xs text-black/50">
                                    ประเภทแผน
                                  </div>
                                  <div className="text-sm">
                                    {r.typeStatus || "-"}
                                  </div>
                                </div>

                                <div className="rounded-lg border border-black/10 p-3">
                                  <div className="text-xs text-black/50">
                                    ผู้ตรวจสอบ
                                  </div>
                                  <div className="text-sm">
                                    {r.checkedDate
                                      ? formatThaiDate(r.checkedDate)
                                      : "-"}
                                  </div>
                                </div>

                                <div className="rounded-lg border border-black/10 p-3">
                                  <div className="text-xs text-black/50">
                                    เป้าหมาย/ผู้ใช้
                                  </div>
                                  <div className="text-sm">
                                    {(r.target || "-") +
                                      (r.userTarget
                                        ? ` / ${r.userTarget}`
                                        : "")}
                                  </div>
                                </div>
                              </div>

                              {/* Objectives */}
                              <div className="mt-3">
                                <div className="font-medium">
                                  วัตถุประสงค์การใช้ประโยชน์
                                </div>
                                {r.objectives.length > 0 ? (
                                  <ul className="mt-1 list-disc space-y-1 pl-6">
                                    {r.objectives.map((row, idx) => (
                                      <li key={idx} className="text-sm">
                                        {Array.isArray(row)
                                          ? row.join(" • ")
                                          : String(row)}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-sm text-black/60">-</div>
                                )}
                              </div>

                              {/* Period plan */}
                              <div className="mt-3">
                                <div className="font-medium">
                                  แผนระยะเวลา/กิจกรรม
                                </div>
                                {r.periods.length > 0 ? (
                                  <div className="mt-1 overflow-x-auto">
                                    <table className="min-w-[640px] text-sm">
                                      <thead>
                                        <tr className="text-left text-black/60">
                                          <th className="border-b border-black/10 px-2 py-1.5 font-medium">
                                            ระยะเวลา
                                          </th>
                                          <th className="border-b border-black/10 px-2 py-1.5 font-medium">
                                            กิจกรรม
                                          </th>
                                          <th className="border-b border-black/10 px-2 py-1.5 font-medium">
                                            ผลที่คาดว่าจะได้รับ
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {r.periods.map((row, idx) => {
                                          const [period, activity, expected] =
                                            Array.isArray(row)
                                              ? row
                                              : [String(row) || "-", "-", "-"];
                                          return (
                                            <tr key={idx} className="align-top">
                                              <td className="border-b border-black/10 px-2 py-1.5">
                                                {period || "-"}
                                              </td>
                                              <td className="border-b border-black/10 px-2 py-1.5">
                                                {activity || "-"}
                                              </td>
                                              <td className="border-b border-black/10 px-2 py-1.5">
                                                {expected || "-"}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-sm text-black/60">-</div>
                                )}
                              </div>

                              {/* Timestamps */}
                              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div className="text-xs text-black/60">
                                  สร้างเมื่อ:{" "}
                                  {r.createdAt
                                    ? formatThaiDate(r.createdAt)
                                    : "-"}
                                </div>
                                <div className="text-xs text-black/60">
                                  อัปเดตล่าสุด:{" "}
                                  {r.updatedAt
                                    ? formatThaiDate(r.updatedAt)
                                    : "-"}
                                </div>
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
          {loading && (
            <div className="mt-4 text-sm text-black/60">กำลังโหลด…</div>
          )}
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
                  .filter(
                    (p) => Math.abs(p - page) <= 2 || p === 1 || p === pages
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1)
                      acc.push("ellipsis-" + p);
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

// ใช้ Fragment โดยไม่ต้อง import React ทั้งหมด
import { Fragment } from "react";
