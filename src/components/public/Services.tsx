import { motion } from "framer-motion";
import { Globe, Layout, Settings, Cpu, Database, Smartphone } from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Sites Institucionais",
    description: "Sites profissionais e responsivos que transmitem credibilidade e geram resultados para seu negócio.",
    color: "primary",
  },
  {
    icon: Layout,
    title: "Sistemas Web",
    description: "Sistemas sob medida para automatizar processos, gerenciar dados e otimizar a operação da sua empresa.",
    color: "accent",
  },
  {
    icon: Settings,
    title: "Painéis Administrativos",
    description: "Dashboards completos para controle total do seu negócio com métricas e relatórios em tempo real.",
    color: "neon-purple",
  },
  {
    icon: Cpu,
    title: "Automação de Processos",
    description: "Ferramentas inteligentes para eliminar tarefas manuais e aumentar a produtividade da sua equipe.",
    color: "neon-green",
  },
  {
    icon: Database,
    title: "Infraestrutura de TI",
    description: "Configuração e gerenciamento de servidores, Microsoft 365, e-mails corporativos e mais.",
    color: "neon-cyan",
  },
  {
    icon: Smartphone,
    title: "Plataformas Digitais",
    description: "Aplicações web completas e escaláveis para levar seu negócio ao próximo nível digital.",
    color: "primary",
  },
];

const colorMap: Record<string, string> = {
  primary: "from-primary/20 to-primary/5 text-primary border-primary/20",
  accent: "from-accent/20 to-accent/5 text-accent border-accent/20",
  "neon-purple": "from-neon-purple/20 to-neon-purple/5 text-neon-purple border-neon-purple/20",
  "neon-green": "from-neon-green/20 to-neon-green/5 text-neon-green border-neon-green/20",
  "neon-cyan": "from-neon-cyan/20 to-neon-cyan/5 text-neon-cyan border-neon-cyan/20",
};

const Services = () => {
  return (
    <section id="servicos" className="py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Serviços</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Soluções que{" "}
            <span className="gradient-text">transformam</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Do planejamento à entrega, desenvolvo soluções digitais completas com design moderno e tecnologia confiável.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            const colors = colorMap[service.color] || colorMap.primary;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 group hover:border-primary/30 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
