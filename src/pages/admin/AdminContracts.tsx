import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Copy, ExternalLink, Trash2, X, Pen } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Contract = Database["public"]["Tables"]["contracts"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Proposal = Database["public"]["Tables"]["proposals"]["Row"];

const statusLabels: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  enviado: { label: "Enviado", color: "bg-primary/20 text-primary" },
  assinado_cliente: { label: "Assinado Cliente", color: "bg-accent/20 text-accent" },
  assinado_ambos: { label: "Assinado Ambos", color: "bg-neon-green/20 text-neon-green" },
  cancelado: { label: "Cancelado", color: "bg-destructive/20 text-destructive" },
};

const inputClass = "w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

const AdminContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signingContract, setSigningContract] = useState<Contract | null>(null);

  const defaultForm = {
    lead_id: "", proposal_id: "", title: "", scope: "", deadline: "", value: "",
    payment_terms: "", client_name: "", client_document: "", client_address: "",
    pix_key: "", pix_qr_code_url: "", pix_value: "", mercadopago_link: "",
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: c }, { data: l }, { data: p }] = await Promise.all([
      supabase.from("contracts").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("name"),
      supabase.from("proposals").select("*").order("created_at", { ascending: false }),
    ]);
    if (c) setContracts(c);
    if (l) setLeads(l);
    if (p) setProposals(p);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      lead_id: form.lead_id,
      proposal_id: form.proposal_id || null,
      title: form.title,
      scope: form.scope || null,
      deadline: form.deadline || null,
      value: form.value ? parseFloat(form.value) : null,
      payment_terms: form.payment_terms || null,
      client_name: form.client_name || null,
      client_document: form.client_document || null,
      client_address: form.client_address || null,
      pix_key: form.pix_key || null,
      pix_qr_code_url: form.pix_qr_code_url || null,
      pix_value: form.pix_value ? parseFloat(form.pix_value) : null,
      mercadopago_link: form.mercadopago_link || null,
      user_id: user.id,
    };

    if (editing) {
      await supabase.from("contracts").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("contracts").insert(payload);
    }

    setShowForm(false);
    setEditing(null);
    setForm(defaultForm);
    fetchData();
    toast.success(editing ? "Contrato atualizado!" : "Contrato criado!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este contrato?")) return;
    await supabase.from("contracts").delete().eq("id", id);
    fetchData();
    toast.success("Contrato excluído!");
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("contracts").update({ status: status as any }).eq("id", id);
    fetchData();
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${token}`);
    toast.success("Link copiado!");
  };

  const editContract = (c: Contract) => {
    setEditing(c);
    setForm({
      lead_id: c.lead_id,
      proposal_id: c.proposal_id || "",
      title: c.title,
      scope: c.scope || "",
      deadline: c.deadline || "",
      value: c.value?.toString() || "",
      payment_terms: c.payment_terms || "",
      client_name: c.client_name || "",
      client_document: c.client_document || "",
      client_address: c.client_address || "",
      pix_key: c.pix_key || "",
      pix_qr_code_url: c.pix_qr_code_url || "",
      pix_value: c.pix_value?.toString() || "",
      mercadopago_link: c.mercadopago_link || "",
    });
    setShowForm(true);
  };

  const fromProposal = (p: Proposal) => {
    const lead = leads.find(l => l.id === p.lead_id);
    setForm({
      lead_id: p.lead_id,
      proposal_id: p.id,
      title: `Contrato - ${p.title}`,
      scope: [...(p.scope_included || [])].join("\n"),
      deadline: p.deadline || "",
      value: p.value?.toString() || "",
      payment_terms: p.payment_terms || "",
      client_name: lead?.name || "",
      client_document: "",
      client_address: "",
      pix_key: "", pix_qr_code_url: "", pix_value: "", mercadopago_link: "",
    });
    setEditing(null);
    setShowForm(true);
  };

  const handleAdminSign = async (contract: Contract) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("contracts").update({
      admin_signature_data: `Assinado digitalmente por ${user.email}`,
      admin_signature_date: new Date().toISOString(),
      status: contract.client_signature_data ? "assinado_ambos" : contract.status,
    }).eq("id", contract.id);
    fetchData();
    toast.success("Contrato assinado pelo admin!");
  };

  const getLeadName = (id: string) => leads.find(l => l.id === id)?.name || "—";

  const filtered = contracts.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    getLeadName(c.lead_id).toLowerCase().includes(search.toLowerCase())
  );

  const approvedProposals = proposals.filter(p => p.status === "aprovada");

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contratos</h1>
          <p className="text-sm text-muted-foreground">{contracts.length} contratos</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48" />
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Contrato
          </button>
        </div>
      </div>

      {/* Create from approved proposal */}
      {approvedProposals.length > 0 && (
        <div className="glass-card rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-2">Propostas aprovadas — Gerar contrato:</p>
          <div className="flex flex-wrap gap-2">
            {approvedProposals.map(p => (
              <button key={p.id} onClick={() => fromProposal(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-neon-green/10 text-neon-green hover:bg-neon-green/20 transition-colors">
                {p.title} — {getLeadName(p.lead_id)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Título</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Cliente</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Valor</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Assinaturas</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground font-medium cursor-pointer" onClick={() => editContract(c)}>{c.title}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{getLeadName(c.lead_id)}</td>
                <td className="px-4 py-3 text-sm text-foreground">{c.value ? `R$ ${Number(c.value).toLocaleString('pt-BR')}` : "—"}</td>
                <td className="px-4 py-3">
                  <select value={c.status || "rascunho"} onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusLabels[c.status || "rascunho"]?.color || ""}`}>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <div className="flex gap-1">
                    <span className={c.client_signature_data ? "text-neon-green" : ""}>Cliente {c.client_signature_data ? "✓" : "—"}</span>
                    <span>|</span>
                    <span className={c.admin_signature_data ? "text-neon-green" : ""}>Admin {c.admin_signature_data ? "✓" : "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!c.admin_signature_data && (
                      <button onClick={() => handleAdminSign(c)} className="text-muted-foreground hover:text-neon-green transition-colors" title="Assinar como admin">
                        <Pen size={14} />
                      </button>
                    )}
                    {c.public_token && (
                      <button onClick={() => copyLink(c.public_token!)} className="text-muted-foreground hover:text-primary transition-colors" title="Copiar link">
                        <Copy size={14} />
                      </button>
                    )}
                    {c.public_token && (
                      <a href={`/p/${c.public_token}`} target="_blank" className="text-muted-foreground hover:text-primary transition-colors" title="Abrir link">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum contrato encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Editar Contrato" : "Novo Contrato"}</h2>
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome do Cliente</label>
                  <input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CPF/CNPJ</label>
                  <input value={form.client_document} onChange={e => setForm({...form, client_document: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Endereço</label>
                  <input value={form.client_address} onChange={e => setForm({...form, client_address: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Escopo</label>
                <textarea rows={4} value={form.scope} onChange={e => setForm({...form, scope: e.target.value})} className={inputClass + " resize-none"} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Prazo</label>
                  <input value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor (R$)</label>
                  <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Pagamento</label>
                  <input value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})} className={inputClass} />
                </div>
              </div>

              {/* Payment config */}
              <div className="border border-border rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Configuração de Pagamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Chave PIX</label>
                    <input value={form.pix_key} onChange={e => setForm({...form, pix_key: e.target.value})} className={inputClass} placeholder="Email, CPF ou chave aleatória" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Valor PIX (R$)</label>
                    <input type="number" value={form.pix_value} onChange={e => setForm({...form, pix_value: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">URL QR Code PIX</label>
                    <input value={form.pix_qr_code_url} onChange={e => setForm({...form, pix_qr_code_url: e.target.value})} className={inputClass} placeholder="URL da imagem do QR Code" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Link Mercado Pago</label>
                    <input value={form.mercadopago_link} onChange={e => setForm({...form, mercadopago_link: e.target.value})} className={inputClass} placeholder="https://mpago.la/..." />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                  {editing ? "Salvar" : "Criar Contrato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContracts;
