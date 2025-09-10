"use client";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu as BurgerIcon, House, Bookmark, LayoutGrid } from "lucide-react";
import Swal from "sweetalert2"; // <= เพิ่มบรรทัดนี้

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => setDesktop(e.matches);
    setDesktop(mq.matches);
    mq.addEventListener?.("change", onChange) ?? mq.addListener?.(onChange);
    return () => {
      mq.removeEventListener?.("change", onChange) ??
        mq.removeListener?.(onChange);
    };
  }, []);
  return desktop;
}

export default function SidebarLayout({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const desktop = useIsDesktop();
  const router = useRouter();

  const setVarsWhite = () => {
    const root = document.documentElement;
    root.style.setProperty("--bg", "255 255 255");
    root.style.setProperty("--fg", "0 0 0");
    root.style.setProperty("--accent", "0 0 0");
  };

  useEffect(() => {
    try {
      setOpen(localStorage.getItem("sidebar:open") === "true");
    } catch {}
    setVarsWhite();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sidebar:open", String(open));
    } catch {}
    document.body.style.overflow = !desktop && open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, desktop]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeOnMobile = () => {
    if (!desktop) setOpen(false);
  };

  const handleSignOut = async () => {
    const result = await Swal.fire({
      // โทน/แบ็คกราวด์
      background: "#fff",
      color: "#000",
      backdrop: `
      rgba(0,0,0,.4)
      left top
      no-repeat
    `,

      showClass: {
        popup: "animate__animated animate__fadeInDown animate__faster",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp animate__faster",
      },

      title: "ออกจากระบบ?",
      html: `
      <div style="text-align:center">
        <p style="margin-top:4px; font-size: 0.9rem; color: rgba(0,0,0,.7)">
          คุณต้องการออกจากระบบตอนนี้หรือไม่
        </p>
      </div>
    `,
      icon: "question",

      showCancelButton: true,
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,

      customClass: {
        popup: "rounded-2xl shadow-2xl ring-1 ring-black/10",
        title: "text-black text-lg font-semibold",
        htmlContainer: "text-black/70 text-sm",
        actions: "mt-4 flex gap-2 justify-end",
        confirmButton:
          "rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/20",
        cancelButton:
          "rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium hover:bg-black/[.03] focus:outline-none focus:ring-2 focus:ring-black/10",
      },
    });

    if (!result.isConfirmed) return;

    try {
      localStorage.removeItem("token");
    } catch {}
    closeOnMobile?.();

    await Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "ออกจากระบบแล้ว",
      showConfirmButton: false,
      timer: 1200,
      timerProgressBar: true,
      background: "#fff",
      color: "#000",
      customClass: {
        popup: "rounded-xl shadow-lg ring-1 ring-black/10",
        title: "text-sm font-medium",
      },
    });

    router.replace("/login");
  };

  const links = useMemo(
    () => [
      { href: "/overview", label: "Overview", icon: LayoutGrid },
      { href: "/", label: "Home", icon: House },
      { href: "/1", label: "Page 1", icon: Bookmark },
      { href: "/2", label: "Page 2", icon: Bookmark },
      { href: "/3", label: "Page 3", icon: Bookmark },
    ],
    []
  );

  return (
    <div className="flex min-h-dvh bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}
        bg-white text-black ring-1 ring-black/10 shadow-xl`}
        aria-hidden={!open && !desktop}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-black/10">
          <div className="h-9 w-9 rounded-xl bg-black/90 text-white flex items-center justify-center text-sm font-bold shadow">
            P
          </div>
          <div>
            <div className="truncate text-sm font-semibold">My App</div>
            <div className="truncate text-xs text-black/60">PSU Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1">
          <div className="mb-2 text-xs uppercase tracking-wide text-black/50">
            Menu
          </div>
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/" && pathname?.startsWith(href));
            return (
              <a
                key={href}
                href={href}
                onClick={closeOnMobile}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                  transition-colors duration-150
                  ${
                    active
                      ? "bg-black/5 text-black ring-1 ring-black/10"
                      : "text-black/70 hover:text-black hover:bg-black/5"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>

        {/* User row */}
        <div className="absolute inset-x-0 bottom-0 p-4 border-t border-black/10 bg-black/[.03]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-black/10 ring-1 ring-black/10" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Erica</div>
              <div className="truncate text-xs text-black/60">
                erica@example.com
              </div>
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

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Content */}
      <div
        className={`flex-1 transition-[margin] duration-200 ${
          open ? "lg:ml-72" : "lg:ml-0"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur">
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-white p-2 hover:bg-black/5"
            aria-label="Toggle sidebar"
            aria-expanded={open}
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
