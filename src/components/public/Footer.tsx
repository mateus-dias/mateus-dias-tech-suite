import logo from "@/assets/Logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Mateus Dias Tech" className="h-8 w-8" />
            <div>
              <span className="text-sm font-bold text-foreground">Mateus Dias</span>
              <p className="text-xs text-muted-foreground">Engenheiro da Computação</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground"><p className="text-xs text-muted-foreground">Atendimento das 08h às 18h</p></p>
            <p className="text-xs text-muted-foreground mt-1">
              © {new Date().getFullYear()} Mateus Dias Tech. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
