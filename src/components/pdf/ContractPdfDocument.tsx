import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontSize: 11,
    color: "#1f2937",
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 28,
    height: 28,
    objectFit: "contain",
  },
  brandTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  brandSubtitle: {
    fontSize: 10,
    color: "#6b7280",
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  section: {
    marginTop: 14,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#111827",
    textTransform: "uppercase",
  },
  paragraph: {
    marginBottom: 6,
    textAlign: "justify",
  },
  noteBox: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 6,
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
  },
  label: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  clauseTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  signatureSection: {
    marginTop: 18,
  },
  signatureRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 12,
    minHeight: 120,
    justifyContent: "space-between",
  },
  signatureRole: {
    textAlign: "center",
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  signatureImage: {
    width: "100%",
    height: 46,
    objectFit: "contain",
    marginBottom: 8,
  },
  signatureName: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  signatureMeta: {
    textAlign: "center",
    fontSize: 9,
    color: "#6b7280",
    marginTop: 3,
  },
  footer: {
    marginTop: 18,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    textAlign: "center",
    fontSize: 9,
    color: "#6b7280",
  },
});

type ContractPdfProps = {
  contract: any;
  proposal?: any;
  clientName?: string;
  logoUrl?: string;
  adminSignatureUrl?: string | null;
  clientSignatureUrl?: string | null;
};

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const ContractPdfDocument = ({
  contract,
  proposal,
  clientName,
  logoUrl,
  adminSignatureUrl,
  clientSignatureUrl,
}: ContractPdfProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <View>
              <Text style={styles.brandTitle}>Mateus Dias Tech</Text>
              <Text style={styles.brandSubtitle}>Contrato de Prestação de Serviços</Text>
            </View>
          </View>
          <Text style={styles.title}>{contract?.title || "Contrato"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partes</Text>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.label}>Contratante</Text>
              <Text style={styles.value}>{contract?.client_name || clientName || "—"}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Contratada</Text>
              <Text style={styles.value}>Mateus Dias</Text>
              <Text>Engenheiro da Computação</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objeto do Contrato</Text>
          <Text style={styles.paragraph}>
            {proposal?.project_overview ||
              "Prestação de serviços de desenvolvimento de software conforme escopo técnico e comercial aprovado."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escopo do Projeto</Text>
          <Text style={styles.paragraph}>{contract?.scope || "—"}</Text>
        </View>

        <View style={styles.noteBox}>
          <Text>
            A proposta comercial aprovada integra este contrato como referência técnica e comercial,
            detalhando o escopo funcional completo, tecnologias utilizadas, objetivos do projeto e demais especificações técnicas.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prazo de Execução</Text>
          <Text style={styles.paragraph}>
            O prazo estimado para execução do projeto é de {contract?.deadline || "—"},
            contados a partir da assinatura deste contrato e do recebimento do pagamento inicial acordado.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor do Projeto</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Valor total do investimento</Text>
            <Text style={{ ...styles.value, fontSize: 18 }}>
              {formatCurrency(contract?.value)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condições de Pagamento</Text>
          <Text style={styles.paragraph}>{contract?.payment_terms || "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Garantia</Text>
          <Text style={styles.paragraph}>
            Garantia de 30 dias para correções técnicas relacionadas ao escopo entregue.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cláusulas Contratuais</Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 1 – OBJETO DO CONTRATO</Text>
          <Text style={styles.paragraph}>
            O presente contrato tem por objeto a prestação de serviços de desenvolvimento de sistema/software conforme descrito no escopo do projeto e na proposta comercial aprovada.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 2 – ESCOPO DO PROJETO</Text>
          <Text style={styles.paragraph}>
            O escopo do projeto compreende exclusivamente as funcionalidades descritas na proposta aprovada. Qualquer funcionalidade adicional será considerada fora do escopo e poderá ser objeto de orçamento complementar.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 3 – ITENS FORA DO ESCOPO</Text>
          <Text style={styles.paragraph}>
            Itens não descritos no escopo do projeto não fazem parte da entrega inicial, incluindo integrações externas, customizações adicionais, novas funcionalidades ou alterações estruturais no sistema.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 4 – PRAZO DE EXECUÇÃO</Text>
          <Text style={styles.paragraph}>
            O prazo estimado para execução do projeto é aquele definido neste contrato, podendo sofrer ajustes em caso de alterações de escopo, atrasos na entrega de materiais pelo contratante ou fatores externos.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 5 – RESPONSABILIDADES DO CONTRATANTE</Text>
          <Text style={styles.paragraph}>
            O contratante compromete-se a fornecer todas as informações, conteúdos, acessos e materiais necessários para a execução do projeto dentro dos prazos solicitados.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 6 – FORMAS DE PAGAMENTO</Text>
          <Text style={styles.paragraph}>
            As condições de pagamento seguem as regras estabelecidas neste contrato e devem ser cumpridas conforme acordado entre as partes.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 7 – INADIMPLÊNCIA</Text>
          <Text style={styles.paragraph}>
            Em caso de atraso superior a 5 dias corridos no pagamento, a contratada poderá suspender temporariamente a execução do projeto até a regularização financeira.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 8 – ALTERAÇÕES DE ESCOPO</Text>
          <Text style={styles.paragraph}>
            Alterações solicitadas após aprovação da proposta poderão gerar novo orçamento e ajuste no prazo de entrega.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 9 – GARANTIA</Text>
          <Text style={styles.paragraph}>
            A contratada oferece garantia de 30 dias para correção de eventuais erros técnicos relacionados exclusivamente ao escopo entregue.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 10 – PROPRIEDADE INTELECTUAL</Text>
          <Text style={styles.paragraph}>
            Após a quitação integral do projeto, o contratante terá direito de uso do sistema desenvolvido conforme acordado. A propriedade intelectual das tecnologias utilizadas permanece com a contratada.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 11 – HOSPEDAGEM E SERVIÇOS DE TERCEIROS</Text>
          <Text style={styles.paragraph}>
            Caso o sistema utilize serviços de terceiros como hospedagem, APIs ou plataformas externas, eventuais indisponibilidades desses serviços não serão de responsabilidade da contratada.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 12 – CONFIDENCIALIDADE</Text>
          <Text style={styles.paragraph}>
            Ambas as partes comprometem-se a manter sigilo sobre informações confidenciais obtidas durante a execução do projeto.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 13 – ACEITE DO PROJETO</Text>
          <Text style={styles.paragraph}>
            Após a entrega do projeto, o contratante terá prazo de 5 dias úteis para validação. Na ausência de manifestação dentro desse prazo, o projeto será considerado aceito.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 14 – RESCISÃO</Text>
          <Text style={styles.paragraph}>
            O contrato poderá ser rescindido por qualquer das partes mediante comunicação prévia de 10 dias.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 15 – CANCELAMENTO E VALORES PAGOS</Text>
          <Text style={styles.paragraph}>
            Em caso de cancelamento após o início do projeto, os valores já pagos não serão devolvidos, considerando os serviços já executados.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 16 – MULTA CONTRATUAL</Text>
          <Text style={styles.paragraph}>
            Caso o contratante solicite cancelamento após o início do projeto, poderá ser aplicada multa compensatória de 30% sobre o valor restante do contrato.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 17 – CHARGEBACK</Text>
          <Text style={styles.paragraph}>
            Em caso de contestação de pagamento após o início da execução do projeto, a contratada poderá adotar medidas administrativas e jurídicas para cobrança do valor devido.
          </Text>

          <Text style={styles.clauseTitle}>CLÁUSULA 18 – FORO</Text>
          <Text style={styles.paragraph}>
            Fica eleito o foro da comarca de Jaboticabal/SP para dirimir quaisquer dúvidas ou conflitos oriundos deste contrato.
          </Text>
        </View>

        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.sectionTitle}>Assinaturas</Text>
          <Text style={styles.paragraph}>
            As partes declaram que leram e concordam com todos os termos e condições deste contrato.
          </Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureRole}>Contratada</Text>
              {adminSignatureUrl ? <Image src={adminSignatureUrl} style={styles.signatureImage} /> : null}
              <View>
                <Text style={styles.signatureName}>Mateus Dias</Text>
                <Text style={styles.signatureMeta}>Engenheiro da Computação</Text>
                <Text style={styles.signatureMeta}>
                  {contract?.admin_signature_date || ""}
                </Text>
              </View>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureRole}>Contratante</Text>
              {clientSignatureUrl ? <Image src={clientSignatureUrl} style={styles.signatureImage} /> : null}
              <View>
                <Text style={styles.signatureName}>{contract?.client_name || clientName || "—"}</Text>
                <Text style={styles.signatureMeta}>
                  {contract?.client_signature_date || ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Contrato gerado digitalmente • Este documento tem validade jurídica conforme Lei nº 14.063/2020
        </Text>
      </Page>
    </Document>
  );
};

export default ContractPdfDocument;