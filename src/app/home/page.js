"use client";

import SidebarLayout from "@/components/SidebarLayout";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
  const menus = [
    { title: "ตารางแผนก", path: "/departments", icon: Building2, desc: "ดูและค้นหาแผนกทั้งหมด" },
    { title: "ตารางรางวัล", path: "/awards", icon: Trophy, desc: "ติดตามรายการรางวัล (อ่านอย่างเดียว)" },
    { title: "ตารางนักวิจัย", path: "/researchers", icon: Users2, desc: "ข้อมูลนักวิจัยและผลงาน (ดูข้อมูล)" },
    { title: "คณะ/หน่วยงาน", path: "/faculties", icon: GraduationCap, desc: "รายการคณะและหน่วยงานที่เกี่ยวข้อง" },
    { title: "เอกสาร/ผลงาน", path: "/publications", icon: FileText, desc: "ไฟล์เอกสาร/ผลงานเพื่อการอ้างอิง" },
    { title: "กิจกรรม/สถิติ", path: "/activities", icon: CalendarDays, desc: "ไทม์ไลน์กิจกรรมหรือสถิติรวม" },
    { title: "เกี่ยวกับ/ติดต่อ", path: "/about", icon: Info, desc: "รายละเอียดระบบและข้อมูลติดต่อ" },
  ];

  const prefersReduced = useReducedMotion();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: prefersReduced ? {} : { when: "beforeChildren", staggerChildren: 0.06 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: prefersReduced ? {} : { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <SidebarLayout>
      <main className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* พื้นหลังแบบโมโนโครม */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-28 h-56 w-56 -translate-x-1/2 rounded-full bg-gray-100 blur-3xl" />
          <div className="absolute right-10 bottom-28 h-48 w-48 rounded-full bg-gray-200 blur-3xl" />
        </div>

        <motion.section variants={container} initial="hidden" animate="show" className="space-y-8">
          {/* HERO */}
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-sm"
          >
            <div className="relative grid gap-6 p-6 sm:p-8 sm:grid-cols-2 sm:items-center">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-black">
                  PSUTriupAct — ระบบสารสนเทศ PSU
                </h1>
                <p className="mt-2 text-gray-600">
                  ระบบนี้เป็น <span className="font-medium">Read-only</span> สำหรับข้อมูลแผนก รางวัล
                  นักวิจัย และส่วนงานที่เกี่ยวข้อง
                </p>
              
              </div>

              {/* จุดเด่น */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <dl className="grid grid-cols-2 gap-3 text-center">
                  {[
                    ["Access", "Read-only"],
                    ["Security", "Role-based"],
                    ["Speed", "Fast Query"],
                    ["Scope", "7 ฟอร์มข้อมูล"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-gray-50 p-3">
                      <dt className="text-[11px] uppercase tracking-wide text-gray-500">{k}</dt>
                      <dd className="mt-1 text-base font-semibold text-black">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </motion.div>

          {/* MENUS */}
          <motion.ul
            variants={container}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
                      <div className="rounded-xl bg-gray-100 p-2.5 ring-1 ring-gray-200 transition group-hover:bg-gray-200">
                        <Icon className="h-5 w-5 text-black" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-black">{title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{desc}</p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 bg-black/70 transition-all duration-300 group-hover:w-full" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* FOOTER */}
          <motion.footer variants={item} className="pt-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Prince of Songkla University
          </motion.footer>
        </motion.section>
      </main>
    </SidebarLayout>
  );
}
