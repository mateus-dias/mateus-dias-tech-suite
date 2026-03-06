import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/Logo.png";
import { CheckCircle, FileText, CreditCard, Pen, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Proposal = Database["public"]["Tables"]["proposals"]["Row"];
type Contract = Database["public"]["Tables"]["contracts"]["Row"];

const PublicPage = () => {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"proposal" | "contract" | "payment">("proposal");
  const [showSignature, setShowSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    // Try proposal
    const { data: proposals } = await supabase
      .from("proposals")
      .select("*")
      .eq("public_token", token)
      .limit(1);

    if (proposals && proposals.length > 0) {
      setProposal(proposals[0]);
    }

    // Try contract
    const { data: contracts } = await supabase
      .from("contracts")
      .select("*")
      .eq("public_token", token)
      .limit(1);

    if (contracts && contracts.length > 0) {
      setContract(contracts[0]);
      setActiveTab("contract");
    }

    setLoading(false);
  };

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const rect = canvasRef.current!.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const rect = canvasRef.current!.getBoundingClientRect();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "hsl(210 40% 95%)";
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleSign = async () => {
    if (!contract || !canvasRef.current) return;
    const signatureData = canvasRef.current.toDataURL();

    await supabase.from("contracts").update({
      client_signature_data: signatureData,
      client_signature_date: new Date().toISOString(),
      client_signature_ip: "captured-client-side",
      status: contract.admin_signature_data ? "assinado_ambos" : "assinado_cliente",
    }).eq("id", contract.id);

    setShowSignature(false);
    fetchData();
    toast.success("Contrato assinado com sucesso!");
  };

  const handleApprove = async () => {
    if (!proposal) return;
    await supabase.from("proposals").update({ status: "aprovada" }).eq("id", proposal.id);
    fetchData();
    toast.success("Proposta aprovada!");
  };

  const handleRequestChanges = async () => {
    if (!proposal) return;
    await supabase.from("proposals").update({
      status: "ajustes",
      client_comments: comment || "Ajustes solicitados pelo cliente",
    }).eq("id", proposal.id);
    fetchData();
    toast.success("Ajustes solicitados!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!proposal && !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Link não encontrado</h1>
          <p className="text-muted-foreground">Este link pode ter expirado ou não existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="container mx-auto px-6 flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Mateus Dias</h1>
            <p className="text-xs text-muted-foreground">Engenheiro da Computação • Especialista em Desenvolvimento de Sites e Sistemas Web</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {proposal && (
            <button onClick={() => setActiveTab("proposal")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${activeTab === "proposal" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
              <FileText size={16} /> Proposta
            </button>
          )}
          {contract && (
            <>
              <button onClick={() => setActiveTab("contract")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${activeTab === "contract" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
                <Pen size={16} /> Contrato
              </button>
              <button onClick={() => setActiveTab("payment")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${activeTab === "payment" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
                <CreditCard size={16} /> Pagamento
              </button>
            </>
          )}
        </div>

        {/* Proposal Tab */}
        {activeTab === "proposal" && proposal && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">{proposal.title}</h2>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  proposal.status === "aprovada" ? "bg-neon-green/20 text-neon-green" :
                  proposal.status === "ajustes" ? "bg-accent/20 text-accent" :
                  "bg-primary/20 text-primary"
                }`}>
                  {proposal.status === "aprovada" ? "Aprovada" : proposal.status === "ajustes" ? "Ajustes" : "Enviada"}
                </span>
              </div>

              {proposal.description && (
                <p className="text-sm text-muted-foreground mb-6">{proposal.description}</p>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {proposal.scope_included && proposal.scope_included.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">✅ Escopo Incluído</h3>
                    <ul className="space-y-2">
                      {proposal.scope_included.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle size={14} className="text-neon-green shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {proposal.scope_excluded && proposal.scope_excluded.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">❌ Fora do Escopo</h3>
                    <ul className="space-y-2">
                      {proposal.scope_excluded.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive shrink-0">✕</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {proposal.value && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-lg font-bold text-foreground">R$ {Number(proposal.value).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                {proposal.deadline && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Prazo</p>
                    <p className="text-lg font-bold text-foreground">{proposal.deadline}</p>
                  </div>
                )}
                {proposal.validity_days && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Validade</p>
                    <p className="text-lg font-bold text-foreground">{proposal.validity_days} dias</p>
                  </div>
                )}
                {proposal.payment_terms && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Pagamento</p>
                    <p className="text-sm font-medium text-foreground">{proposal.payment_terms}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {proposal.status !== "aprovada" && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">O que deseja fazer?</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleApprove}
                    className="px-6 py-3 rounded-xl bg-neon-green/20 text-neon-green font-medium text-sm hover:bg-neon-green/30 transition-colors flex-1">
                    ✅ Aprovar Proposta
                  </button>
                  <button onClick={() => setComment("")}
                    className="px-6 py-3 rounded-xl bg-accent/20 text-accent font-medium text-sm hover:bg-accent/30 transition-colors flex-1">
                    ✏️ Solicitar Ajustes
                  </button>
                </div>
                {comment !== undefined && proposal.status !== "aprovada" && (
                  <div className="mt-4">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Descreva os ajustes desejados..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                    <button onClick={handleRequestChanges}
                      className="mt-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium">
                      Enviar Ajustes
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contract Tab */}
        {activeTab === "contract" && contract && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{contract.title}</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {contract.client_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Contratante</p>
                    <p className="text-sm text-foreground">{contract.client_name}</p>
                    {contract.client_document && <p className="text-xs text-muted-foreground">{contract.client_document}</p>}
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Contratada</p>
                  <p className="text-sm text-foreground">Mateus Dias — Engenheiro da Computação</p>
                </div>
              </div>

              {contract.scope && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Escopo do Projeto</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{contract.scope}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {contract.value && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-lg font-bold text-foreground">R$ {Number(contract.value).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                {contract.deadline && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Prazo</p>
                    <p className="text-lg font-bold text-foreground">{contract.deadline}</p>
                  </div>
                )}
                {contract.payment_terms && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Pagamento</p>
                    <p className="text-sm font-medium text-foreground">{contract.payment_terms}</p>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Assinaturas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-2">Contratada (Admin)</p>
                    {contract.admin_signature_data ? (
                      <div>
                        <p className="text-sm text-neon-green">✓ Assinado</p>
                        <p className="text-xs text-muted-foreground">{new Date(contract.admin_signature_date!).toLocaleString('pt-BR')}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Pendente</p>
                    )}
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-2">Contratante (Cliente)</p>
                    {contract.client_signature_data ? (
                      <div>
                        <p className="text-sm text-neon-green">✓ Assinado</p>
                        <p className="text-xs text-muted-foreground">{new Date(contract.client_signature_date!).toLocaleString('pt-BR')}</p>
                      </div>
                    ) : (
                      <button onClick={() => setShowSignature(true)}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 mt-1">
                        Assinar Contrato
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Modal */}
            {showSignature && (
              <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4" onClick={() => setShowSignature(false)}>
                <div className="glass-card rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-foreground mb-4">Assinatura Digital</h3>
                  <p className="text-xs text-muted-foreground mb-4">Desenhe sua assinatura no campo abaixo</p>
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={200}
                    className="w-full border border-border rounded-xl bg-secondary cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                  />
                  <div className="flex gap-3 mt-4">
                    <button onClick={clearCanvas} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground">Limpar</button>
                    <button onClick={() => setShowSignature(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
                    <button onClick={handleSign} className="px-6 py-2 rounded-xl bg-neon-green/20 text-neon-green text-sm font-medium hover:bg-neon-green/30 ml-auto">
                      Confirmar Assinatura
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Ao assinar, você concorda com os termos deste contrato. Sua assinatura será registrada com data, hora e IP.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && contract && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Pagamento</h2>

              {contract.value && (
                <div className="glass rounded-xl p-6 text-center mb-6">
                  <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                  <p className="text-3xl font-bold text-foreground">R$ {Number(contract.value).toLocaleString('pt-BR')}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* PIX */}
                {(contract.pix_key || contract.pix_qr_code_url) && (
                  <div className="glass rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">💰 PIX</h3>
                    {contract.pix_value && (
                      <p className="text-lg font-bold text-foreground mb-4">R$ {Number(contract.pix_value).toLocaleString('pt-BR')}</p>
                    )}
                    {contract.pix_qr_code_url && (
                      <div className="mb-4 flex justify-center">
                        <img src={contract.pix_qr_code_url} alt="QR Code PIX" className="w-48 h-48 rounded-xl" />
                      </div>
                    )}
                    {contract.pix_key && (
                      <div className="flex items-center gap-2">
                        <input value={contract.pix_key} readOnly className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" />
                        <button onClick={() => { navigator.clipboard.writeText(contract.pix_key!); toast.success("Chave copiada!"); }}
                          className="px-3 py-2 rounded-xl bg-primary text-primary-foreground">
                          <Copy size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cartão */}
                {contract.mercadopago_link && (
                  <div className="glass rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">💳 Cartão de Crédito</h3>
                    <p className="text-sm text-muted-foreground mb-4">Pague com cartão de crédito pelo Mercado Pago</p>
                    <a href={contract.mercadopago_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all">
                      <ExternalLink size={16} /> Pagar com Cartão
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Mateus Dias Tech. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
