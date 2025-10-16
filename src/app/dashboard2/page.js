"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarLayout from "@/components/SidebarLayout";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import KPICard from "@/components/KPICard";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6"];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [filter, setFilter] = useState("all");

  // โหลดข้อมูล summary จาก backend
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("http://localhost:8888/api/dashboard/summary");
        const json = await res.json();
        setSummary(json.data || {});
      } catch (err) {
        console.error("❌ โหลดข้อมูลล้มเหลว:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Dark mode toggle
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  if (loading)
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center h-[70vh] text-black/50 text-lg animate-pulse">
          ⏳ กำลังโหลดแดชบอร์ด...
        </div>
      </SidebarLayout>
    );

  if (!summary)
    return (
      <SidebarLayout>
        <div className="text-center text-black/60 mt-20">ไม่สามารถโหลดข้อมูลได้</div>
      </SidebarLayout>
    );

  // แปลงข้อมูล summary → array
  const entries = Object.entries(summary).map(([key, value]) => ({
    name: key,
    value,
  }));

  // จัดกลุ่มหมวดหมู่
  const lookupData = entries.slice(0, 8);
  const formData = entries.slice(8, 15);
  const peopleData = entries.slice(15);
  const allData = entries;

  // ฟิลเตอร์หมวดที่เลือก
  const chartSets = {
    lookups: lookupData,
    forms: formData,
    people: peopleData,
    all: allData,
  };
  const activeData = chartSets[filter] || allData;

  // สีธีม
  const dark = theme === "dark";

  return (
    <SidebarLayout>
      <main
        className={`min-h-screen transition-colors duration-500 ${
          dark ? "bg-[#0f172a] text-gray-100" : "bg-gray-50 text-gray-800"
        }`}
      >
        <div className="p-6 w-full max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-3xl border p-8 shadow-sm transition ${
              dark
                ? "border-white/10 bg-gradient-to-tr from-slate-800 to-slate-900"
                : "border-black/10 bg-gradient-to-tr from-indigo-50 to-white"
            }`}
          >
            <div
              className={`absolute inset-0 ${
                dark
                  ? "bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.05),transparent)]"
                  : "bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.12),transparent)]"
              }`}
            ></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ดภาพรวมระบบ</h1>
                <p className="text-sm opacity-70 mt-1">สถิติข้อมูลจากระบบ TSRI API</p>
              </div>

              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                {/* Filter Dropdown */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    dark
                      ? "bg-slate-800 border-white/20 text-gray-100"
                      : "bg-white border-black/10 text-gray-800"
                  }`}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="lookups">หมวด Lookups</option>
                  <option value="forms">หมวดแบบฟอร์ม</option>
                  <option value="people">หมวดบุคคล</option>
                </select>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium shadow-sm transition ${
                    dark
                      ? "bg-slate-800 border-white/20 text-yellow-400 hover:bg-slate-700"
                      : "bg-white border-black/10 hover:bg-gray-100"
                  }`}
                >
                  {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {[
                { title: "จังหวัดทั้งหมด", value: summary.province },
                { title: "หน่วยงาน", value: summary.departments },
                { title: "ผู้ใช้งาน", value: summary.users },
                { title: "แผนวิจัยใหม่", value: summary.formResearchPlan },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <KPICard {...item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </section>

          {/* กราฟแต่ละประเภท */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedChartCard title="กราฟวงกลม (Pie Chart)" dark={dark}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={activeData} cx="50%" cy="50%" outerRadius={120} dataKey="value">
                    {activeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </AnimatedChartCard>

            <AnimatedChartCard title="กราฟแท่ง (Bar Chart)" dark={dark}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#e5e7eb"} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-40} dy={20} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedChartCard>

            <AnimatedChartCard title="กราฟเส้น (Line Chart)" dark={dark}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#e5e7eb"} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </AnimatedChartCard>

            <AnimatedChartCard title="กราฟพื้นที่ (Area Chart)" dark={dark}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#e5e7eb"} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#c4b5fd" />
                </AreaChart>
              </ResponsiveContainer>
            </AnimatedChartCard>
          </section>
        </div>
      </main>
    </SidebarLayout>
  );
}

/* 🧩 Animated Chart Wrapper */
function AnimatedChartCard({ title, children, dark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border p-6 shadow-md hover:shadow-lg transition ${
        dark
          ? "bg-slate-800/90 border-white/10"
          : "bg-white/90 border-black/10 backdrop-blur"
      }`}
    >
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </motion.div>
  );
}