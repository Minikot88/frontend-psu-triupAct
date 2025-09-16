"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import KPICard from "@/components/KPICard";

import DepartmentsTable from "@/components/api/DepartmentsTable";
import AddressTable from "@/components/api/AddressTable";
import CofundersTable from "@/components/api/CofundersTable";
import EducationlevelsTable from "@/components/api/Educationlevels";
import FindingdetaillistsTable from "@/components/api/FindingdetaillistsTable";
import FormAllocateTable from "@/components/api/FormAllocateTable";
import FormExtendTable from "@/components/api/FormExtendTable";
import FormNewFindingsTable from "@/components/api/FormNewFindingsTable";
import FormResearchOwnerTable from "@/components/api/FormResearchOwnerTable";
import FormResearchPlanTable from "@/components/api/FormResearchPlanTable";
import FundersTable from "@/components/api/FundersTable";
import GroupstudiesTable from "@/components/api/GroupstudiesTable";
import MainstudiesTable from "@/components/api/MainstudiesTable";
import PrefixsTable from "@/components/api/PrefixsTable";
import ResearcherTable from "@/components/api/ResearcherTable";
import RolesTable from "@/components/api/RolesTable";
import SubstudiesTable from "@/components/api/SubstudiesTable";
import TargetAudiencesTable from "@/components/api/TargetAudiencesTable";
import TimeSettingsTable from "@/components/api/TimeSettingsTable";
import UsersTable from "@/components/api/UsersTable";

const STORAGE_KEY = "dashboard.visible.sections.v1";

const SECTIONS = [
  { key: "departments", label: "Departments", Component: DepartmentsTable, group: "Lookups" },
  { key: "address", label: "Address", Component: AddressTable, group: "Lookups" },
  { key: "cofunders", label: "Cofunders", Component: CofundersTable, group: "Lookups" },
  { key: "educationlevels", label: "Education Levels", Component: EducationlevelsTable, group: "Lookups" },
  { key: "findingdetaillists", label: "Finding Detail Lists", Component: FindingdetaillistsTable, group: "Lookups" },
  { key: "formallocate", label: "Form Allocate", Component: FormAllocateTable, group: "Forms" },
  { key: "formextend", label: "Form Extend", Component: FormExtendTable, group: "Forms" },
  { key: "formnewfindings", label: "Form New Findings", Component: FormNewFindingsTable, group: "Forms" },
  { key: "formresearchowner", label: "Form Research Owner", Component: FormResearchOwnerTable, group: "Forms" },
  { key: "formresearchplan", label: "Form Research Plan", Component: FormResearchPlanTable, group: "Forms" },
  { key: "funders", label: "Funders", Component: FundersTable, group: "Lookups" },
  { key: "groupstudies", label: "Group Studies", Component: GroupstudiesTable, group: "Lookups" },
  { key: "mainstudies", label: "Main Studies", Component: MainstudiesTable, group: "Lookups" },
  { key: "prefixs", label: "Prefixs", Component: PrefixsTable, group: "Lookups" },
  { key: "researcher", label: "Researcher", Component: ResearcherTable, group: "People" },
  { key: "roles", label: "Roles", Component: RolesTable, group: "Lookups" },
  { key: "substudies", label: "Substudies", Component: SubstudiesTable, group: "Lookups" },
  { key: "targetaudiences", label: "Target Audiences", Component: TargetAudiencesTable, group: "Lookups" },
  { key: "timesettings", label: "Time Settings", Component: TimeSettingsTable, group: "Lookups" },
  { key: "users", label: "Users", Component: UsersTable, group: "People" },
];

const defaultVisible = SECTIONS.reduce((acc, s) => ((acc[s.key] = true), acc), {});

