'use client';
import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function DepartmentsPage() {
  // ข้อมูลจาก API
  const [items, setItems] = useState([]);
  // สถานะโหลด + error
  const [state, setState] = useState({ loading: true, err: '' });
  // คำค้นหา
  const [query, setQuery] = useState('');
  // เพจปัจจุบัน (เริ่มที่ 1), จำนวนต่อหน้า = 10
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // โหลดข้อมูลตอน mount
  useEffect(() => {
    apiGet('/api/departments')
      .then((d) => setItems(Array.isArray(d) ? d : d?.data || []))
      .catch((e) => setState({ loading: false, err: e.message }))
      .finally(() => setState((s) => ({ ...s, loading: false })));
  }, []);

  // ฟิลเตอร์ตาม query
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((d) =>
      [d.id, d.name, d.departmentName]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(q))
    );
  }, [items, query]);

  // คำนวณหน้าสุดท้าย และ slice ข้อมูลเฉพาะหน้าปัจจุบัน
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages); // ป้องกันหน้าเกิน
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  // เมื่อพิมพ์ค้นหา ให้รีเซ็ตกลับไปหน้า 1
  useEffect(() => {
    setPage(1);
  }, [query]);

  // เปลี่ยนหน้าแบบปลอดภัย
  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-black">
      <h1 className="mb-6 text-2xl font-bold">Departments</h1>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหา department..."
        className="mb-4 w-full max-w-md rounded-lg border border-black/20 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none"
      />

      {/* Error */}
      {state.err && (
        <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.err}
        </div>
      )}

      {/* Loading */}
      {state.loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-4 text-gray-500">ไม่พบข้อมูล</p>
      ) : (
        <>
          {/* กล่องรายการแบบ JSON row (แสดงเฉพาะ 10 รายการ/หน้า) */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm">
            {pageItems.map((d, i) => (
              <div
                key={d.id || `${start + i}`}
                className="border-b border-gray-200 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-black">id :</span>{' '}
                  <span className="text-black/80">{d.id}</span>
                </div>
                <div>
                  <span className="font-medium text-black">name :</span>{' '}
                  <span className="text-black/80">
                    {d.name || d.departmentName || '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-black/60">
              แสดง {start + 1}-{Math.min(start + pageSize, filtered.length)} จาก {filtered.length} รายการ
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo(1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-black/[.03]"
                aria-label="หน้าแรก"
              >
                « First
              </button>
              <button
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-black/[.03]"
                aria-label="ก่อนหน้า"
              >
                ‹ Prev
              </button>

              {/* หมายเลขหน้าแบบย่อ: แสดงช่วงรอบ ๆ หน้าปัจจุบัน */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter((p) => {
                  // แสดงหน้า 1, หน้าสุดท้าย และช่วง +/- 2 รอบหน้าปัจจุบัน
                  if (p === 1 || p === totalPages) return true;
                  return Math.abs(p - currentPage) <= 2;
                })
                .reduce((acc, p, i, arr) => {
                  // แทรก "…" เมื่อมีช่องว่างของหน้า
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('dots-' + p);
                  acc.push(p);
                  return acc;
                }, [])
                .map((p) =>
                  typeof p === 'string' ? (
                    <span key={p} className="px-2 text-sm text-black/50">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goTo(p)}
                      aria-current={p === currentPage ? 'page' : undefined}
                      className={
                        'rounded-lg px-3 py-1.5 text-sm ring-1 ' +
                        (p === currentPage
                          ? 'bg-black text-white ring-black'
                          : 'bg-white text-black ring-black/15 hover:bg-black/[.03]')
                      }
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-black/[.03]"
                aria-label="ถัดไป"
              >
                Next ›
              </button>
              <button
                onClick={() => goTo(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-black/[.03]"
                aria-label="หน้าสุดท้าย"
              >
                Last »
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
