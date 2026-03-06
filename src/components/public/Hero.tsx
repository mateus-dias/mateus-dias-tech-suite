import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, FolderOpen } from "lucide-react";
import logo from "@/assets/Logo.png";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-neon-purple/10 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-cyan/5 blur-[150px]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              <motion.img
                src={logo}
                alt="Logo"
                className="w-24 h-24 animate-float"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-muted-foreground mb-6">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              Disponível para novos projetos
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-foreground">
              Mateus Dias
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-medium gradient-text mb-2">
              Engenheiro da Computação
            </p>
            <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Especialista em Desenvolvimento de Sites Profissionais e Sistemas Web sob medida
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="#contato"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-primary-foreground bg-primary glow-blue hover:opacity-90 transition-all"
            >
              Solicitar Orçamento
              <ArrowRight size={18} />
            </a>
            <a
              href="https://wa.me/5516997754245"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-foreground glass hover:bg-secondary/50 transition-all"
            >
              <MessageCircle size={18} />
              Falar no WhatsApp
            </a>
            <a
              href="#portfolio"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-foreground glass hover:bg-secondary/50 transition-all"
            >
              <FolderOpen size={18} />
              Ver Portfólio
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {[
              { value: "50+", label: "Projetos Entregues" },
              { value: "98%", label: "Satisfação" },
              { value: "5+", label: "Anos Experiência" },
              { value: "24h", label: "Resposta Rápida" },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
