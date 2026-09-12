import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { PerformanceMetricsProvider } from "@/hooks/usePerformanceMetrics";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/auth-guard";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import DatasetsPageNew from "@/pages/datasets-new";
import DatasetDetailPage from "@/pages/dataset-detail";
import VisualizationPage from "@/pages/visualization";
import PerformancePage from "@/pages/performance";
import SettingsPage from "@/pages/settings";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <PerformanceMetricsProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<AuthGuard />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/datasets" element={<DatasetsPageNew />} />
              <Route path="/datasets/:id" element={<DatasetDetailPage />} />
              <Route path="/visualizations" element={<VisualizationPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PerformanceMetricsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
