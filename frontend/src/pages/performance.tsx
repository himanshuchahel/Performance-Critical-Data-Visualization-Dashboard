import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/top-header";
import { PerformanceLab } from "@/components/performance-lab";

export default function PerformancePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} currentPath="/performance" />
      <div className={"transition-all duration-300 md:ml-16" + (collapsed ? "" : " md:ml-[14.5rem]")}>
        <TopHeader title="Performance Lab" breadcrumb="Tools / Performance Lab" onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto">
          <PerformanceLab />
        </main>
      </div>
    </div>
  );
}
