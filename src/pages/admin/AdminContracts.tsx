import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Copy, ExternalLink, Trash2, X, Pen, Upload } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Contract = Database["public"]["Tables"]["contracts"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Proposal = Database["public"]["Tables"]["proposals"]["Row"];

interface ContractPayment {
  id?: string;
  type: string;
  description: string;
  amount: string;
  pix_key: string;
  qr_code_url: string;
  payment_link: string;
  _qrFile?: File | null;
}

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
  const [paymentMethods, setPaymentMethods] = useState<ContractPayment[]>([]);

  const defaultForm = {
    lead_id: "", proposal_id: "", title: "", scope: "", deadline: "", value: "",
    payment_terms: "", client_name: "", client_document: "", client_address: "", guarantee: "",
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

  const fetchPayments = async (contractId: string) => {
    const { data } = await supabase.from("contract_payments")
      .select("*").eq("contract_id", contractId).order("created_at");
    return (data || []).map((pm: any) => ({
      id: pm.id,
      type: pm.type,
      description: pm.description || "",
      amount: pm.amount?.toString() || "",
      pix_key: pm.pix_key || "",
      qr_code_url: pm.qr_code_url || "",
      payment_link: pm.payment_link || "",
    }));
  };

  const uploadQrCode = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `qrcodes/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
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
      guarantee: form.guarantee || null,
      user_id: user.id,
    };

    let contractId = editing?.id;

    if (editing) {
      await supabase.from("contracts").update(payload).eq("id", editing.id);
    } else {
      const { data } = await supabase.from("contracts").insert(payload).select().single();
      if (data) contractId = data.id;
    }

    // Save payment methods
    if (contractId) {
      await supabase.from("contract_payments").delete().eq("contract_id", contractId);
      
      for (const pm of paymentMethods) {
        let qrUrl = pm.qr_code_url;
        if (pm._qrFile) {
          try {
            qrUrl = await uploadQrCode(pm._qrFile);
          } catch (err) {
            toast.error("Erro ao enviar QR Code");
          }
        }
        await supabase.from("contract_payments").insert({
          contract_id: contractId,
          type: pm.type,
          description: pm.description || null,
          amount: pm.amount ? parseFloat(pm.amount) : null,
          pix_key: pm.pix_key || null,
          qr_code_url: qrUrl || null,
          payment_link: pm.payment_link || null,
        } as any);
      }
    }

    setShowForm(false);
    setEditing(null);
    setForm(defaultForm);
    setPaymentMethods([]);
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

  const editContract = async (c: Contract) => {
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
      guarantee: (c as any).guarantee || "",
    });
    const pms = await fetchPayments(c.id);
    setPaymentMethods(pms);
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
      guarantee: (p as any).guarantee || "Garantia de 30 (trinta) dias corridos após a entrega final do projeto para correção de eventuais erros técnicos relacionados exclusivamente ao escopo contratado.",
    });
    setEditing(null);
    setPaymentMethods([]);
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

  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, {
      type: "pix", description: "", amount: "", pix_key: "", qr_code_url: "", payment_link: "", _qrFile: null,
    }]);
  };

  const updatePaymentMethod = (index: number, field: string, value: any) => {
    const arr = [...paymentMethods];
    arr[index] = { ...arr[index], [field]: value };
    setPaymentMethods(arr);
  };

  const removePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contratos</h1>
          <p className="text-sm text-muted-foreground">{contracts.length} contratos</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-48" />
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); setPaymentMethods([]); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus size={16} /> <span className="hidden sm:inline">Novo Contrato</span><span className="sm:hidden">Novo</span>
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
      <div className="glass-card rounded-xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
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
        <div className="fixed inset-0 z-50 bg-background/80 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-4 sm:p-6 w-full max-w-3xl my-4 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Editar Contrato" : "Novo Contrato"}</h2>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Prazo</label>
                  <input value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor (R$)</label>
                  <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Condições de Pagamento</label>
                  <input value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})} className={inputClass} placeholder="Ex: 50% entrada" />
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Formas de Pagamento</h3>
                  <button type="button" onClick={addPaymentMethod} className="text-xs text-primary hover:underline">+ Adicionar forma</button>
                </div>
                {paymentMethods.map((pm, i) => (
                  <div key={i} className="glass rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <select value={pm.type} onChange={e => updatePaymentMethod(i, "type", e.target.value)} className={inputClass + " w-auto"}>
                        <option value="pix">PIX</option>
                        <option value="credit_card">Cartão de Crédito</option>
                      </select>
                      <button type="button" onClick={() => removePaymentMethod(i)} className="text-muted-foreground hover:text-destructive"><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input value={pm.description} onChange={e => updatePaymentMethod(i, "description", e.target.value)} className={inputClass} placeholder="Descrição" />
                      <input type="number" value={pm.amount} onChange={e => updatePaymentMethod(i, "amount", e.target.value)} className={inputClass} placeholder="Valor R$" />
                    </div>
                    {pm.type === "pix" && (
                      <div className="space-y-2">
                        <input value={pm.pix_key} onChange={e => updatePaymentMethod(i, "pix_key", e.target.value)} className={inputClass} placeholder="Chave PIX" />
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Upload QR Code PIX (PNG ou JPG)</label>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm cursor-pointer hover:bg-secondary/80">
                              <Upload size={14} />
                              {pm._qrFile ? pm._qrFile.name : "Selecionar arquivo"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0] || null;
                                  updatePaymentMethod(i, "_qrFile", file);
                                }}
                              />
                            </label>
                            {pm.qr_code_url && !pm._qrFile && (
                              <img src={pm.qr_code_url} alt="QR Code" className="w-10 h-10 rounded border border-border" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {pm.type === "credit_card" && (
                      <input value={pm.payment_link} onChange={e => updatePaymentMethod(i, "payment_link", e.target.value)} className={inputClass} placeholder="Link de pagamento (ex: https://www.mercadopago.com.br/...)" />
                    )}
                  </div>
                ))}
                {paymentMethods.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">Nenhuma forma de pagamento adicionada</p>
                )}
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
