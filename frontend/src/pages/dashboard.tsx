import { useState, useEffect, useMemo } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/top-header";
import { StatCards } from "@/components/stat-cards";
import { RecentDatasets } from "@/components/recent-datasets";
import { PerformanceOverview } from "@/components/performance-overview";
import { QuickActions } from "@/components/quick-actions";
import { PageHeader } from "@/components/page-header";
import { DatasetUploadDialog } from "@/components/dataset-upload-dialog";

import { listDatasets } from "@/api/datasets";
import { usePerfMonitor } from "@/hooks/usePerformanceMonitor";

import type { Dataset as ApiDataset } from "@/types";

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<ApiDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Real browser performance measurement
  const { averageFps } = usePerfMonitor();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await listDatasets();

      if (response.success && Array.isArray(response.data)) {
        setDatasets(response.data);
      } else {
        setDatasets([]);
        setError(
          response.message || "Failed to load datasets."
        );
      }
    } catch (err: any) {
      console.error("Dashboard data error:", err);

      setDatasets([]);
      setError(
        err?.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalDatasets = datasets.length;

    const totalRows = datasets.reduce(
      (total, dataset) =>
        total + (dataset.rowCount || 0),
      0
    );

    const totalStorage = datasets.reduce(
      (total, dataset) =>
        total + (dataset.fileSize || 0),
      0
    );

    return {
      totalDatasets,
      totalRows,
      totalStorage,
    };
  }, [datasets]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20">
      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        onToggle={() =>
          setCollapsed((current) => !current)
        }
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        currentPath="/"
      />

      {/* Main application area */}
      <div
        className={[
          "min-h-screen transition-all duration-300",
          "md:ml-16",
          collapsed ? "" : "md:ml-[14.5rem]",
        ].join(" ")}
      >
        {/* Top navigation */}
        <TopHeader
          title="Dashboard"
          breadcrumb="Overview"
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Dashboard content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Page header */}
          <div className="mb-6">
            <PageHeader
              title="Dashboard"
              description="Monitor your datasets, visualizations, and rendering performance."
              primaryAction={{
                label: "Upload Dataset",
                onClick: () =>
                  setUploadDialogOpen(true),
              }}
              // secondaryAction={{
              //   label: "Try Demo",
              // }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Backend status */}
          <div className="mb-6 rounded-xl border border-border/80 bg-card px-5 py-4 shadow-sm">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
                Loading dashboard data...
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span>
                  Connected to backend
                </span>

                <span className="text-muted-foreground/50">
                  —
                </span>

                <span className="font-medium text-foreground">
                  {dashboardStats.totalDatasets}
                </span>

                <span>
                  {dashboardStats.totalDatasets === 1
                    ? "dataset"
                    : "datasets"}
                </span>

                <span className="text-muted-foreground/50">
                  ,
                </span>

                <span className="font-medium text-foreground">
                  {dashboardStats.totalRows.toLocaleString()}
                </span>

                <span>rows</span>
              </div>
            )}
          </div>

          {/* Dashboard sections */}
          <div className="space-y-7">
            {/* Statistics */}
            <section aria-label="Dashboard statistics">
              <StatCards
                totalDatasets={
                  dashboardStats.totalDatasets
                }
                totalRows={dashboardStats.totalRows}
                totalStorage={
                  dashboardStats.totalStorage
                }
                averageFps={averageFps}
                loading={loading}
              />
            </section>

            {/* Main dashboard grid */}
            <section
              aria-label="Dashboard overview"
              className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3"
            >
              {/* Recent datasets */}
              <div className="min-w-0 xl:col-span-2">
                <RecentDatasets />
              </div>

              {/* Performance */}
              <div className="min-w-0">
                <PerformanceOverview />
              </div>
            </section>

            {/* Quick actions */}
            <section aria-label="Quick actions">
              <QuickActions
                onUploadClick={() =>
                  setUploadDialogOpen(true)
                }
              />
            </section>
          </div>
        </main>

        {/* Upload dialog */}
        <DatasetUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUploaded={() => {
            loadDashboardData();
          }}
        />
      </div>
    </div>
  );
}