export default function DashboardPage() {
  const [visible, setVisible] = useState(defaultVisible);
  const [filter, setFilter] = useState("");
  const [pinToolbar, setPinToolbar] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setVisible({ ...defaultVisible, ...saved });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
    } catch {}
  }, [visible]);

  const allKeys = useMemo(() => SECTIONS.map((s) => s.key), []);
  const totalCount = SECTIONS.length;
  const selectedCount = Object.values(visible).filter(Boolean).length;

  const allChecked = selectedCount === totalCount;
  const noneChecked = selectedCount === 0;
  const someChecked = !allChecked && !noneChecked;

  const setAll = (val) => {
    const next = {};
    allKeys.forEach((k) => (next[k] = val));
    setVisible(next);
  };

  const filteredSections = useMemo(() => {
    const t = filter.trim().toLowerCase();
    if (!t) return SECTIONS;
    return SECTIONS.filter(
      (s) => s.key.toLowerCase().includes(t) || s.label.toLowerCase().includes(t) || s.group.toLowerCase().includes(t)
    );
  }, [filter]);

  const selectedGroups = useMemo(() => {
    const on = SECTIONS.filter((s) => visible[s.key]);
    const groups = Array.from(new Set(on.map((s) => s.group)));
    return groups;
  }, [visible]);

  return (
    <SidebarLayout>
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
        <header className="mb-6">
          <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-tr from-white to-white backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(1200px_300px_at_-20%_-20%,#a78bfa15,transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(1000px_300px_at_120%_120%,#60a5fa10,transparent)]" />
            <div className="relative p-5 sm:p-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ภาพรวมระบบ</h1>
                  <p className="mt-1 text-sm text-black/60">สรุปสั้นๆ ของการใช้งานและสถานะระบบ</p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-2">
                  <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-black/70 shadow-sm">
                    แสดง {selectedCount}/{totalCount}
                  </span>
                  <button
                    onClick={() => setPinToolbar((v) => !v)}
                    className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs hover:bg-white shadow-sm transition"
                    title={pinToolbar ? "เลิกปักหมุดตัวกรอง" : "ปักหมุดตัวกรองไว้ด้านบน"}
                  >
                    {pinToolbar ? "ยกเลิกปักหมุด" : "ปักหมุดตัวกรอง"}
                  </button>
                </div>
              </div>

              {selectedGroups.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedGroups.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs text-black/70 shadow-sm"
                    >
                      <span className="h-2 w-2 rounded-full bg-black/40" />
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="ผู้ใช้ใหม่" value="1,284" diff="▲ 8.2%" />
          <KPICard title="การเข้าชม" value="23,901" diff="▲ 3.4%" />
          <KPICard title="อัตราแปลงผล" value="4.7%" diff="▼ 0.6%" down />
          <KPICard title="รายได้ (฿)" value="176,420" diff="▲ 12.1%" />
        </section>

        <div
          className={[
            "z-10",
            pinToolbar ? "sticky top-4" : "",
          ].join(" ")}
        >
          <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow-sm transition">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer select-none items-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked;
                    }}
                    onChange={(e) => setAll(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-black/20 bg-white transition hover:border-black/40 checked:bg-black checked:text-white"
                    aria-label="แสดงทั้งหมด"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 transition peer-checked:opacity-100">
                    ✓
                  </span>
                </label>
                <div className="text-sm">
                  <div className="font-medium">แสดงทั้งหมด</div>
                  <div className="text-xs text-black/50">เลือกแล้ว {selectedCount}/{totalCount}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAll(true)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs shadow-sm transition hover:bg-black/[.04] active:scale-[.99]"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  onClick={() => setAll(false)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs shadow-sm transition hover:bg-black/[.04] active:scale-[.99]"
                >
                  ยกเลิกทั้งหมด
                </button>
              </div>
            </div>

            <div className="border-t border-black/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="ค้นหารายการ / กลุ่ม (Lookups, Forms, People)…"
                      className="w-80 rounded-xl border border-black/15 bg-white px-3 py-2 pl-9 text-sm outline-none transition focus:border-black/30"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40">🔎</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-black/50">
                    <span className="rounded-md border border-black/10 bg-black/[.03] px-2 py-1">Lookups</span>
                    <span className="rounded-md border border-black/10 bg-black/[.03] px-2 py-1">Forms</span>
                    <span className="rounded-md border border-black/10 bg-black/[.03] px-2 py-1">People</span>
                  </div>
                </div>

                <div className="text-xs text-black/50">
                  เคล็ดลับ: พิมพ์ <span className="rounded bg-black/[.06] px-1 py-0.5">forms</span> เพื่อกรองเฉพาะแบบฟอร์ม
                </div>
              </div>

              <div className="mt-3 grid max-h-64 grid-cols-1 gap-2 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSections.map(({ key, label, group }) => (
                  <label
                    key={key}
                    className="group flex items-center gap-3 rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm shadow-sm transition hover:-translate-y-[1px] hover:bg-white"
                    title={group}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-black"
                      checked={!!visible[key]}
                      onChange={(e) => setVisible((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                    <span className="flex-1">{label}</span>
                    <span className="rounded-full border border-black/10 bg-black/[.04] px-2 py-0.5 text-[10px] text-black/60">
                      {group}
                    </span>
                  </label>
                ))}
                {filteredSections.length === 0 && (
                  <div className="rounded-lg border border-black/10 bg-black/[.02] px-3 py-2 text-xs text-black/50">
                    ไม่พบรายการที่ตรงกับคำค้น
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1">
          {SECTIONS.map(({ key, Component }) =>
            visible[key] ? (
              <div
                key={key}
                className="mb-6 md:mb-4 w-full transition-transform duration-200 will-change-transform hover:translate-y-[-2px]"
              >
                <Component />
              </div>
            ) : null
          )}
        </section>
      </main>
    </SidebarLayout>
  );
}