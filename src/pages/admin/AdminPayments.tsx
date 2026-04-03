import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Trash2, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Payment = Database["public"]["Tables"]["payments"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Contract = Database["public"]["Tables"]["contracts"]["Row"];

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-primary/20 text-primary" },
  parcial: { label: "Parcial", color: "bg-accent/20 text-accent" },
  pago: { label: "Pago", color: "bg-neon-green/20 text-neon-green" },
  cancelado: { label: "Cancelado", color: "bg-destructive/20 text-destructive" },
};

const methodLabels: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  boleto: "Boleto",
  transferencia: "Transferência",
};

const inputClass = "w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  const defaultForm = {
    lead_id: "", contract_id: "", description: "", value: "", method: "pix",
    pix_key: "", pix_qr_code_url: "", mercadopago_link: "",
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: p }, { data: l }, { data: c }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("name"),
      supabase.from("contracts").select("*").order("created_at", { ascending: false }),
    ]);
    if (p) setPayments(p);
    if (l) setLeads(l);
    if (c) setContracts(c);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      lead_id: form.lead_id,
      contract_id: form.contract_id || null,
      description: form.description || null,
      value: parseFloat(form.value),
      method: form.method as any,
      pix_key: form.pix_key || null,
      pix_qr_code_url: form.pix_qr_code_url || null,
      mercadopago_link: form.mercadopago_link || null,
      user_id: user.id,
    };

    if (editing) {
      await supabase.from("payments").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("payments").insert(payload);
    }

    setShowForm(false);
    setEditing(null);
    setForm(defaultForm);
    fetchData();
    toast.success(editing ? "Pagamento atualizado!" : "Pagamento registrado!");
  };

  const handleStatusChange = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "pago") update.paid_at = new Date().toISOString();
    await supabase.from("payments").update(update).eq("id", id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await supabase.from("payments").delete().eq("id", id);
    fetchData();
    toast.success("Pagamento excluído!");
  };

  const getLeadName = (id: string) => leads.find(l => l.id === id)?.name || "—";

  const totalPago = payments.filter(p => p.status === "pago").reduce((s, p) => s + Number(p.value), 0);
  const totalPendente = payments.filter(p => p.status === "pendente").reduce((s, p) => s + Number(p.value), 0);

  const filtered = payments.filter(p =>
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    getLeadName(p.lead_id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pagamentos</h1>
          <p className="text-sm text-muted-foreground">{payments.length} pagamentos registrados</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-48" />
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus size={16} /> <span className="hidden sm:inline">Novo Pagamento</span><span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Recebido</p>
          <p className="text-xl font-bold text-neon-green">R$ {totalPago.toLocaleString('pt-BR')}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Pendente</p>
          <p className="text-xl font-bold text-primary">R$ {totalPendente.toLocaleString('pt-BR')}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Geral</p>
          <p className="text-xl font-bold text-foreground">R$ {(totalPago + totalPendente).toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* List */}
      <div className="glass-card rounded-xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Descrição</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Cliente</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Valor</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Método</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground">{p.description || "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{getLeadName(p.lead_id)}</td>
                <td className="px-4 py-3 text-sm text-foreground font-medium">R$ {Number(p.value).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{methodLabels[p.method || ""] || "—"}</td>
                <td className="px-4 py-3">
                  <select value={p.status || "pendente"} onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusLabels[p.status || "pendente"]?.color || ""}`}>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum pagamento encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-4 sm:p-6 w-full max-w-2xl my-4 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Editar Pagamento" : "Novo Pagamento"}</h2>
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
                  <label className="text-xs text-muted-foreground mb-1 block">Contrato</label>
                  <select value={form.contract_id} onChange={e => setForm({...form, contract_id: e.target.value})} className={inputClass}>
                    <option value="">Nenhum</option>
                    {contracts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor (R$) *</label>
                  <input type="number" required value={form.value} onChange={e => setForm({...form, value: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Método</label>
                  <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className={inputClass}>
                    <option value="pix">PIX</option>
                    <option value="cartao">Cartão</option>
                    <option value="boleto">Boleto</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={inputClass} placeholder="Ex: Parcela 1/3" />
              </div>

              {form.method === "pix" && (
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Dados PIX</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Chave PIX</label>
                      <input value={form.pix_key} onChange={e => setForm({...form, pix_key: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">URL QR Code</label>
                      <input value={form.pix_qr_code_url} onChange={e => setForm({...form, pix_qr_code_url: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              {form.method === "cartao" && (
                <div className="border border-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Mercado Pago</h3>
                  <label className="text-xs text-muted-foreground mb-1 block">Link de pagamento</label>
                  <input value={form.mercadopago_link} onChange={e => setForm({...form, mercadopago_link: e.target.value})} className={inputClass} placeholder="https://mpago.la/..." />
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                  {editing ? "Salvar" : "Registrar Pagamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
