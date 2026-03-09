import { useCallback, useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Users, FileText, ScrollText, CreditCard, FolderKanban,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import logo from "@/assets/Logo.png";
import type { User } from "@supabase/supabase-js";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Leads / CRM", icon: Users, path: "/admin/leads" },
  { label: "Propostas", icon: FileText, path: "/admin/proposals" },
  { label: "Contratos", icon: ScrollText, path: "/admin/contracts" },
  { label: "Pagamentos", icon: CreditCard, path: "/admin/payments" },
  { label: "Projetos", icon: FolderKanban, path: "/admin/projects" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Configurações", icon: Settings, path: "/admin/settings" },
];

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const validateAdminSession = useCallback(async (sessionUser: User | null) => {
    if (!sessionUser) {
      setUser(null);
      setLoading(false);
      navigate("/admin/login", { replace: true });
      return;
    }

    const { data: isAdmin, error } = await (supabase as any).rpc("has_role", {
      _user_id: sessionUser.id,
      _role: "admin",
    });

    if (error || !isAdmin) {
      await supabase.auth.signOut();
      setUser(null);
      setLoading(false);
      navigate("/admin/login", { replace: true });
      return;
    }

    setUser(sessionUser);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      void validateAdminSession(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      void validateAdminSession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [validateAdminSession]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} border-r border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">Mateus Dias</p>
              <p className="text-xs text-muted-foreground truncate">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span>Recolher</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
