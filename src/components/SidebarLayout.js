"use client";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu as BurgerIcon, House, LayoutGrid, ClipboardList } from "lucide-react";
import Swal from "sweetalert2";

/* ---------- utils: hook ตรวจ media query (desktop) ---------- */
function useMedia(query) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const set = () => setMatch(mq.matches);
    set(); // set ครั้งแรก
    mq.addEventListener?.("change", set) ?? mq.addListener?.(set);
    return () =>
      mq.removeEventListener?.("change", set) ?? mq.removeListener?.(set);
  }, [query]);
  return match;
}

/* ---------- utils: get/set localStorage แบบปลอดภัย ---------- */
const safeGet = (k, d = null) => {
  try { return localStorage.getItem(k) ?? d; } catch { return d; }
};
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

/* ---------- main layout ---------- */
export default function SidebarLayout({ children }) {
  const [open, setOpen] = useState(false);       // สถานะ sidebar
  const pathname = usePathname();                // path ปัจจุบัน (ไว้เช็ค active)
  const desktop = useMedia("(min-width:1024px)");// true เมื่อเป็นจอ desktop
  const router = useRouter();

  /* กำหนดธีมขาว-ดำ (ผ่าน CSS variables) ครั้งเดียว */
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--bg", "255 255 255");
    r.style.setProperty("--fg", "0 0 0");
    r.style.setProperty("--accent", "0 0 0");
  }, []);

  /* โหลดสถานะ sidebar จาก localStorage และ persist เมื่อเปลี่ยนค่า */
  useEffect(() => {
    setOpen(safeGet("sidebar:open") === "true");
  }, []);
  useEffect(() => {
    safeSet("sidebar:open", String(open));
  }, [open]);

  /* ล็อคสกรอลบนมือถือเมื่อ sidebar เปิด */
  useEffect(() => {
    document.body.style.overflow = !desktop && open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, desktop]);

  /* คีย์ลัด: Esc ปิด / Ctrl(or Cmd) + B toggle */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault(); setOpen(v => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeOnMobile = () => { if (!desktop) setOpen(false); };

  /* เมนูด้านข้าง */
  const links = useMemo(() => ([
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/",         label: "Home",     icon: House },
    { href: "/01",       label: "ฟอร์ม 01", icon: ClipboardList },
    { href: "/02",       label: "ฟอร์ม 02", icon: ClipboardList },
    { href: "/03",       label: "ฟอร์ม 03", icon: ClipboardList },
    { href: "/04",       label: "ฟอร์ม 04", icon: ClipboardList },
    { href: "/05",       label: "ฟอร์ม 05", icon: ClipboardList },
    { href: "/06",       label: "ฟอร์ม 06", icon: ClipboardList },
    { href: "/07",       label: "ฟอร์ม 07", icon: ClipboardList },
  ]), []);

  /* ออกจากระบบ (SweetAlert2 + เคลียร์ token + redirect) */
  async function handleSignOut() {
    const ok = await Swal.fire({
      title: "ออกจากระบบ?",
      html: `<p style="margin-top:4px; font-size:.9rem; color:rgba(0,0,0,.7)">คุณต้องการออกจากระบบตอนนี้หรือไม่</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      buttonsStyling: false,
      background: "#fff",
      color: "#000",
      customClass: {
        popup: "rounded-2xl shadow-2xl ring-1 ring-black/10",
        confirmButton: "rounded-lg bg-black text-white px-4 py-2 text-sm hover:bg-gray-800",
        cancelButton: "ml-2 rounded-lg border border-black/15 bg-white px-4 py-2 text-sm hover:bg-black/[.03]",
      },
    }).then(r => r.isConfirmed);

    if (!ok) return;
    try { localStorage.removeItem("token"); } catch {}
    closeOnMobile();

    await Swal.fire({
      toast: true, position: "top-end", icon: "success",
      title: "ออกจากระบบแล้ว", timer: 1100, showConfirmButton: false,
      background: "#fff", color: "#000",
      customClass: { popup: "rounded-xl shadow ring-1 ring-black/10" },
    });

    router.replace("/login");
  }

  return (
    <div className="flex min-h-dvh bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          bg-white text-black ring-1 ring-black/10 shadow-xl`}
        aria-hidden={!open && !desktop}
      >
        {/* Header (โลโก้เล็ก + ชื่อระบบ) */}
        <div className="flex items-center gap-3 p-4 border-b border-black/10">
          <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold shadow">P</div>
          <div>
            <div className="truncate text-sm font-semibold">My App</div>
            <div className="truncate text-xs text-black/60">PSU Portal</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="p-4 space-y-1">
          <div className="mb-2 text-xs uppercase tracking-wide text-black/50">Menu</div>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
            return (
              <a
                key={href}
                href={href}
                onClick={closeOnMobile}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${active
                    ? "bg-black/5 text-black ring-1 ring-black/10"
                    : "text-black/70 hover:text-black hover:bg-black/5"}`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>

        {/* ผู้ใช้ + ปุ่มออกจากระบบ */}
        <div className="absolute inset-x-0 bottom-0 p-4 border-t border-black/10 bg-black/[.03]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-black/10 ring-1 ring-black/10" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Erica</div>
              <div className="truncate text-xs text-black/60">erica@example.com</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-black/15 hover:bg-black/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay เมื่อ sidebar เปิดบนมือถือ */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Content */}
      <div className={`flex-1 transition-[margin] duration-200 ${open ? "lg:ml-72" : "lg:ml-0"}`}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur">
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-white p-2 hover:bg-black/5"
            aria-label="Toggle sidebar" aria-expanded={open}
          >
            <BurgerIcon className="h-5 w-5" />
          </button>
          <span className="font-semibold">PSU</span>
          <div className="w-8" />
        </header>

        <main className="mx-auto w-full max-w-7xl p-6">{children}</main>
      </div>
    </div>
  );
}
