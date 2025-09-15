"use client";

import SidebarLayout from "@/components/SidebarLayout";
import LinesTable from "@/components/LinesTable";
import { motion, useReducedMotion } from "framer-motion";

const columns = [
  { key: "no", label: "#" },
  { key: "code", label: "รหัส" },
  { key: "name", label: "ชื่อ" },
  { key: "dept", label: "หน่วยงาน" },
];

const rows = [
  { id: 1, no: 1, code: "D-001", name: "งานวิจัย", dept: "คณะวิทยาศาสตร์" },
  { id: 2, no: 2, code: "D-002", name: "วิชาการ", dept: "คณะวิศวกรรมศาสตร์" },
  { id: 3, no: 3, code: "D-003", name: "จัดการ", dept: "คณะการจัดการ" },
];

export default function PageTable() {
  const prefersReduced = useReducedMotion();

  const item = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: prefersReduced ? {} : { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <SidebarLayout>
      <main className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* พื้นหลังโมโนโครมมินิมอล */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-28 h-56 w-56 -translate-x-1/2 rounded-full bg-gray-100 blur-3xl" />
          <div className="absolute right-10 bottom-28 h-48 w-48 rounded-full bg-gray-200 blur-3xl" />
        </div>

        <motion.section  initial="hidden" animate="show" className="space-y-8">
          {/* HERO สั้น ๆ */}
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-sm"
          >
            <div className="relative grid gap-6 p-6 sm:p-8 sm:grid-cols-2 sm:items-center">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-black">
                  ตัวอย่างตาราง (เส้นแนวตั้ง)
                </h1>
                <p className="mt-2 text-gray-600">
                  ธีมขาว-ดำ มินิมอล ดูทางการ และรองรับข้อมูลยาว—หัวตาราง sticky, เลื่อนแนวนอนได้
                </p>
              </div>
            </div>
          </motion.div>

          {/* ตาราง */}
          <motion.div variants={item} className="space-y-3">
            <LinesTable columns={columns} rows={rows} stickyHeader />
          </motion.div>

          
          <motion.footer variants={item} className="pt-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Prince of Songkla University
          </motion.footer>
        </motion.section>
      </main>
    </SidebarLayout>
  );
}
