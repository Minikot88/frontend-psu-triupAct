// app/plans/[id]/page.jsx
"use client";

import { useParams } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";

const mockData = {
  form_plan_id: 40,
  form_plan_form_new_id: 190,
  form_plan_code: "2567/0074/UP01",
  form_plan_fullname: "เด่นนภา",
  form_plan_lastname: "โสตถิพันธุ์",
  form_plan_prefix: 2,
  form_plan_idcard: null,
  form_plan_department: "มหาวิทยาลัยสงขลานครินทร์",
  form_plan_position: "รองศาสตราจารย์",
  form_plan_tel: "0815637546",
  form_plan_email: "dennapa.sa@psu.ac.th",
  form_plan_type_status:
    "การวิจัยในระดับห้องปฏิบัติการหรือการวิจัยเบื้องต้นเพื่อพิสูจน์และตรวจสอบแนวคิดใหม่ (TRL/SRL 1-4)",
  form_plan_type_status_other: null,
  form_plan_period: 24,
  form_plan_start_date: "2024-06-10",
  form_plan_usage_value: "10000000.00",
  form_plan_target: "หน่วยงานของรัฐ",
  form_plan_target_check: "",
  form_plan_target_other: "",
  form_plan_user_target: "นักวิจัยและมหาวิทยาลัย",
  form_plan_result: "หน่วยงานของรัฐ",
  form_plan_result_check: "",
  form_plan_result_other: "",
  form_plan_user_result: "นักวิจัยและมหาวิทยาลัย",
  form_plan_status: "ผ่านการอนุมัติ ",
  form_plan_checked_by: 733,
  form_plan_checked_date: "2024-07-09 11:13:41",
  form_plan_form_own_id: null,
  form_plan_form_plan_id: null,
  form_plan_type: null,
  form_plan_reason: null,
  form_plan_condition: 1,
  form_plan_create_by: 276,
  form_plan_created_at: "2024-07-05 13:57:21",
  form_plan_update_by: null,
  form_plan_updated_at: "2024-07-09 10:45:40",
  form_plan_deleted_at: null,
  import_by: null,
  fullname: "นางเด่นนภา โสตถิพันธุ์",
  objective: [
    [
      "วัตถุประสงค์ของการใช้ประโยชน์ : ใช้ประโยชน์ด้านนโยบาย",
      "รูปแบบของการใช้ประโยชน์ : การนำผลงานวิจัยและนวัตกรรมไปใช้ในการศึกษา ค้นคว้า ทดลอง หรือวิจัยเพื่อพัฒนาต้นแบบผลิตภัณฑ์หรือต่อยอดผลงานนั้น / การใช้หรืออนุญาตให้ใช้สิทธิในผลงานวิจัยและนวัตกรรม",
      "ลักษณะและกลไกการใช้ประโยชน์ : อื่นๆ โปรดระบุ "
    ]
  ],
  period: [
    [
      "ระยะเวลา : 06-2567 ถึง 12-2567",
      "กิจกรรม : ยื่นขอสิทธิความเป็นเจ้าของผลงานวิจัยและนวัตกรรม",
      "ผลที่คาดว่าจะได้รับ : ได้หนังสือรับรองสิทธิความเป็นเจ้าของผลงานวิจัยและนวัตกรรม"
    ],
    [
      "ระยะเวลา : 01-2568 ถึง 06-2568",
      "กิจกรรม : ยื่นขอรับความคุ้มครองในทรัพย์สินทางปัญญา",
      "ผลที่คาดว่าจะได้รับ : ได้รับความคุ้มครองในทรัพย์สินทางปัญญา"
    ],
    [
      "ระยะเวลา : 07-2568 ถึง 06-2569",
      "กิจกรรม : ตีพิมพ์ผลงานวิจัย",
      "ผลที่คาดว่าจะได้รับ : บทความวิจัย"
    ]
  ]
};

