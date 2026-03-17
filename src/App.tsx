import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { PWAPrompt } from "@/components/PWAPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TaskRegister from "@/pages/TaskRegister";
import FollowUpTracker from "@/pages/FollowUpTracker";
import Projects from "@/pages/Projects";
import SharedProject from "@/pages/SharedProject";
import WeeklyReport from "@/pages/WeeklyReport";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ThemeApplier() {
  const { accentColor } = useApp();

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--ring', accentColor);
    document.documentElement.style.setProperty('--sidebar-primary', accentColor);
    document.documentElement.style.setProperty('--sidebar-ring', accentColor);
    document.documentElement.style.setProperty('--chart-2', accentColor);
  }, [accentColor]);

  return null;
}

function AuthGate() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskRegister />} />
        <Route path="/follow-ups" element={<FollowUpTracker />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/reports" element={<WeeklyReport />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <ThemeApplier />
          <Routes>
            <Route path="/shared" element={<SharedProject />} />
            <Route path="/*" element={<AuthGate />} />
          </Routes>
        </BrowserRouter>
        <OfflineIndicator />
        <PWAPrompt />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;