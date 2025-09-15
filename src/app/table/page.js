"use client";

import SidebarLayout from "@/components/SidebarLayout";
import LinesTable from "@/components/LinesTable";
import { motion, useReducedMotion } from "framer-motion";

const columns = [
  { key: "id", label: "ID" },
  { key: "code", label: "รหัส" },
  { key: "name", label: "ชื่อ" },
  { key: "dept", label: "หน่วยงาน" },
  { key: "actions", label: " " },
];

const rows = [
  { id: 1, code: "D-001", name: "งานวิจัย", dept: "คณะวิทยาศาสตร์" },
  { id: 2, code: "D-002", name: "วิชาการ", dept: "คณะวิศวกรรมศาสตร์" },
  { id: 3, code: "D-003", name: "จัดการ", dept: "คณะการจัดการ" },
  { id: 4, code: "D-003", name: "จัดการ", dept: "คณะการจัดการ" },
  { id: 5, code: "D-003", name: "จัดการ", dept: "คณะการจัดการ" },
  { id: 6, code: "D-003", name: "จัดการ", dept: "คณะการจัดการ" },
];

export default function PageTable() {
  const prefersReduced = useReducedMotion();
  const item = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReduced ? {} : { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <SidebarLayout>
      <main className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.section initial="hidden" animate="show" className="space-y-8">
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-sm"
          >
            <div className="relative grid gap-6 p-6 sm:p-8 sm:grid-cols-2 sm:items-center">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-black">
                  text
                </h1>
                <p className="mt-2 text-gray-600">text</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <LinesTable
              columns={columns}
              rows={rows}
              stickyHeader
              getRowHref={(row) => `/items/${row.id}`}
              showActions
            />
          </motion.div>
        </motion.section>
      </main>
    </SidebarLayout>
  );
}
