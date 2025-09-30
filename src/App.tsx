
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import DownloadPage from "./pages/DownloadPage";
import AuthPage from "./pages/AuthPage";
import LegalPage from "./pages/LegalPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";

// Composant pour gérer la redirection automatique selon le rôle
function AuthRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  // Rediriger selon le rôle
  if (role === 'admin' || role === 'is_company_admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/home" replace />;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/auth" element={<AuthRedirect />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/upload/:toolId" element={<UploadPage />} />
            <Route path="/download/:toolId" element={<DownloadPage />} />
            <Route path="/legal/:type" element={<LegalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
