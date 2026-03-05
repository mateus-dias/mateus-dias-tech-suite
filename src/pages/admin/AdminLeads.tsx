import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Phone, Mail, Thermometer, GripVertical } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

const statusColumns = [
  { key: "novo", label: "Novo", color: "bg-muted" },
  { key: "contato_iniciado", label: "Contato Iniciado", color: "bg-primary/20" },
  { key: "alinhamento", label: "Alinhamento", color: "bg-accent/20" },
  { key: "mvp_enviado", label: "MVP Enviado", color: "bg-neon-cyan/20" },
  { key: "proposta_enviada", label: "Proposta Enviada", color: "bg-neon-purple/20" },
  { key: "negociacao", label: "Negociação", color: "bg-primary/30" },
  { key: "contrato_enviado", label: "Contrato Enviado", color: "bg-accent/30" },
  { key: "assinado", label: "Assinado", color: "bg-neon-green/20" },
  { key: "projeto_andamento", label: "Em Andamento", color: "bg-primary/40" },
  { key: "finalizado", label: "Finalizado", color: "bg-neon-green/30" },
] as const;

const tempColors = {
  frio: "text-neon-cyan",
  morno: "text-primary",
  quente: "text-destructive",
};

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [form, setForm] = useState({
    name: "", company: "", phone: "", email: "", origin: "", segment: "",
    priority: "media" as const, temperature: "morno" as const,
    best_contact_time: "", estimated_value: "", notes: "", lovable_account: "",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...form,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      user_id: user.id,
    };

    if (editingLead) {
      await supabase.from("leads").update(payload).eq("id", editingLead.id);
    } else {
      await supabase.from("leads").insert(payload);
    }

    setShowForm(false);
    setEditingLead(null);
    setForm({ name: "", company: "", phone: "", email: "", origin: "", segment: "",
      priority: "media", temperature: "morno", best_contact_time: "", estimated_value: "",
      notes: "", lovable_account: "" });
    fetchLeads();
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    await supabase.from("leads").update({ status: newStatus as Lead["status"] }).eq("id", leadId);
    fetchLeads();
  };

  const editLead = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name, company: lead.company || "", phone: lead.phone || "",
      email: lead.email || "", origin: lead.origin || "", segment: lead.segment || "",
      priority: lead.priority || "media", temperature: lead.temperature || "morno",
      best_contact_time: lead.best_contact_time || "",
      estimated_value: lead.estimated_value?.toString() || "",
      notes: lead.notes || "", lovable_account: lead.lovable_account || "",
    });
    setShowForm(true);
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads / CRM</h1>
          <p className="text-sm text-muted-foreground">{leads.length} leads no total</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48"
            />
          </div>
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button onClick={() => setView("kanban")} className={`px-3 py-2 text-xs ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              Kanban
            </button>
            <button onClick={() => setView("list")} className={`px-3 py-2 text-xs ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              Lista
            </button>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingLead(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Plus size={16} /> Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {statusColumns.map((col) => {
              const columnLeads = filteredLeads.filter(l => l.status === col.key);
              return (
                <div key={col.key} className="w-72 shrink-0">
                  <div className={`${col.color} rounded-t-xl px-4 py-2 flex items-center justify-between`}>
                    <span className="text-xs font-semibold text-foreground">{col.label}</span>
                    <span className="text-xs text-muted-foreground">{columnLeads.length}</span>
                  </div>
                  <div className="bg-secondary/30 rounded-b-xl p-2 space-y-2 min-h-[200px]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const leadId = e.dataTransfer.getData("leadId");
                      if (leadId) handleStatusChange(leadId, col.key);
                    }}
                  >
                    {columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("leadId", lead.id)}
                        onClick={() => editLead(lead)}
                        className="glass-card rounded-xl p-3 cursor-pointer hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-foreground">{lead.name}</span>
                          <GripVertical size={14} className="text-muted-foreground" />
                        </div>
                        {lead.company && <p className="text-xs text-muted-foreground mb-1">{lead.company}</p>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {lead.phone && <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>}
                          {lead.temperature && (
                            <span className={`flex items-center gap-1 ${tempColors[lead.temperature]}`}>
                              <Thermometer size={10} /> {lead.temperature}
                            </span>
                          )}
                        </div>
                        {lead.estimated_value && (
                          <p className="text-xs font-medium text-primary mt-2">
                            R$ {Number(lead.estimated_value).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Nome</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Empresa</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Temp.</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Valor</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Contato</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} onClick={() => editLead(lead)} className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground font-medium">{lead.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{lead.company || "—"}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{lead.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs ${tempColors[lead.temperature || 'morno']}`}>{lead.temperature}</span></td>
                  <td className="px-4 py-3 text-sm text-foreground">{lead.estimated_value ? `R$ ${Number(lead.estimated_value).toLocaleString('pt-BR')}` : "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {lead.email && <Mail size={14} className="text-muted-foreground" />}
                    {lead.phone && <Phone size={14} className="text-muted-foreground" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">{editingLead ? "Editar Lead" : "Novo Lead"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Empresa</label>
                  <input value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Telefone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Origem</label>
                  <input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} placeholder="Ex: Google, Indicação..."
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Segmento</label>
                  <input value={form.segment} onChange={e => setForm({...form, segment: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Prioridade</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Temperatura</label>
                  <select value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="frio">Frio</option>
                    <option value="morno">Morno</option>
                    <option value="quente">Quente</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Melhor Horário</label>
                  <input value={form.best_contact_time} onChange={e => setForm({...form, best_contact_time: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor Estimado (R$)</label>
                  <input type="number" value={form.estimated_value} onChange={e => setForm({...form, estimated_value: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Conta Lovable</label>
                  <input value={form.lovable_account} onChange={e => setForm({...form, lovable_account: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Observações</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                  {editingLead ? "Salvar" : "Criar Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
