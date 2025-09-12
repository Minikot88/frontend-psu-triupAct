"use client";

import Card from "./Card";

export default function KPICard({
  title,
  value,
  diff,
  down = false,
  className = "",
}) {
  const trendIcon = down ? "▾" : "▴";

  return (
    <Card className={`mx-auto w-full ${className}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs text-black/60 truncate">{title}</p>
          <p className="mt-1 text-xl font-semibold text-black break-words">
            {value}
          </p>
        </div>

        <span
          className={[
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1",
            down
              ? "bg-red-50 text-red-700 ring-red-200"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200",
          ].join(" ")}
          title={down ? "ลดลง" : "เพิ่มขึ้น"}
          aria-label={`แนวโน้ม${down ? "ลดลง" : "เพิ่มขึ้น"} ${diff}`}
        >
          <span aria-hidden>{trendIcon}</span>
          {diff}
        </span>
      </div>
    </Card>
  );
}
