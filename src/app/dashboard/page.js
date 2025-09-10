"use client";

import React from "react";
import SidebarLayout from "@/components/SidebarLayout";
import RequireAuth from "@/components/RequireAuth";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardPage() {
  return (
    <SidebarLayout>
      
      <RequireAuth/>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">ภาพรวมระบบ</h1>
          <p className="mt-1 text-sm text-black/60">
            สรุปสั้นๆ ของการใช้งานและสถานะระบบ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LogoutButton />
        </div>
      </header>

      {/* KPI */}
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="ผู้ใช้ใหม่" value="1,284" diff="▲ 8.2%" />
        <KPICard title="การเข้าชม" value="23,901" diff="▲ 3.4%" />
        <KPICard title="อัตราแปลงผล" value="4.7%" diff="▼ 0.6%" down />
        <KPICard title="รายได้ (฿)" value="176,420" diff="▲ 12.1%" />
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Traffic + Signups */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="ทราฟฟิก 7 วันล่าสุด"
            subtitle="sessions ต่อวัน (ตัวอย่างข้อมูล)"
          />
          <div className="mt-4">
            <TrendLine data={[120, 180, 160, 210, 240, 220, 260]} />
          </div>
          <div className="mt-6">
            <CardHeader
              title="การสมัครรายวัน"
              subtitle="sign-ups (ตัวอย่างข้อมูล)"
            />
            <div className="mt-4">
              <BarChart
                data={[12, 19, 15, 22, 27, 21, 30]}
                labels={["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"]}
              />
            </div>
          </div>
        </Card>

        {/* Right column: Top pages + Status */}
        <div className="grid gap-6">
          <Card>
            <CardHeader title="หน้า/เส้นทางยอดนิยม" subtitle="Top 5" />
            <ul className="mt-3 divide-y divide-black/10">
              {[
                { path: "/", views: 6540 },
                { path: "/login", views: 4129 },
                { path: "/settings", views: 2920 },
                { path: "/awards", views: 1877 },
                { path: "/profile", views: 1204 },
              ].map((row) => (
                <li
                  key={row.path}
                  className="flex items-center justify-between py-2"
                >
                  <span className="truncate text-sm text-black/75">
                    {row.path}
                  </span>
                  <span className="rounded-lg bg-black/[.035] px-2 py-0.5 text-sm font-medium text-black ring-1 ring-black/10">
                    {row.views.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="สถานะระบบ" subtitle="ภาพรวมโมดูลหลัก" />
            <ul className="mt-3 grid gap-2">
              <StatusRow label="API Gateway" ok />
              <StatusRow label="Database" ok />
              <StatusRow
                label="Queue Worker"
                ok={false}
                note="คิวหน่วงเล็กน้อย"
              />
            </ul>
            <div className="mt-3 text-xs text-black/60">
              * ข้อมูลตัวอย่างสำหรับ UI — เชื่อมจริงสามารถดึงจาก endpoint
              สถานะได้
            </div>
          </Card>
        </div>

        {/* Quick tasks + feed */}
        <Card className="lg:col-span-2">
          <CardHeader title="งานด่วน" subtitle="Quick actions" />
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { href: "/products", label: "จัดการสินค้า" },
              { href: "/table", label: "เปิดตารางข้อมูล" },
              { href: "/settings", label: "ตั้งค่า" },
              { href: "/reports", label: "รายงาน" },
            ].map((b) => (
              <a
                key={b.href}
                href={b.href}
                className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm hover:bg-black/[.03]"
              >
                {b.label}
              </a>
            ))}
          </div>
          <div className="mt-6">
            <CardHeader title="กิจกรรมล่าสุด" subtitle="ตัวอย่าง feed" />
            <ul className="mt-3 divide-y divide-black/10">
              {[
                { text: "เพิ่มผู้ใช้ใหม่ 3 รายการ", meta: "5 นาทีที่แล้ว" },
                {
                  text: "อัปเดตข้อมูลหมวดหมู่สินค้า",
                  meta: "1 ชั่วโมงที่แล้ว",
                },
                { text: "สร้างรายงานยอดขายรายวัน", meta: "เมื่อวาน" },
              ].map((it, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span className="text-sm text-black">{it.text}</span>
                  <span className="text-xs text-black/50">{it.meta}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader title="เช็กลิสต์" subtitle="ตัวอย่างรายการงาน" />
          <TaskList
            items={[
              { id: 1, text: "ทดสอบการแสดงผลบนมือถือ", done: true },
              { id: 2, text: "เชื่อมต่อ API รายงาน", done: false },
              { id: 3, text: "อัปเดตหน้า Overview", done: false },
            ]}
          />
        </Card>
      </section>
    </SidebarLayout>
  );
}

/* ------------------ Atoms ------------------ */
function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl border border-black/10 bg-white p-4 shadow-sm " + className
      }
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-black/60">{subtitle}</p>}
      </div>
      <span className="mt-0.5 inline-block h-1.5 w-16 rounded-full bg-black/20"></span>
    </div>
  );
}

function KPICard({ title, value, diff, down }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-black/60">{title}</p>
          <p className="mt-1 text-xl font-semibold text-black">{value}</p>
        </div>
        <span
          className={
            "rounded-md px-2 py-1 text-xs font-medium ring-1 " +
            (down
              ? "bg-black/[.04] text-black/80 ring-black/15"
              : "bg-black/[.06] text-black ring-black/15")
          }
          title={down ? "ลดลง" : "เพิ่มขึ้น"}
        >
          {diff}
        </span>
      </div>
    </Card>
  );
}

/* ------------------ Charts (SVG, no deps) ------------------ */
function TrendLine({ data = [] }) {
  const max = Math.max(...data, 1);
  const step = 100 / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${36 - (v / max) * 30 - 3}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 36" className="h-32 w-full">
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          x2="100"
          y1={8 + i * 7}
          y2={8 + i * 7}
          stroke="currentColor"
          className="text-black/15"
          strokeWidth="0.4"
        />
      ))}
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor={`rgb(var(--accent))`}
            stopOpacity="0.55"
          />
          <stop
            offset="100%"
            stopColor={`rgb(var(--accent))`}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={`rgb(var(--accent))`}
        strokeWidth="1.8"
      />
      <polygon points={`${points} 100,36 0,36`} fill="url(#g)" opacity="0.22" />
    </svg>
  );
}

