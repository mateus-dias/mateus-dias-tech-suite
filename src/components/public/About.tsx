import { motion } from "framer-motion";
import { GraduationCap, Monitor, Settings, Globe } from "lucide-react";
import mateus from "@/assets/Mateus.png";

const highlights = [
  { icon: GraduationCap, text: "Engenheiro da Computação" },
  { icon: Monitor, text: "Especialista em sistemas web e sites profissionais" },
  { icon: Settings, text: "Experiência em infraestrutura de TI e soluções corporativas" },
  { icon: Globe, text: "Atendimentos para todo o Brasil" },
];

const About = () => {
  return (
    <section id="sobre" className="py-24 relative">
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Sobre</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Quem está por trás dos{" "}
            <span className="gradient-text">projetos</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-72 h-80 md:w-80 md:h-96 rounded-2xl overflow-hidden gradient-border glass-card">
                <img
                  src={mateus}
                  alt="Mateus Dias"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 glass-card rounded-xl p-4 glow-blue">
                <p className="text-sm font-bold text-foreground">Mateus Dias</p>
                <p className="text-xs text-primary">Eng. da Computação</p>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Meu nome é <strong className="text-foreground">Mateus Dias</strong>, sou Engenheiro da Computação e especialista em desenvolvimento de sites profissionais e sistemas web sob medida.
              </p>
              <p>
                Atuo na área de tecnologia trabalhando com infraestrutura de TI, Microsoft 365, servidores de e-mail e desenvolvimento de soluções digitais, ajudando empresas e profissionais a organizarem seus processos e levarem seus negócios para o ambiente digital.
              </p>
              <p>
                Meu foco é sempre entregar soluções simples, eficientes e bem estruturadas, com design moderno e tecnologia confiável. Antes de iniciar qualquer projeto, procuro entender a real necessidade do cliente para desenvolver uma solução que realmente resolva o problema e agregue valor ao negócio.
              </p>
              <p>
                Trabalho com um processo organizado que inclui alinhamento inicial, demonstração de MVP, proposta clara, contrato e desenvolvimento estruturado, garantindo transparência e segurança para ambas as partes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {highlights.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 glass-card rounded-xl p-4">
                    <Icon size={20} className="text-primary shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <a
              href="https://wa.me/5516997754245"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 mt-8 rounded-xl font-semibold text-primary-foreground bg-primary glow-blue hover:opacity-90 transition-all"
            >
              Vamos conversar sobre seu projeto
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