const labelMap = {
  form_plan_id: "รหัสภายใน",
  form_plan_form_new_id: "รหัสฟอร์ม (ใหม่)",
  form_plan_code: "เลขที่โครงการ",
  form_plan_fullname: "ชื่อ",
  form_plan_lastname: "นามสกุล",
  form_plan_prefix: "คำนำหน้า (รหัส)",
  form_plan_idcard: "เลขบัตรประชาชน",
  form_plan_department: "หน่วยงาน",
  form_plan_position: "ตำแหน่ง",
  form_plan_tel: "โทรศัพท์",
  form_plan_email: "อีเมล",
  form_plan_type_status: "ประเภทสถานะโครงการ",
  form_plan_type_status_other: "ประเภทสถานะ (อื่นๆ)",
  form_plan_period: "ระยะเวลาดำเนินการ (เดือน)",
  form_plan_start_date: "วันที่เริ่ม",
  form_plan_usage_value: "งบประมาณ (บาท)",
  form_plan_target: "กลุ่มเป้าหมาย",
  form_plan_target_check: "เป้าหมาย (ตัวเลือก)",
  form_plan_target_other: "กลุ่มเป้าหมาย (อื่นๆ)",
  form_plan_user_target: "ผู้ใช้ประโยชน์ (เป้าหมาย)",
  form_plan_result: "ผลลัพธ์",
  form_plan_result_check: "ผลลัพธ์ (ตัวเลือก)",
  form_plan_result_other: "ผลลัพธ์ (อื่นๆ)",
  form_plan_user_result: "ผู้ใช้ประโยชน์ (ผลลัพธ์)",
  form_plan_status: "สถานะการอนุมัติ",
  form_plan_checked_by: "ตรวจสอบโดย (รหัสผู้ใช้)",
  form_plan_checked_date: "วันที่ตรวจสอบ",
  form_plan_form_own_id: "รหัสแบบฟอร์มเจ้าของ",
  form_plan_form_plan_id: "รหัสแบบฟอร์มแผน",
  form_plan_type: "ประเภทโครงการ",
  form_plan_reason: "เหตุผล",
  form_plan_condition: "เงื่อนไข",
  form_plan_create_by: "สร้างโดย (รหัสผู้ใช้)",
  form_plan_created_at: "วันที่สร้าง",
  form_plan_update_by: "อัปเดตโดย (รหัสผู้ใช้)",
  form_plan_updated_at: "วันที่อัปเดต",
  form_plan_deleted_at: "วันที่ลบ",
  import_by: "นำเข้าโดย",
  fullname: "ชื่อ–สกุล (เต็ม)"
};

const groups = [
  {
    title: " ข้อมูลโครงการ",
    keys: [
      "form_plan_code",
      "form_plan_type_status",
      "form_plan_type_status_other",
      "form_plan_type",
      "form_plan_reason"
    ]
  },
  {
    title: " ผู้รับผิดชอบ / ติดต่อ",
    keys: [
      "form_plan_fullname",
      "form_plan_lastname",
      "form_plan_prefix",
      "fullname",
      "form_plan_department",
      "form_plan_position",
      "form_plan_tel",
      "form_plan_email",
      "form_plan_idcard"
    ]
  },
  {
    title: " เป้าหมาย / ผลลัพธ์",
    keys: [
      "form_plan_target",
      "form_plan_target_check",
      "form_plan_target_other",
      "form_plan_user_target",
      "form_plan_result",
      "form_plan_result_check",
      "form_plan_result_other",
      "form_plan_user_result"
    ]
  },
  {
    title: " เวลา / งบประมาณ",
    keys: [
      "form_plan_period",
      "form_plan_start_date",
      "form_plan_usage_value"
    ]
  },
  {
    title: " สถานะ / การอนุมัติ",
    keys: [
      "form_plan_status",
      "form_plan_checked_by",
      "form_plan_checked_date",
      "form_plan_condition"
    ]
  },
  {
    title: " เมตาดาต้า / บันทึกระบบ",
    keys: [
      "form_plan_id",
      "form_plan_form_new_id",
      "form_plan_form_own_id",
      "form_plan_form_plan_id",
      "form_plan_create_by",
      "form_plan_created_at",
      "form_plan_update_by",
      "form_plan_updated_at",
      "form_plan_deleted_at",
      "import_by"
    ]
  }
];

const formatValue = (key, val) => {
  if (val == null || val === "") return "-";
  if (key === "form_plan_usage_value") {
    const num = Number(val);
    return isFinite(num) ? num.toLocaleString("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 2 }) : String(val);
  }
  return String(val);
};

export default function PlanDetailPage() {
  const { id } = useParams();
  const data = mockData;
  const isScalar = (v) => typeof v !== "object" || v === null;

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-black">รายละเอียดแผนงาน #{id}</h1>
          <p className="mt-1 text-sm text-gray-600">เลขที่โครงการ: {data.form_plan_code || "-"}</p>
        </header>

        <div className="space-y-8">
          {groups.map(({ title, keys }) => {
            const items = keys
              .filter((k) => k in data && isScalar(data[k]))
              .map((k) => ({ key: k, label: labelMap[k] || k, value: formatValue(k, data[k]) }));

            if (items.length === 0) return null;

            return (
              <section key={title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-black">{title}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {items.map(({ key, label, value }) => (
                    <FieldRow key={key} label={label} value={value} />
                  ))}
                </div>
              </section>
            );
          })}

          {Array.isArray(data.objective) && data.objective.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-black"> วัตถุประสงค์</h2>
              {data.objective.map((group, gi) => (
                <ul key={gi} className="mb-4 list-disc space-y-2 pl-6 text-gray-800">
                  {Array.isArray(group) &&
                    group.map((line, li) => <li key={li}>{line}</li>)}
                </ul>
              ))}
            </section>
          )}

          {Array.isArray(data.period) && data.period.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-black"> ระยะเวลาดำเนินการ</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.period.map((p, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    {(Array.isArray(p) ? p : [p]).map((line, li) => (
                      <p key={li} className="text-sm text-gray-800">{line}</p>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Prince of Songkla University
        </footer>
      </main>
    </SidebarLayout>
  );
}

function FieldRow({ label, value }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-black break-words">{value}</p>
    </div>
  );
}
