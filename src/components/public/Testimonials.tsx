import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendes",
    company: "Mendes Consultoria",
    text: "O Mateus entregou um sistema que transformou completamente a gestão da minha empresa. Profissional excepcional.",
  },
  {
    name: "Ana Oliveira",
    company: "Studio Design AO",
    text: "Site ficou incrível! Moderno, rápido e já gerou novos clientes nos primeiros dias. Recomendo demais.",
  },
  {
    name: "Roberto Silva",
    company: "RS Engenharia",
    text: "Processo muito organizado, proposta clara e entrega no prazo. Melhor investimento que fiz para meu negócio.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-neon-green uppercase tracking-widest">Depoimentos</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 text-foreground">
            O que dizem os{" "}
            <span className="gradient-text">clientes</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
