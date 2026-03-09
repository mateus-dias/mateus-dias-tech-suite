import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import Services from "@/components/public/Services";
import Portfolio from "@/components/public/Portfolio";
import Process from "@/components/public/Process";
import About from "@/components/public/About";
import Testimonials from "@/components/public/Testimonials";
import Contact from "@/components/public/Contact";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import { useTrackVisit } from "@/hooks/useTrackVisit";

const Index = () => {
  useTrackVisit("/");
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Services />
      <Portfolio />
      <Process />
      <About />
      <Testimonials />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
