"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // ตรวจสอบ token ใน localStorage
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 text-black px-6">
      <div className="max-w-lg w-full text-center rounded-2xl border border-black/10 bg-white p-10 shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-black text-white text-2xl font-bold shadow-sm">
          P
        </div>

        <h1 className="text-3xl font-bold mb-3">ยินดีต้อนรับ</h1>
        <h2 className="text-xl font-semibold mb-6">สู่ <span className="text-black/80">PSUTriupAct</span></h2>

        {/* แสดงข้อความตามสถานะ login */}
        {loggedIn ? (
          <p className="text-gray-600 mb-8 leading-relaxed">
            คุณได้เข้าสู่ระบบสำเร็จแล้ว <br />
            ใช้เมนูด้านซ้ายเพื่อเริ่มต้นการทำงาน
          </p>
        ) : (
          <p className="text-gray-600 mb-8 leading-relaxed">
            คุณยังไม่ได้เข้าสู่ระบบ <br />
            กรุณาเข้าสู่ระบบก่อนใช้งาน
          </p>
        )}

        <a
          href="/login"
          className="inline-block rounded-lg bg-black px-6 py-3 text-sm font-medium text-white shadow hover:bg-gray-800 transition"
        >
          {loggedIn ? "เปลี่ยนบัญชี / ออกจากระบบ" : "Sign In"}
        </a>
      </div>

      <footer className="mt-10 text-xs text-gray-500">
        © {new Date().getFullYear()} Prince of Songkla University
      </footer>
    </main>
  );
}
