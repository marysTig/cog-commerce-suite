import { useEffect } from "react";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  useEffect(() => { document.title = "Contact — COG"; }, []);

  return (
    <div className="container py-12 md:py-20">
      <header className="text-center mb-16 max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Contact</p>
        <h1 className="font-display text-5xl md:text-6xl">Prenons contact</h1>
        <p className="text-muted-foreground mt-4">Notre équipe est à votre disposition pour toute question ou demande spécifique.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {[
          { icon: Phone, title: "Téléphone", value: "+213 792 42 56 56", href: "tel:+213792425656" },
          { icon: MessageCircle, title: "WhatsApp", value: "Discussion directe", href: "https://wa.me/213792425656" },
          { icon: Mail, title: "Email", value: "contact@cog-chebaa.com", href: "mailto:contact@cog-chebaa.com" },
          { icon: MapPin, title: "Adresse", value: "Algérie" },
          { icon: Clock, title: "Horaires", value: "Sam – Jeu : 08h – 18h" },
        ].map((c, i) => {
          const Inner = (
            <div className="bg-card border border-border rounded-lg p-8 h-full hover:border-gold/40 transition-all duration-500 group">
              <c.icon className="h-7 w-7 text-gold group-hover:scale-110 transition-transform duration-500" />
              <h3 className="font-display text-xl mt-4">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{c.value}</p>
            </div>
          );
          return c.href
            ? <a key={i} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{Inner}</a>
            : <div key={i}>{Inner}</div>;
        })}
      </div>

      <div className="mt-16 text-center">
        <Button asChild variant="gold" size="xl">
          <a href="https://wa.me/213792425656" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" /> Démarrer une conversation
          </a>
        </Button>
      </div>
    </div>
  );
};

export default Contact;
