import { Toaster } from "sonner";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { PerformanceMetricsProvider } from "@/hooks/usePerformanceMetrics";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/auth-guard";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import DatasetsPageNew from "@/pages/datasets-new";
import DatasetDetailPage from "@/pages/dataset-detail";
import VisualizationPage from "@/pages/visualization";
import PerformancePage from "@/pages/performance";
import SettingsPage from "@/pages/settings";

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <PerformanceMetricsProvider>
        <Toaster richColors position="top-right" />

        <BrowserRouter>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

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
  );
}

export default App;