import { Link } from "react-router-dom";
import { Phone, MapPin, Mail } from "lucide-react";
import logo from "@/assets/logo-cog.png";

export const SiteFooter = () => {
  return (
    <footer className="border-t border-border/60 mt-32 bg-onyx">
      <div className="container py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="COG" className="h-14 w-14" width={56} height={56} loading="lazy" />
            <div>
              <div className="font-display text-xl font-bold text-gold">COG</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Comptoir Quincaillerie
              </div>
            </div>
          </Link>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            L'excellence de la quincaillerie générale. Des outils premium pour les professionnels et les particuliers exigeants.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-gold mb-5">Navigation</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-gold transition-colors">Accueil</Link></li>
            <li><Link to="/catalogue" className="hover:text-gold transition-colors">Catalogue</Link></li>
            <li><Link to="/categories" className="hover:text-gold transition-colors">Catégories</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-gold mb-5">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
              <a href="tel:+213792425656" className="hover:text-gold transition-colors">+213 792 42 56 56</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
              <span>contact@cog-chebaa.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
              <span>Algérie</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-gold mb-5">Horaires</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between"><span>Sam — Jeu</span><span>08:00 — 18:00</span></li>
            <li className="flex justify-between"><span>Vendredi</span><span>Fermé</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Comptoir Quincaillerie Générale Chebaa. Tous droits réservés.</p>
          <p className="tracking-wider uppercase">Excellence • Qualité • Confiance</p>
        </div>
      </div>
    </footer>
  );
};
