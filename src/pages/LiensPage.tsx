import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, MessageCircle, Globe, ExternalLink } from "lucide-react";
import logo from "@/assets/logo-cqg.png";

const LiensPage = () => {
  useEffect(() => {
    document.title = "Liens — CQG";
  }, []);

  const socialLinks = [
    {
      name: "Notre Site Web",
      icon: Globe,
      url: "/",
      isInternal: true,
      description: "Explorez notre catalogue complet en ligne",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/213792425656",
      isInternal: false,
      description: "Contactez-nous directement pour toute question",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://web.facebook.com/profile.php?id=100076627794357",
      isInternal: false,
      description: "Suivez notre actualité et nos nouveautés",
    },
  ];

  return (
    <div className="min-h-screen bg-onyx flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="max-w-md w-full space-y-12">
        {/* Header/Logo Section */}
        <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-700">
          <Link to="/" className="transition-transform hover:scale-105 duration-500">
            <img 
              src={logo} 
              alt="CQG Logo" 
              className="h-32 sm:h-40 w-auto" 
            />
          </Link>
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl text-gold tracking-wide">
              Comptoir Quincaillerie Générale
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
              Chebaa Seddouk
            </p>
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-1000">
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            const content = (
              <div className="flex items-center justify-between p-5 rounded-xl bg-card border border-border hover:border-gold/50 hover:bg-white/5 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-onyx border border-gold/20 group-hover:border-gold/50 transition-colors">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-lg text-foreground group-hover:text-gold transition-colors">
                      {link.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {link.description}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-gold opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0" />
              </div>
            );

            return link.isInternal ? (
              <Link key={index} to={link.url} className="block w-full">
                {content}
              </Link>
            ) : (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                {content}
              </a>
            );
          })}
        </div>

        {/* Footer Section */}
        <div className="pt-12 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-loose">
            Excellence • Qualité • Confiance<br />
            © {new Date().getFullYear()} CQG Chebaa
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiensPage;
