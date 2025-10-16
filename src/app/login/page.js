"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");
    if (!email?.trim() || !password?.trim()) {
      setMsg("กรอกอีเมล/รหัสผ่านก่อน");
      return; 
    }
    setLoading(true);
    try {
      const res = await apiPost("/api88/auth/login", { email, password });
      const token = res?.session?.id;
      const expISO = res?.session?.expiresAt;

      if (res?.success && token && expISO) {
        const expMs = new Date(expISO).getTime();
        localStorage.setItem("token", token);
        localStorage.setItem("token_exp", String(expMs));

        const timeoutMs = expMs - Date.now();
        if (timeoutMs > 0) {
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("token_exp");
            router.replace("/login?expired=1");
          }, timeoutMs);
        }

        setMsg("Login success! กำลังพาไป Dashboard…");
        router.replace("/dashboard");
      } else {
        setMsg(res?.error || "username หรือ password ไม่ถูกต้อง");
      }
    } catch (err) {
      setMsg(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="neon-bg flex min-h-screen items-center justify-center p-5">
      <div className="login-card w-full max-w-sm p-8">
        <h2 className="login-title text-center">เข้าสู่ระบบ</h2>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* โลโก้ PSU ใต้ปุ่ม */}
        <div className="mt-6 flex justify-center">
          <img
            src="https://www.psu.ac.th/img/psubrand/psu1.png"
            alt="PSU Logo"
            className="psu-logo"
          />
        </div>

        {msg && <div className="login-msg mt-4">{msg}</div>}
      </div>

      <style jsx global>{`
        :root {
          --navy-dark: #001e3c;
          --navy-mid: #003c71;
          --navy-light: #007bff;
          --white-soft: rgba(255, 255, 255, 0.9);
          --white-card: rgba(255, 255, 255, 0.75);
          --text-dark: #0b1220;
          --text-light: #f8fafc;
          --glow-blue: rgba(0, 123, 255, 0.35);
          --radius: 22px;
        }

        body {
          font-family: "Inter", system-ui, sans-serif;
          color: var(--text-dark);
          background: var(--navy-dark);
        }

        .neon-bg {
          background: radial-gradient(
              800px 600px at 50% 0%,
              rgba(255, 255, 255, 0.1),
              transparent 60%
            ),
            linear-gradient(135deg, var(--navy-dark), var(--navy-mid), #002d57);
          background-size: 200% 200%;
          animation: bgFlow 14s ease infinite;
          position: relative;
          overflow: hidden;
        }

        @keyframes bgFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .login-card {
          background: var(--white-card);
          backdrop-filter: blur(20px) saturate(1.2);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25), 0 0 20px var(--glow-blue);
          animation: fadeSlide 0.8s ease forwards;
        }

        @keyframes fadeSlide {
          0% {
            opacity: 0;
            transform: translateY(25px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-title {
          font-size: 1.9rem;
          font-weight: 800;
          color: var(--navy-mid);
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.6),
            0 0 20px rgba(0, 123, 255, 0.3);
        }

        .login-input {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.85);
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 0.95rem;
          color: var(--text-dark);
          outline: none;
          transition: all 0.25s ease;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        .login-input::placeholder {
          color: #6b7280;
        }

        .login-input:hover {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 10px rgba(0, 123, 255, 0.12);
        }

        .login-input:focus {
          border-color: var(--navy-light);
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15),
            0 0 15px rgba(0, 123, 255, 0.25);
          background: rgba(255, 255, 255, 1);
        }

        .login-btn {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 12px 14px;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.02em;
          color: var(--text-light);
          background: linear-gradient(180deg, #007bff, #0055b0);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.35);
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          background: linear-gradient(180deg, #0a8aff, #004f9e);
          box-shadow: 0 10px 28px rgba(0, 123, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .login-btn[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .psu-logo {
          width: 80px;
          height: auto;
          opacity: 0.9;
          filter: drop-shadow(0 0 8px rgba(0, 123, 255, 0.4));
          animation: fadeLogo 1.2s ease-out forwards;
        }

        @keyframes fadeLogo {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-msg {
          text-align: center;
          font-size: 0.9rem;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.8);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
          color: var(--navy-mid);
          animation: fadeIn 0.5s ease forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
