import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/Logo.png";
import { CheckCircle, FileText, CreditCard, Pen, Copy, ExternalLink, Download, X } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PublicPage = () => {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"proposal" | "contract" | "payment">("proposal");
  const [showSignature, setShowSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"auto" | "draw">("auto");
  const [signerName, setSignerName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState("");
  const [contractPayments, setContractPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [paymentChosen, setPaymentChosen] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);
  const contractRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    const { data: proposals } = await supabase
      .from("proposals").select("*").eq("public_token", token).limit(1);

    if (proposals && proposals.length > 0) {
      setProposal(proposals[0]);
    }

    const { data: contracts } = await supabase
      .from("contracts").select("*").eq("public_token", token).limit(1);

    if (contracts && contracts.length > 0) {
      setContract(contracts[0]);
      setActiveTab("contract");
      // Fetch contract payment methods
      const { data: cpm } = await supabase.from("contract_payments")
        .select("*").eq("contract_id", contracts[0].id);
      setContractPayments(cpm || []);
      // Fetch signatures
      const { data: sigs } = await supabase.from("contract_signatures")
        .select("*").eq("contract_id", contracts[0].id);
      setSignatures(sigs || []);
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
      ctx.strokeStyle = "#1a1a2e";
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

  const generateAutoSignature = (): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 400, 150);
    ctx.font = "italic 42px 'Georgia', serif";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "center";
    ctx.fillText(signerName || "Assinatura", 200, 90);
    return canvas.toDataURL();
  };

  const handleSign = async () => {
    if (!contract) return;
    if (!paymentChosen && contractPayments.length > 0) {
      toast.error("Selecione uma forma de pagamento antes de assinar.");
      return;
    }

    let signatureData: string;

    if (signatureMode === "auto") {
      if (!signerName.trim()) {
        toast.error("Digite seu nome para gerar a assinatura");
        return;
      }
      signatureData = generateAutoSignature();
    } else {
      if (!canvasRef.current) return;
      signatureData = canvasRef.current.toDataURL();
    }

    // Save to contract_signatures
    await supabase.from("contract_signatures").insert({
      contract_id: contract.id,
      signer_name: signerName,
      signer_type: "client",
      signature_image: signatureData,
    } as any);

    // Update contract
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
    if (!proposal || !adjustMessage.trim()) return;
    await supabase.from("proposal_adjustments").insert({
      proposal_id: proposal.id,
      message: adjustMessage,
      created_by: "client",
    } as any);
    await supabase.from("proposals").update({ status: "ajustes" }).eq("id", proposal.id);
    setShowAdjustForm(false);
    setAdjustMessage("");
    fetchData();
    toast.success("Ajustes solicitados!");
  };

  const downloadPDF = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!proposal && !contract) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link não encontrado</h1>
          <p className="text-gray-500">Este link pode ter expirado ou não existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 print:py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mateus Dias</h1>
              <p className="text-xs text-gray-500">Engenheiro da Computação • Desenvolvimento de Sites e Sistemas Web</p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            {proposal && (
              <button onClick={() => downloadPDF(proposalRef, `proposta-${proposal.title}.pdf`)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
                <Download size={14} /> Baixar PDF
              </button>
            )}
            {contract && (
              <button onClick={() => downloadPDF(contractRef, `contrato-${contract.title}.pdf`)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
                <Download size={14} /> Baixar Contrato PDF
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 print:hidden">
          {proposal && (
            <button onClick={() => setActiveTab("proposal")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "proposal" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              <FileText size={16} /> Proposta Comercial
            </button>
          )}
          {contract && (
            <>
              <button onClick={() => setActiveTab("contract")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "contract" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                <Pen size={16} /> Contrato
              </button>
              <button onClick={() => setActiveTab("payment")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "payment" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                <CreditCard size={16} /> Pagamento
              </button>
            </>
          )}
        </div>

        {/* Proposal Tab */}
        {activeTab === "proposal" && proposal && (
          <div>
            <div ref={proposalRef} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <img src={logo} alt="Logo" className="w-10 h-10 rounded" />
                  <div>
                    <p className="text-sm font-medium opacity-90">Mateus Dias Tech</p>
                    <p className="text-xs opacity-75">Proposta Comercial</p>
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{proposal.title}</h2>
                <div className="flex gap-6 mt-3 text-sm opacity-90">
                  {proposal.deadline && <span>Prazo: {proposal.deadline}</span>}
                  {proposal.validity_days && <span>Validade: {proposal.validity_days} dias</span>}
                </div>
              </div>

              <div className="px-8 py-6 space-y-8">
                {(proposal.project_overview || proposal.description) && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">1. Visão Geral do Projeto</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{proposal.project_overview || proposal.description}</p>
                  </section>
                )}

                {proposal.objectives && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">2. Objetivos do Sistema</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{proposal.objectives}</p>
                  </section>
                )}

                {proposal.functional_scope && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">3. Escopo Funcional</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{proposal.functional_scope}</p>
                  </section>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {proposal.scope_included?.length > 0 && proposal.scope_included[0] && (
                    <section>
                      <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">✅ Escopo Incluído</h3>
                      <ul className="space-y-2">
                        {proposal.scope_included.filter((s: string) => s).map((item: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {proposal.scope_excluded?.length > 0 && proposal.scope_excluded[0] && (
                    <section>
                      <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">❌ Fora do Escopo</h3>
                      <ul className="space-y-2">
                        {proposal.scope_excluded.filter((s: string) => s).map((item: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-red-500 shrink-0">✕</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                {proposal.technologies && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">4. Tecnologias Utilizadas</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{proposal.technologies}</p>
                  </section>
                )}

                {proposal.hosting && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">5. Hospedagem e Infraestrutura</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{proposal.hosting}</p>
                  </section>
                )}

                {/* Investment */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Investimento</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {proposal.value && (
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Valor Total</p>
                        <p className="text-xl font-bold text-blue-600">R$ {Number(proposal.value).toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                    {proposal.deadline && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Prazo</p>
                        <p className="text-lg font-bold text-gray-900">{proposal.deadline}</p>
                      </div>
                    )}
                    {proposal.validity_days && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Validade</p>
                        <p className="text-lg font-bold text-gray-900">{proposal.validity_days} dias</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Payment Terms - text only */}
                {proposal.payment_terms && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Formas de Pagamento</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{proposal.payment_terms}</p>
                  </section>
                )}

                {proposal.guarantee && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Garantia</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{proposal.guarantee}</p>
                  </section>
                )}

                <div className="border-t border-gray-200 pt-6 text-center">
                  <p className="text-xs text-gray-400">Proposta gerada em {new Date(proposal.created_at).toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">© {new Date().getFullYear()} Mateus Dias Tech. Todos os direitos reservados.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {(proposal.status as string) !== "aprovada" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6 print:hidden">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">O que deseja fazer?</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleApprove}
                    className="px-6 py-3 rounded-lg bg-green-50 text-green-700 font-medium text-sm hover:bg-green-100 transition-colors flex-1 border border-green-200">
                    ✅ Aprovar Proposta
                  </button>
                  <button onClick={() => setShowAdjustForm(true)}
                    className="px-6 py-3 rounded-lg bg-amber-50 text-amber-700 font-medium text-sm hover:bg-amber-100 transition-colors flex-1 border border-amber-200">
                    ✏️ Solicitar Ajustes
                  </button>
                </div>

                {showAdjustForm && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={adjustMessage}
                      onChange={e => setAdjustMessage(e.target.value)}
                      placeholder="Descreva os ajustes desejados..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowAdjustForm(false)}
                        className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                      <button onClick={handleRequestChanges}
                        className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
                        Enviar Ajustes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(proposal.status as string) === "aprovada" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6 text-center print:hidden">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-semibold">Proposta Aprovada!</p>
              </div>
            )}
          </div>
        )}

        {/* Contract Tab */}
        {activeTab === "contract" && contract && (
          <div>
            <div ref={contractRef} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <img src={logo} alt="Logo" className="w-10 h-10 rounded" />
                  <div>
                    <p className="text-sm font-medium opacity-90">Mateus Dias Tech</p>
                    <p className="text-xs opacity-75">Contrato de Prestação de Serviços</p>
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{contract.title}</h2>
              </div>

              <div className="px-8 py-6 space-y-6">
                {/* Parties */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Partes</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">CONTRATANTE</p>
                      <p className="text-sm font-semibold text-gray-900">{contract.client_name || "—"}</p>
                      {contract.client_document && <p className="text-xs text-gray-500 mt-1">CPF/CNPJ: {contract.client_document}</p>}
                      {contract.client_address && <p className="text-xs text-gray-500">Endereço: {contract.client_address}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">CONTRATADA</p>
                      <p className="text-sm font-semibold text-gray-900">Mateus Dias</p>
                      <p className="text-xs text-gray-500 mt-1">Engenheiro da Computação</p>
                    </div>
                  </div>
                </section>

                {/* Scope */}
                {contract.scope && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Escopo do Projeto</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{contract.scope}</p>
                  </section>
                )}

                {/* Terms */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Termos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {contract.value && (
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500">Valor</p>
                        <p className="text-xl font-bold text-blue-600">R$ {Number(contract.value).toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                    {contract.deadline && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500">Prazo</p>
                        <p className="text-lg font-bold text-gray-900">{contract.deadline}</p>
                      </div>
                    )}
                    {contract.payment_terms && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500">Pagamento</p>
                        <p className="text-sm font-medium text-gray-900">{contract.payment_terms}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Signatures */}
                <section className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assinaturas</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium mb-2">CONTRATADA</p>
                      {contract.admin_signature_data ? (
                        <div>
                          {contract.admin_signature_data.startsWith("data:image") ? (
                            <img src={contract.admin_signature_data} alt="Assinatura Admin" className="h-16 object-contain" />
                          ) : (
                            <p className="text-sm text-green-600 font-medium">✓ {contract.admin_signature_data}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">{new Date(contract.admin_signature_date!).toLocaleString('pt-BR')}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Pendente</p>
                      )}
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium mb-2">CONTRATANTE</p>
                      {contract.client_signature_data ? (
                        <div>
                          <img src={contract.client_signature_data} alt="Assinatura Cliente" className="h-16 object-contain" />
                          <p className="text-xs text-gray-400 mt-2">{new Date(contract.client_signature_date!).toLocaleString('pt-BR')}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Pendente</p>
                      )}
                    </div>
                  </div>
                </section>

                <div className="border-t border-gray-200 pt-6 text-center">
                  <p className="text-xs text-gray-400">Contrato gerado em {new Date(contract.created_at).toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">© {new Date().getFullYear()} Mateus Dias Tech</p>
                </div>
              </div>
            </div>

            {/* Contract Actions - outside PDF area */}
            {!contract.client_signature_data && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6 print:hidden">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Para concluir o contrato:</h3>
                
                {/* Step 1: Choose payment */}
                {contractPayments.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 font-medium mb-3">1. Escolha a forma de pagamento</p>
                    <div className="space-y-2">
                      {contractPayments.map((pm, i) => (
                        <button key={i} onClick={() => { setSelectedPayment(pm); setPaymentChosen(true); }}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${selectedPayment?.id === pm.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {pm.type === "pix" ? "💰 PIX" : "💳 Cartão de Crédito"}
                            </span>
                            {pm.amount && <span className="text-sm font-bold text-blue-600">R$ {Number(pm.amount).toLocaleString('pt-BR')}</span>}
                          </div>
                          {pm.description && <p className="text-xs text-gray-500 mt-1">{pm.description}</p>}
                        </button>
                      ))}
                    </div>

                    {/* Show payment details */}
                    {selectedPayment && (
                      <div className="mt-4 border border-gray-200 rounded-lg p-4">
                        {selectedPayment.type === "pix" && (
                          <div className="text-center space-y-3">
                            {selectedPayment.qr_code_url && (
                              <img src={selectedPayment.qr_code_url} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-lg" />
                            )}
                            {selectedPayment.pix_key && (
                              <div className="flex items-center gap-2 max-w-sm mx-auto">
                                <input value={selectedPayment.pix_key} readOnly className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900" />
                                <button onClick={() => { navigator.clipboard.writeText(selectedPayment.pix_key); toast.success("Chave copiada!"); }}
                                  className="px-3 py-2 rounded-lg bg-blue-600 text-white"><Copy size={14} /></button>
                              </div>
                            )}
                          </div>
                        )}
                        {selectedPayment.type === "credit_card" && selectedPayment.payment_link && (
                          <div className="text-center">
                            <a href={selectedPayment.payment_link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700">
                              <ExternalLink size={16} /> Pagar com Cartão
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Sign */}
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-3">
                    {contractPayments.length > 0 ? "2. Assine o contrato" : "Assine o contrato"}
                  </p>
                  <button
                    onClick={() => setShowSignature(true)}
                    disabled={contractPayments.length > 0 && !paymentChosen}
                    className="w-full px-6 py-3 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    ✍️ Assinar Contrato Digitalmente
                  </button>
                </div>
              </div>
            )}

            {contract.client_signature_data && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6 text-center print:hidden">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-semibold">Contrato Assinado!</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && contract && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pagamento</h2>

            {contract.value && (
              <div className="bg-blue-50 rounded-lg p-6 text-center mb-6 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Valor Total</p>
                <p className="text-3xl font-bold text-blue-600">R$ {Number(contract.value).toLocaleString('pt-BR')}</p>
              </div>
            )}

            {contractPayments.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {contractPayments.map((pm, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      {pm.type === "pix" ? "💰 PIX" : "💳 Cartão de Crédito"}
                    </h3>
                    {pm.description && <p className="text-sm text-gray-500 mb-3">{pm.description}</p>}
                    {pm.amount && <p className="text-lg font-bold text-gray-900 mb-4">R$ {Number(pm.amount).toLocaleString('pt-BR')}</p>}

                    {pm.type === "pix" && (
                      <div className="space-y-3">
                        {pm.qr_code_url && (
                          <div className="flex justify-center">
                            <img src={pm.qr_code_url} alt="QR Code PIX" className="w-48 h-48 rounded-lg" />
                          </div>
                        )}
                        {pm.pix_key && (
                          <div className="flex items-center gap-2">
                            <input value={pm.pix_key} readOnly className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
                            <button onClick={() => { navigator.clipboard.writeText(pm.pix_key); toast.success("Chave copiada!"); }}
                              className="px-3 py-2 rounded-lg bg-blue-600 text-white"><Copy size={16} /></button>
                          </div>
                        )}
                      </div>
                    )}

                    {pm.type === "credit_card" && pm.payment_link && (
                      <a href={pm.payment_link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700">
                        <ExternalLink size={16} /> Pagar com Cartão
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Nenhuma forma de pagamento configurada.</p>
            )}
          </div>
        )}
      </div>

      {/* Signature Modal */}
      {showSignature && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowSignature(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Assinatura Digital</h3>
              <button onClick={() => setShowSignature(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">Seu nome completo</label>
              <input value={signerName} onChange={e => setSignerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Digite seu nome..." />
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setSignatureMode("auto")}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${signatureMode === "auto" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                Assinatura Automática
              </button>
              <button onClick={() => setSignatureMode("draw")}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${signatureMode === "draw" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                Desenhar Assinatura
              </button>
            </div>

            {signatureMode === "auto" && signerName && (
              <div className="border border-gray-200 rounded-lg p-6 mb-4 bg-gray-50 text-center">
                <p className="text-3xl italic text-gray-800" style={{ fontFamily: "Georgia, serif" }}>{signerName}</p>
              </div>
            )}

            {signatureMode === "draw" && (
              <div className="mb-4">
                <canvas
                  ref={canvasRef}
                  width={450}
                  height={200}
                  className="w-full border border-gray-200 rounded-lg bg-white cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                />
                <button onClick={clearCanvas} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Limpar</button>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowSignature(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
              <button onClick={handleSign} className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 ml-auto">
                Confirmar Assinatura
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Ao assinar, você concorda com os termos. Sua assinatura será registrada com data, hora e IP.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 mt-12 bg-white print:hidden">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Mateus Dias Tech. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
