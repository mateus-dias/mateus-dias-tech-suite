import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    title: "Sistema de Gestão Empresarial",
    category: "Sistema Web",
    description: "Plataforma completa para gerenciamento de processos internos com dashboard analytics.",
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    title: "E-commerce Premium",
    category: "Plataforma Digital",
    description: "Loja virtual com painel administrativo, controle de estoque e integração de pagamentos.",
    tags: ["Next.js", "Stripe", "Supabase"],
  },
  {
    title: "Portal Corporativo",
    category: "Site Institucional",
    description: "Site institucional moderno com sistema de gerenciamento de conteúdo personalizado.",
    tags: ["React", "CMS", "SEO"],
  },
  {
    title: "Dashboard de Analytics",
    category: "Painel Admin",
    description: "Dashboard interativo com gráficos em tempo real e relatórios personalizados.",
    tags: ["React", "D3.js", "API REST"],
  },
  {
    title: "App de Agendamento",
    category: "Sistema Web",
    description: "Sistema de agendamento online com notificações automáticas e integração com calendário.",
    tags: ["TypeScript", "PostgreSQL", "WebSocket"],
  },
  {
    title: "Plataforma Educacional",
    category: "Plataforma Digital",
    description: "Sistema de ensino a distância com videoaulas, exercícios e certificados automáticos.",
    tags: ["React", "Video API", "Auth"],
  },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-24 relative">
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-widest">Portfólio</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Projetos em{" "}
            <span className="gradient-text-accent">destaque</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Conheça alguns dos projetos que desenvolvi para clientes de diferentes segmentos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl overflow-hidden group cursor-pointer hover:border-accent/30 transition-all"
            >
              <div className="h-48 bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl font-bold text-muted-foreground/20 group-hover:text-primary/30 transition-colors">
                  {project.category.charAt(0)}
                </span>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={18} className="text-primary" />
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs font-medium text-primary">{project.category}</span>
                <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
