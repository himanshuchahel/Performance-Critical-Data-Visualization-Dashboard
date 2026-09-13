import { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart3, Download, RefreshCcw, ZoomIn, ZoomOut, RotateCcw, Settings2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/top-header";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { DatasetTableSkeleton } from "@/components/dataset-table-skeleton";
import { listDatasets, getDataset, getDatasetData } from "@/api/datasets";
import { CanvasRenderer } from "@/components/charts/CanvasRenderer";
import type { Dataset } from "@/types";

export default function VisualizationPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [datasetMeta, setDatasetMeta] = useState<Dataset | null>(null);
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"line" | "bar" | "scatter">("line");
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    listDatasets().then((r) => { if (r.success) setDatasets(r.data || []); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getDataset(selectedId).then((r) => { if (r.success) setDatasetMeta(r.data || null); }).catch(() => {});
    getDatasetData(selectedId, { limit: 500 }).then((r) => { if (r.success && r.data) setDataRows(r.data.rows || []); setLoading(false); }).catch(() => setLoading(false));
  }, [selectedId]);

  const columns = useMemo(() => {
    if (!dataRows.length) return [];
    return Object.keys(dataRows[0]).filter((k) => typeof dataRows[0][k] === "number" || typeof dataRows[0][k] === "string");
  }, [dataRows]);

  const chartData = useMemo(() => {
    return dataRows.slice(0, 200).map((row, i) => {
      const x = columns[0] ? row[columns[0]] : i;
      const y = columns[1] ? row[columns[1]] : i;
      return [x, y];
    });
  }, [dataRows, columns]);

  const handleRefresh = useCallback(() => { if (selectedId) { setLoading(true); getDatasetData(selectedId, { limit: 500 }).then((r) => { if (r.success && r.data) setDataRows(r.data.rows || []); setLoading(false); }).catch(() => setLoading(false)); } }, [selectedId]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} currentPath="/visualizations" />
      <div className={"transition-all duration-300 md:ml-16" + (collapsed ? "" : " md:ml-[14.5rem]")}>
        <TopHeader title="Visualization" breadcrumb="Data / Visualization" onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto space-y-6">
          <PageHeader title="Visualization" description="Explore, analyze and visualize your datasets." />
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-3">
                <div className="text-sm font-semibold">Dataset</div>
                <Select value={selectedId} onValueChange={(val) => { if (val) setSelectedId(val); }}>
                  <SelectTrigger><SelectValue placeholder="Select a dataset" /></SelectTrigger>
                  <SelectContent>{datasets.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}</SelectContent>
                </Select>
                {datasetMeta && (
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="flex justify-between"><span>Type</span><span className="font-medium">{(datasetMeta as any).type || "—"}</span></div>
                    <div className="flex justify-between"><span>Rows</span><span className="font-medium">{(datasetMeta as any).rows || 0}</span></div>
                    <div className="flex justify-between"><span>Columns</span><span className="font-medium">{(datasetMeta as any).columns || 0}</span></div>
                    <div className="flex justify-between"><span>Status</span><Badge variant="outline" className="text-xs">{(datasetMeta as any).status || "—"}</Badge></div>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-3">
                <div className="text-sm font-semibold">Configuration</div>
                <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                  <SelectTrigger><SelectValue placeholder="Chart type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="scatter">Scatter</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setZoom((z) => z + 0.2)}><ZoomIn className="h-3 w-3" /> In</Button>
                  <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}><ZoomOut className="h-3 w-3" /> Out</Button>
                  <Button size="sm" variant="outline" onClick={() => setZoom(1)}><RotateCcw className="h-3 w-3" /> Reset</Button>
                  <Button size="sm" variant="outline" onClick={handleRefresh}><RefreshCcw className="h-3 w-3" /> Refresh</Button><span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="text-sm font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4" />{datasetMeta ? (datasetMeta as any).name : "Select a dataset"}</div>
                    <div className="flex gap-2"><Button size="sm" variant="ghost"><Settings2 className="h-3 w-3" /> Settings</Button><Button size="sm" variant="ghost"><Download className="h-3 w-3" /> Export</Button></div>
                  </div>
                  <div className="bg-[#0a0f1c] relative" style={{ height: 360 }}>
                    {loading ? <DatasetTableSkeleton /> : chartData.length > 0 ? (
                      <CanvasRenderer type={chartType} data={chartData} width={780} height={360} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">No data to visualize</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "Points", val: dataRows.length },
                  { label: "Rows", val: dataRows.length },
                  { label: "Columns", val: columns.length },
                  { label: "Status", val: datasetMeta ? datasetMeta.status : "—" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-border bg-card p-3 shadow-sm"><div className="text-xs text-muted-foreground">{m.label}</div><div className="text-lg font-bold">{m.val}</div></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
