import { motion } from "framer-motion";
import { MessageCircle, Lightbulb, FileText, PenTool, Code, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Alinhamento Inicial",
    description: "Conversa para entender sua necessidade real e definir objetivos claros do projeto.",
  },
  {
    icon: Lightbulb,
    title: "Análise e Planejamento",
    description: "Estudo da melhor abordagem técnica e criação do escopo detalhado da solução.",
  },
  {
    icon: Code,
    title: "Demonstração MVP",
    description: "Desenvolvimento de um protótipo funcional para validar a solução antes de avançar.",
  },
  {
    icon: FileText,
    title: "Proposta e Contrato",
    description: "Proposta clara com escopo, prazo e valor definidos. Contrato com assinatura digital.",
  },
  {
    icon: PenTool,
    title: "Desenvolvimento",
    description: "Construção do projeto com acompanhamento constante e entregas parciais.",
  },
  {
    icon: Rocket,
    title: "Entrega Final",
    description: "Deploy, treinamento de uso e suporte pós-entrega para garantir o sucesso.",
  },
];

const Process = () => {
  return (
    <section id="processo" className="py-24 relative">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-neon-cyan uppercase tracking-widest">Processo</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Como{" "}
            <span className="gradient-text-accent">funciona</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Processo organizado e transparente do início ao fim, garantindo segurança para ambas as partes.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Icon size={22} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-primary/30 to-transparent mt-2" />
                  )}
                </div>
                <div className="glass-card rounded-xl p-6 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-primary">0{i + 1}</span>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Process;
