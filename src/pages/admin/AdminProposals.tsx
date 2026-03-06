import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Copy, ExternalLink, Eye, Trash2, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Proposal = Database["public"]["Tables"]["proposals"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];

const statusLabels: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  enviada: { label: "Enviada", color: "bg-primary/20 text-primary" },
  aprovada: { label: "Aprovada", color: "bg-neon-green/20 text-neon-green" },
  ajustes: { label: "Ajustes", color: "bg-accent/20 text-accent" },
  recusada: { label: "Recusada", color: "bg-destructive/20 text-destructive" },
};

const inputClass = "w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

const AdminProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);

  const defaultForm = {
    lead_id: "",
    title: "",
    description: "",
    scope_included: [""],
    scope_excluded: [""],
    deadline: "",
    value: "",
    payment_terms: "",
    validity_days: "15",
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: p }, { data: l }] = await Promise.all([
      supabase.from("proposals").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("name"),
    ]);
    if (p) setProposals(p);
    if (l) setLeads(l);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      lead_id: form.lead_id,
      title: form.title,
      description: form.description,
      scope_included: form.scope_included.filter(s => s.trim()),
      scope_excluded: form.scope_excluded.filter(s => s.trim()),
      deadline: form.deadline || null,
      value: form.value ? parseFloat(form.value) : null,
      payment_terms: form.payment_terms || null,
      validity_days: parseInt(form.validity_days) || 15,
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

  const editProposal = (p: Proposal) => {
    setEditing(p);
    setForm({
      lead_id: p.lead_id,
      title: p.title,
      description: p.description || "",
      scope_included: p.scope_included?.length ? p.scope_included : [""],
      scope_excluded: p.scope_excluded?.length ? p.scope_excluded : [""],
      deadline: p.deadline || "",
      value: p.value?.toString() || "",
      payment_terms: p.payment_terms || "",
      validity_days: p.validity_days?.toString() || "15",
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
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Propostas</h1>
          <p className="text-sm text-muted-foreground">{proposals.length} propostas</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48" />
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Nova Proposta
          </button>
        </div>
      </div>

      {/* List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
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

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Editar Proposta" : "Nova Proposta"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={inputClass + " resize-none"} />
              </div>

              {/* Scope */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Escopo Incluído</label>
                  {form.scope_included.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={item} onChange={e => updateScopeItem("scope_included", i, e.target.value)} className={inputClass} placeholder="Item do escopo..." />
                      <button type="button" onClick={() => removeScopeItem("scope_included", i)} className="text-muted-foreground hover:text-destructive shrink-0"><X size={16} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addScopeItem("scope_included")} className="text-xs text-primary hover:underline">+ Adicionar item</button>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fora do Escopo</label>
                  {form.scope_excluded.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={item} onChange={e => updateScopeItem("scope_excluded", i, e.target.value)} className={inputClass} placeholder="Item excluído..." />
                      <button type="button" onClick={() => removeScopeItem("scope_excluded", i)} className="text-muted-foreground hover:text-destructive shrink-0"><X size={16} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addScopeItem("scope_excluded")} className="text-xs text-primary hover:underline">+ Adicionar item</button>
                </div>
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
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Pagamento</label>
                  <input value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})} className={inputClass} placeholder="Ex: 50% entrada" />
                </div>
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
