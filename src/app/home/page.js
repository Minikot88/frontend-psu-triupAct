"use client";

import SidebarLayout from "@/components/SidebarLayout";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Trophy,
  Users2,
  GraduationCap,
  FileText,
  CalendarDays,
  Info,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  // (แนะนำ) ตรวจเส้นทางให้ถูกต้องและไม่ซ้ำ
  const menus = [
    { title: "ตารางแผนก", path: "/departments", icon: Building2, desc: "ดูและค้นหาแผนกทั้งหมด" },
    { title: "ตารางรางวัล", path: "/awards", icon: Trophy, desc: "ติดตามรายการรางวัล (อ่านอย่างเดียว)" },
    { title: "ตารางนักวิจัย", path: "/researchers", icon: Users2, desc: "ข้อมูลนักวิจัยและผลงาน (ดูข้อมูล)" },
    { title: "คณะ/หน่วยงาน", path: "/faculties", icon: GraduationCap, desc: "รายการคณะและหน่วยงานที่เกี่ยวข้อง" },
    { title: "เอกสาร/ผลงาน", path: "/publications", icon: FileText, desc: "ไฟล์เอกสาร/ผลงานเพื่อการอ้างอิง" },
    { title: "กิจกรรม/สถิติ", path: "/activities", icon: CalendarDays, desc: "ไทม์ไลน์กิจกรรมหรือสถิติรวม" },
    { title: "เกี่ยวกับ/ติดต่อ", path: "/about", icon: Info, desc: "รายละเอียดระบบและข้อมูลติดต่อ" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <SidebarLayout>
      {/* overflow-x-hidden ป้องกันเลื่อนข้างบนมือถือ */}
      <main className="relative min-h-screen p-6 sm:p-10 overflow-x-hidden">
        {/* พื้นหลังมินิมอล: ครอบด้วย overflow-hidden กันล้นแนวนอน */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute right-12 bottom-24 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl" />
        </div>

        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-6xl"
        >
          {/* HERO */}
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/90 shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50" />
            <div className="relative grid gap-6 p-8 sm:grid-cols-2 sm:items-center sm:p-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                  PSUTriupAct — ระบบสารสนเทศ PSU
                </h1>
                <p className="mt-3 text-gray-600">
                  เว็บไซต์นี้เป็น <span className="font-medium">หน้าจอแสดงผล (Read-only)</span>{" "}
                  สำหรับข้อมูลแผนก รางวัล นักวิจัย และส่วนงานอื่น ๆ ในระบบเดียว
                </p>
                <div className="mt-5 flex gap-3">
                  <Link
                    href="/departments"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm transition hover:bg-blue-700"
                  >
                    เริ่มต้นใช้งาน <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition hover:border-gray-300"
                  >
                    เกี่ยวกับระบบ
                  </Link>
                </div>
              </div>

              {/* แถบจุดเด่น */}
              <div className="rounded-xl border border-gray-100 bg-white/80 p-5 shadow-sm">
                <dl className="grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <dt className="text-xs text-gray-500">Access</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">Read-only</dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <dt className="text-xs text-gray-500">Security</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">Role-based</dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <dt className="text-xs text-gray-500">Speed</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">Fast Query</dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <dt className="text-xs text-gray-500">Scope</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">7 ฟอร์มข้อมูล</dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>

          {/* MENUS */}
          <motion.ul
            variants={container}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {menus.map(({ title, path, icon: Icon, desc }) => (
              <motion.li key={path} variants={item} className="h-full">
                <Link href={path} className="group block h-full">
                  <div
                    className="
                      relative h-full min-h-32 rounded-2xl border border-gray-200 bg-white p-5
                      shadow-sm transition
                      hover:shadow-md hover:border-gray-300
                      flex flex-col justify-between
                    "
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-2.5 ring-1 ring-blue-100 transition group-hover:bg-blue-100">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 break-words">
                        <h3 className="truncate text-base font-semibold text-gray-900">
                          {title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {desc}
                        </p>
                      </div>
                    </div>

                    <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600/70 transition-all duration-300 group-hover:w-full" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* FOOTER */}
          <motion.footer variants={item} className="mt-10 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Prince of Songkla University
          </motion.footer>
        </motion.section>
      </main>
    </SidebarLayout>
  );
}
