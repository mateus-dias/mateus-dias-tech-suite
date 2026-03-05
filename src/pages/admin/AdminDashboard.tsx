import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, ScrollText, CreditCard, TrendingUp, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    proposals: 0,
    contracts: 0,
    payments: 0,
    visits: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [leads, proposals, contracts, payments, visits] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("proposals").select("id", { count: "exact", head: true }),
        supabase.from("contracts").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("value, status"),
        supabase.from("site_visits").select("id", { count: "exact", head: true }),
      ]);

      const paidPayments = (payments.data || []).filter(p => p.status === 'pago');
      const revenue = paidPayments.reduce((sum, p) => sum + (Number(p.value) || 0), 0);

      setStats({
        totalLeads: leads.count || 0,
        proposals: proposals.count || 0,
        contracts: contracts.count || 0,
        payments: paidPayments.length,
        visits: visits.count || 0,
        revenue,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Leads", value: stats.totalLeads, icon: Users, color: "text-primary" },
    { label: "Propostas", value: stats.proposals, icon: FileText, color: "text-accent" },
    { label: "Contratos", value: stats.contracts, icon: ScrollText, color: "text-neon-purple" },
    { label: "Pagamentos", value: stats.payments, icon: CreditCard, color: "text-neon-green" },
    { label: "Visitas", value: stats.visits, icon: Eye, color: "text-neon-cyan" },
    { label: "Faturamento", value: `R$ ${stats.revenue.toLocaleString('pt-BR')}`, icon: TrendingUp, color: "text-primary" },
  ];

  // Placeholder chart data
  const chartData = [
    { month: "Jan", leads: 4, propostas: 2, contratos: 1 },
    { month: "Fev", leads: 6, propostas: 4, contratos: 2 },
    { month: "Mar", leads: 8, propostas: 5, contratos: 3 },
    { month: "Abr", leads: 5, propostas: 3, contratos: 2 },
    { month: "Mai", leads: 10, propostas: 7, contratos: 4 },
    { month: "Jun", leads: 12, propostas: 8, contratos: 5 },
  ];

  const visitData = [
    { day: "Seg", visitas: 45 },
    { day: "Ter", visitas: 62 },
    { day: "Qua", visitas: 38 },
    { day: "Qui", visitas: 71 },
    { day: "Sex", visitas: 55 },
    { day: "Sab", visitas: 28 },
    { day: "Dom", visitas: 15 },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua plataforma</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={card.color} />
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Funil de Vendas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="propostas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="contratos" fill="hsl(var(--neon-green))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Visitas no Site</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={visitData}>
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <defs>
                <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="visitas"
                stroke="hsl(var(--primary))"
                fill="url(#colorVisitas)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
