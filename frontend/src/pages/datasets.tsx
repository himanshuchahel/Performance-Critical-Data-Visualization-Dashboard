import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/top-header";
import { PageHeader } from "@/components/page-header";
import { DatasetTable } from "@/components/dataset-table";

export default function DatasetsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} currentPath="/datasets" />

      <div className={"transition-all duration-300 md:ml-16" + (collapsed ? "" : " md:ml-[14.5rem]")}>
        <TopHeader title="Datasets" breadcrumb="Data / Datasets" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto">
          <PageHeader title="Datasets" description="Manage imported datasets, inspect metadata, and prepare for visualization." primaryAction={{ label: "Upload Dataset" }} />
          <DatasetTable />
        </main>
      </div>
    </div>
  );
}
