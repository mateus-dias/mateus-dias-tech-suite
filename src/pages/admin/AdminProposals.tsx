import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Copy, ExternalLink, Trash2, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  enviada: { label: "Enviada", color: "bg-primary/20 text-primary" },
  aprovada: { label: "Aprovada", color: "bg-neon-green/20 text-neon-green" },
  ajustes: { label: "Ajustes", color: "bg-accent/20 text-accent" },
  recusada: { label: "Recusada", color: "bg-destructive/20 text-destructive" },
};

const inputClass = "w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

const AdminProposals = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showAdjustments, setShowAdjustments] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<any[]>([]);

  const defaultForm = {
    lead_id: "",
    title: "",
    description: "",
    project_overview: "",
    objectives: "",
    functional_scope: "",
    scope_included: [""],
    scope_excluded: [""],
    technologies: "",
    hosting: "",
    deadline: "",
    value: "",
    payment_terms: "",
    validity_days: "15",
    guarantee: "",
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: p }, { data: l }] = await Promise.all([
      supabase.from("proposals").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("name"),
    ]);
    if (p) setProposals(p);
    if (l) setLeads(l);
  };

  const fetchAdjustments = async (proposalId: string) => {
    const { data } = await supabase.from("proposal_adjustments")
      .select("*")
      .eq("proposal_id", proposalId)
      .order("created_at", { ascending: false });
    setAdjustments(data || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: any = {
      lead_id: form.lead_id,
      title: form.title,
      description: form.description,
      project_overview: form.project_overview || null,
      objectives: form.objectives || null,
      functional_scope: form.functional_scope || null,
      scope_included: form.scope_included.filter(s => s.trim()),
      scope_excluded: form.scope_excluded.filter(s => s.trim()),
      technologies: form.technologies || null,
      hosting: form.hosting || null,
      deadline: form.deadline || null,
      value: form.value ? parseFloat(form.value) : null,
      payment_terms: form.payment_terms || null,
      validity_days: parseInt(form.validity_days) || 15,
      guarantee: form.guarantee || null,
      user_id: user.id,
    };

    if (editing) {
      await supabase.from("proposals").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("proposals").insert(payload);
    }

    setShowForm(false);
    setEditing(null);
    setForm(defaultForm);
    fetchData();
    toast.success(editing ? "Proposta atualizada!" : "Proposta criada!");
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("proposals").update({ status: status as any }).eq("id", id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta proposta?")) return;
    await supabase.from("proposals").delete().eq("id", id);
    fetchData();
    toast.success("Proposta excluída!");
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${token}`);
    toast.success("Link copiado!");
  };

  const editProposal = async (p: any) => {
    setEditing(p);
    setForm({
      lead_id: p.lead_id,
      title: p.title,
      description: p.description || "",
      project_overview: p.project_overview || "",
      objectives: p.objectives || "",
      functional_scope: p.functional_scope || "",
      scope_included: p.scope_included?.length ? p.scope_included : [""],
      scope_excluded: p.scope_excluded?.length ? p.scope_excluded : [""],
      technologies: p.technologies || "",
      hosting: p.hosting || "",
      deadline: p.deadline || "",
      value: p.value?.toString() || "",
      payment_terms: p.payment_terms || "",
      validity_days: p.validity_days?.toString() || "15",
      guarantee: p.guarantee || "",
    });
    setShowForm(true);
  };

  const getLeadName = (id: string) => leads.find(l => l.id === id)?.name || "—";

  const filtered = proposals.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    getLeadName(p.lead_id).toLowerCase().includes(search.toLowerCase())
  );

  const addScopeItem = (type: "scope_included" | "scope_excluded") => {
    setForm({ ...form, [type]: [...form[type], ""] });
  };

  const updateScopeItem = (type: "scope_included" | "scope_excluded", index: number, value: string) => {
    const arr = [...form[type]];
    arr[index] = value;
    setForm({ ...form, [type]: arr });
  };

  const removeScopeItem = (type: "scope_included" | "scope_excluded", index: number) => {
    setForm({ ...form, [type]: form[type].filter((_, i) => i !== index) });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Propostas</h1>
          <p className="text-sm text-muted-foreground">{proposals.length} propostas</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-48" />
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus size={16} /> <span className="hidden sm:inline">Nova Proposta</span><span className="sm:hidden">Nova</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="glass-card rounded-xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Título</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Cliente</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Valor</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground font-medium cursor-pointer" onClick={() => editProposal(p)}>{p.title}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{getLeadName(p.lead_id)}</td>
                <td className="px-4 py-3 text-sm text-foreground">{p.value ? `R$ ${Number(p.value).toLocaleString('pt-BR')}` : "—"}</td>
                <td className="px-4 py-3">
                  <select value={p.status || "rascunho"} onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusLabels[p.status || "rascunho"]?.color || ""}`}>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setShowAdjustments(p.id); fetchAdjustments(p.id); }}
                      className="text-muted-foreground hover:text-accent transition-colors" title="Ver ajustes">
                      <MessageSquare size={14} />
                    </button>
                    {p.public_token && (
                      <button onClick={() => copyLink(p.public_token!)} className="text-muted-foreground hover:text-primary transition-colors" title="Copiar link">
                        <Copy size={14} />
                      </button>
                    )}
                    {p.public_token && (
                      <a href={`/p/${p.public_token}`} target="_blank" className="text-muted-foreground hover:text-primary transition-colors" title="Abrir link">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma proposta encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Adjustments Modal */}
      {showAdjustments && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4" onClick={() => setShowAdjustments(null)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Ajustes Solicitados</h2>
              <button onClick={() => setShowAdjustments(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            {adjustments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum ajuste solicitado</p>
            ) : (
              <div className="space-y-3">
                {adjustments.map((a) => (
                  <div key={a.id} className="glass rounded-xl p-4">
                    <p className="text-sm text-foreground">{a.message}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{a.created_by === 'client' ? 'Cliente' : 'Admin'}</span>
                      <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-4 sm:p-6 w-full max-w-4xl my-4 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Editar Proposta" : "Nova Proposta"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cliente *</label>
                  <select required value={form.lead_id} onChange={e => setForm({...form, lead_id: e.target.value})} className={inputClass}>
                    <option value="">Selecione...</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Título *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Visão Geral do Projeto</label>
                <textarea rows={3} value={form.project_overview} onChange={e => setForm({...form, project_overview: e.target.value})} className={inputClass + " resize-none"} placeholder="Descrição geral do projeto..." />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Objetivos do Sistema</label>
                <textarea rows={3} value={form.objectives} onChange={e => setForm({...form, objectives: e.target.value})} className={inputClass + " resize-none"} placeholder="Objetivos que o sistema deve atender..." />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Escopo Funcional</label>
                <textarea rows={3} value={form.functional_scope} onChange={e => setForm({...form, functional_scope: e.target.value})} className={inputClass + " resize-none"} placeholder="Funcionalidades detalhadas..." />
              </div>

              {/* Scope items */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Escopo Incluído (lista)</label>
                  {form.scope_included.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={item} onChange={e => updateScopeItem("scope_included", i, e.target.value)} className={inputClass} placeholder="Item..." />
                      <button type="button" onClick={() => removeScopeItem("scope_included", i)} className="text-muted-foreground hover:text-destructive shrink-0"><X size={16} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addScopeItem("scope_included")} className="text-xs text-primary hover:underline">+ Adicionar</button>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fora do Escopo (lista)</label>
                  {form.scope_excluded.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={item} onChange={e => updateScopeItem("scope_excluded", i, e.target.value)} className={inputClass} placeholder="Item..." />
                      <button type="button" onClick={() => removeScopeItem("scope_excluded", i)} className="text-muted-foreground hover:text-destructive shrink-0"><X size={16} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addScopeItem("scope_excluded")} className="text-xs text-primary hover:underline">+ Adicionar</button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tecnologias Utilizadas</label>
                <textarea rows={2} value={form.technologies} onChange={e => setForm({...form, technologies: e.target.value})} className={inputClass + " resize-none"} placeholder="React, TypeScript, Supabase..." />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Hospedagem e Infraestrutura</label>
                <textarea rows={2} value={form.hosting} onChange={e => setForm({...form, hosting: e.target.value})} className={inputClass + " resize-none"} placeholder="Detalhes de hospedagem..." />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Garantia</label>
                <textarea rows={2} value={form.guarantee} onChange={e => setForm({...form, guarantee: e.target.value})} className={inputClass + " resize-none"} placeholder="Termos de garantia pós-entrega..." />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Prazo</label>
                  <input value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={inputClass} placeholder="Ex: 30 dias" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor (R$)</label>
                  <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Validade (dias)</label>
                  <input type="number" value={form.validity_days} onChange={e => setForm({...form, validity_days: e.target.value})} className={inputClass} />
                </div>
              </div>

              {/* Payment Terms - text area only */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Formas de Pagamento</label>
                <textarea
                  rows={4}
                  value={form.payment_terms}
                  onChange={e => setForm({...form, payment_terms: e.target.value})}
                  className={inputClass + " resize-none"}
                  placeholder={"• 50% no início e 50% na entrega\n• Pagamento via PIX ou Cartão de Crédito\n• Parcelamento em até 3x no cartão"}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                  {editing ? "Salvar" : "Criar Proposta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProposals;
