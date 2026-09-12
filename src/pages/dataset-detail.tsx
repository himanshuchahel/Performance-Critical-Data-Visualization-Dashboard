import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/top-header";
import { DatasetHeader } from "@/components/datasets/DatasetHeader";
import { DatasetSummary } from "@/components/datasets/DatasetSummary";
import { DatasetOverview } from "@/components/datasets/DatasetOverview";
import { DataPreview } from "@/components/datasets/DataPreview";
import VisualizationWorkspace from "@/components/datasets/VisualizationWorkspace";
import { getDataset, getDatasetData } from "@/api/datasets";


const tabs = [
  { id: "overview", label: "Overview" },
  { id: "data", label: "Data" },
  { id: "visualize", label: "Visualize" },
];

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [dataRows, setDataRows] = useState<any[]>([]);
  const [dataColumns, setDataColumns] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [dataPage, setDataPage] = useState(1);
  const [dataTotal, setDataTotal] = useState(0);
  const dataLimit = 50;
  const loadDatasetData = async (page = 1) => {
    if (!id) return;

    setDataLoading(true);
    setDataError("");

    try {
      const res = await getDatasetData(id, {
        page,
        limit: dataLimit,
      });

      if (res.success && res.data) {
        setDataRows(res.data.rows);
        setDataColumns(res.data.columns);
        setDataTotal(res.data.total);
        setDataPage(res.data.page);
      } else {
        setDataError(res.message || "Failed to load dataset data.");
      }
    } catch (err: any) {
      setDataError(err?.message || "Failed to load dataset data.");
    } finally {
      setDataLoading(false);
    }
  };


  useEffect(() => {
    if (activeTab === "data" && id) {
      loadDatasetData(dataPage);
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDataset(id)
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data as any;
          setDataset({
            id: d._id || d.id,
            name: d.name,
            type: d.fileType,
            rows: d.rowCount,
            columns: d.columnCount,
            size: d.fileSize,
            status: d.status,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt),
            originalFileName: d.originalFileName,
            columnDefs: (d.columns || []).map((columnName: string) => ({
              name: columnName,
              type: "String",
              nonNull: d.rowCount,
              nullCount: 0,
              unique: d.rowCount,
              example: "-",
            }))
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;

  // Invalid ID state
  if (!dataset) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} currentPath="/datasets" />
        <div className={"transition-all duration-300 md:ml-16" + (collapsed ? "" : " md:ml-[14.5rem]")}>
          <TopHeader title="Dataset not found" breadcrumb="Datasets / unknown" onMenuClick={() => setMobileOpen(true)} />
          <main className="px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dataset not found</h1>
            <p className="text-muted-foreground mt-2">The dataset ID <code className="bg-muted px-1 rounded text-sm">{id}</code> does not exist.</p>
            <Link to="/datasets" className="inline-block mt-6 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">Back to Datasets</Link>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} currentPath={`/datasets/${dataset.id}`} />
      <div className={"transition-all duration-300 md:ml-16" + (collapsed ? "" : " md:ml-[14.5rem]")}>
        <TopHeader title={dataset.name} breadcrumb={`Datasets / ${dataset.name}`} onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto space-y-6">
          <DatasetHeader dataset={dataset} />
          <DatasetSummary dataset={dataset} />

          {/* Tabs */}
          <div role="tablist" aria-label="Dataset workspace tabs" className="flex items-center gap-1 bg-muted/50 rounded-xl p-0.5 w-fit border border-border/60">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${activeTab === t.id ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-[320px]">
            {activeTab === "overview" && <DatasetOverview dataset={dataset} />}
            
            {activeTab === "data" && (
              <div className="space-y-4">
                {dataError && (
                  <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-3 py-2 border border-destructive/20">
                    {dataError}
                  </div>
                )}

                {dataLoading ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                    Loading dataset data...
                  </div>
                ) : (
                  <DataPreview
                    rows={dataRows}
                    columns={dataColumns}
                  />
                )}

                {!dataLoading && dataTotal > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Showing {dataRows.length} of {dataTotal.toLocaleString()} rows
                  </div>
                )}
              </div>
            )}

            {activeTab === "visualize" && <VisualizationWorkspace />}
          </div>
        </main>
      </div>
    </div>
  );
}
