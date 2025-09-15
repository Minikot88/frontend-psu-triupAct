"use client";

export default function LinesTable({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-300 bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        {/* หัวตาราง (sticky ได้ถ้าต้องการ) */}
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="
                  px-3 py-2 text-left font-semibold
                  border-b border-gray-300
                  border-r last:border-r-0
                  whitespace-nowrap
                "
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-gray-800">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-gray-500 border-b border-gray-300"
              >
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={r.id ?? idx} className="odd:bg-white even:bg-gray-50">
                {columns.map((col, i) => (
                  <td
                    key={col.key + "-" + i}
                    className="
                      px-3 py-2
                      border-b border-gray-300
                      border-r last:border-r-0
                      align-top
                    "
                  >
                    {String(r[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
