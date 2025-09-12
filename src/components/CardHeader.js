"use client";

export default function CardHeader({
  title,
  subtitle,
  onToggle,
  isOpen,
  className = "",
  controlsId, // (ถ้ามี) id ของกล่องที่ปิด/เปิด
}) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-black truncate">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-black/60 break-words">{subtitle}</p>
        ) : null}
      </div>

      {typeof onToggle === "function" && (
        <button
          onClick={onToggle}
          className="rounded-lg bg-black/10 px-2 py-1 text-xs text-black hover:bg-black/20"
          aria-expanded={Boolean(isOpen)}
          aria-controls={controlsId}
          type="button"
        >
          {isOpen ? "ซ่อน" : "แสดง"}
        </button>
      )}
    </div>
  );
}