function BarChart({ data = [], labels = [] }) {
  const max = Math.max(...data, 1);
  const gap = 6;
  const bw = (100 - gap * (data.length + 1)) / data.length;
  return (
    <div className="h-36 w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            x2="100"
            y1={10 + i * 18}
            y2={10 + i * 18}
            stroke="currentColor"
            className="text-black/15"
            strokeWidth="0.6"
          />
        ))}
        {data.map((v, i) => {
          const h = (v / max) * 78;
          const x = gap + i * (bw + gap);
          const y = 88 - h;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={bw}
                height={h}
                rx="3"
                fill={`rgb(var(--accent))`}
                opacity="0.9"
              />
              <text
                x={x + bw / 2}
                y={95}
                textAnchor="middle"
                className="fill-black/60"
                fontSize="4"
              >
                {labels[i] || i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------ Status ------------------ */
function StatusRow({ label, ok = true, note = "" }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={
            "inline-block size-2 rounded-full " +
            (ok ? "bg-black" : "bg-black/30")
          }
        />
        <span className="text-sm text-black">{label}</span>
      </div>
      <span className={"text-xs " + (ok ? "text-black/60" : "text-black/80")}>
        {ok ? "ปกติ" : note || "มีปัญหา"}
      </span>
    </li>
  );
}

/* ------------------ Tasks ------------------ */
function TaskList({ items }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((it) => (
        <li
          key={it.id}
          className="flex items-center gap-3 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/[.02]"
        >
          <input
            type="checkbox"
            defaultChecked={it.done}
            className="size-4 accent-[rgb(var(--accent))]"
          />
          <span
            className={it.done ? "line-through text-black/50" : "text-black"}
          >
            {it.text}
          </span>
          <span className="ml-auto text-xs text-black/45">
            {it.done ? "เสร็จแล้ว" : "ค้างอยู่"}
          </span>
        </li>
      ))}
    </ul>
  );
}
