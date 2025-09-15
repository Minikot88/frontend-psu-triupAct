"use client";

import SidebarLayout from "@/components/SidebarLayout";
import KPICard from "@/components/KPICard";
import DepartmentsTable from "@/components/api/DepartmentsTable";
import AddressTable from "@/components/api/AddressTable";
import CofundersTable from "@/components/api/CofundersTable";
import EducationlevelsTable from "@/components/api/Educationlevels";
import FindingdetaillistsTable from "@/components/api/FindingdetaillistsTable";
import FormAllocateTable from "@/components/api/FormAllocateTable";
import FormExtendTable from "@/components/api/FormExtendTable";
import FormNewFindingsTable from "@/components/api/FormNewFindingsTable";
import FormResearchOwnerTable from "@/components/api/FormResearchOwnerTable";

export default function DashboardPage() {
  return (
    <SidebarLayout>
      {/* คอนเทนต์: responsive container + ไม่มีสกรอลล์แนวนอน */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
        {/* Header: จัดวางให้สวยบนทุกหน้าจอ */}
        <header className="mb-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                ภาพรวมระบบ
              </h1>
              <p className="mt-1 text-sm text-black/60">
                สรุปสั้นๆ ของการใช้งานและสถานะระบบ
              </p>
            </div>
            {/* ที่ว่างสำหรับปุ่ม/ฟิลเตอร์ในอนาคต */}
            <div className="mt-3 sm:mt-0 flex gap-2"></div>
          </div>
        </header>

        {/* KPI Cards: 1 → 2 → 4 คอลัมน์ตามจอ */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="ผู้ใช้ใหม่" value="1,284" diff="▲ 8.2%" />
          <KPICard title="การเข้าชม" value="23,901" diff="▲ 3.4%" />
          <KPICard title="อัตราแปลงผล" value="4.7%" diff="▼ 0.6%" down />
          <KPICard title="รายได้ (฿)" value="176,420" diff="▲ 12.1%" />
        </section>

        <section className="grid grid-cols-1">
          <div className="mb-6 w-full">
            <DepartmentsTable />
          </div>

          <div className="mb-6 md:mb-4">
            <AddressTable />
          </div>

          <div className="mb-6 md:mb-4">
            <CofundersTable />
          </div>

          <div className="mb-6 md:mb-4">
            <EducationlevelsTable />
          </div>

          <div className="mb-6 md:mb-4">
            <FindingdetaillistsTable />
          </div>

          <div className="mb-6 md:mb-4">
            <FormAllocateTable />
          </div>

            <div className="mb-6 md:mb-4">
            <FormExtendTable />
          </div>


   <div className="mb-6 md:mb-4">
            <FormNewFindingsTable />
          </div>

  <div className="mb-6 md:mb-4">
            <FormResearchOwnerTable />
          </div>

        </section>
      </main>
    </SidebarLayout>
  );
}
