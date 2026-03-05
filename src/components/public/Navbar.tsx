import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/Logo.png";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Serviços", href: "#servicos" },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Processo", href: "#processo" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-3" : "py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <a href="#home" className="flex items-center gap-3">
          <img src={logo} alt="Mateus Dias Tech" className="h-10 w-10" />
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-foreground">Mateus Dias</span>
            <p className="text-xs text-muted-foreground">Engenheiro da Computação</p>
          </div>
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
          ))}
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity glow-blue"
          >
            Solicitar Orçamento
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden glass mx-4 mt-2 rounded-xl p-6 flex flex-col gap-4"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center"
          >
            Solicitar Orçamento
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
