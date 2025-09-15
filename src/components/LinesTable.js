"use client";

import Link from "next/link";

export default function LinesTable({
  columns = [],
  rows = [],
  stickyHeader = true,
  getRowHref,
  showActions = false,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        {/* หัวตาราง */}
        <thead
          className={`${stickyHeader ? "sticky top-0 z-10" : ""} bg-gray-100 text-gray-800`}
        >
          <tr className="border-b border-gray-300">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left font-semibold text-sm tracking-wide border-r border-gray-300 last:border-r-0"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* เนื้อหาตาราง */}
        <tbody className="text-gray-900">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500 border-t border-gray-200"
              >
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            rows.map((r, ridx) => (
              <tr
                key={r.id ?? ridx}
                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {columns.map((col, cidx) => {
                  if (col.key === "actions" && showActions) {
                    return (
                      <td
                        key={`actions-${cidx}`}
                        className="px-4 py-2 border-t border-gray-200 border-r last:border-r-0 text-center"
                      >
                        <Link
                          href={getRowHref ? getRowHref(r) : "#"}
                          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-200 hover:text-black"
                        >
                          รายละเอียด
                        </Link>
                      </td>
                    );
                  }

                  const val = r[col.key] ?? "-";
                  return (
                    <td
                      key={`${col.key}-${cidx}`}
                      className="px-4 py-2 border-t border-gray-200 border-r last:border-r-0 align-top"
                    >
                      <span
                        className={
                          col.key === "code" ? "font-mono text-gray-800" : ""
                        }
                      >
                        {String(val)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
