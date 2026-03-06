import { motion } from "framer-motion";
import portfolioProvas from "@/assets/portfolio-provas.jpg";
import portfolioOS from "@/assets/portfolio-os.jpg";
import portfolioSite from "@/assets/portfolio-site.jpg";
import portfolioDashboard from "@/assets/portfolio-dashboard.jpg";
import portfolioEducacional from "@/assets/portfolio-educacional.jpg";

const projects = [
  {
    title: "Sistema Gerador de Provas",
    description: "Plataforma web que permite a professores criar, organizar e gerar avaliações automaticamente em poucos minutos.",
    tags: ["React", "Node.js", "Supabase"],
    image: portfolioProvas,
  },
  {
    title: "Sistema de Ordem de Serviço",
    description: "Sistema digital para controle de manutenção, acompanhamento de serviços e organização de atendimentos.",
    tags: ["React", "PostgreSQL", "API REST"],
    image: portfolioOS,
  },
  {
    title: "Site Institucional Profissional",
    description: "Site moderno e responsivo desenvolvido para empresas apresentarem seus serviços com credibilidade e alto desempenho.",
    tags: ["Next.js", "SEO", "CMS"],
    image: portfolioSite,
  },
  {
    title: "Painel Administrativo",
    description: "Dashboards interativos para análise e gestão empresarial com gráficos em tempo real e relatórios personalizados.",
    tags: ["React", "D3.js", "API REST"],
    image: portfolioDashboard,
  },
  {
    title: "Plataforma Educacional",
    description: "Sistema web com login, conteúdo organizado por módulos e acompanhamento de progresso dos alunos.",
    tags: ["React", "Supabase", "Auth"],
    image: portfolioEducacional,
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
              className="glass-card rounded-2xl overflow-hidden group hover:border-accent/30 transition-all"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{project.title}</h3>
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
