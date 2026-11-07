import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminProposals = lazy(() => import("./pages/admin/AdminProposals"));
const AdminContracts = lazy(() => import("./pages/admin/AdminContracts"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const PublicPage = lazy(() => import("./pages/public/PublicPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div role="status" style={{padding:32,textAlign:"center"}}>Carregando…</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/p/:token" element={<PublicPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="proposals" element={<AdminProposals />} />
            <Route path="contracts" element={<AdminContracts />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
