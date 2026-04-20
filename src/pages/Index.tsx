import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import heroImg from "@/assets/hero-tools.jpg";
import { ArrowRight, Wrench, Truck, ShieldCheck, Sparkles, MessageSquare } from "lucide-react";
import { TestimonialTicker } from "@/components/site/TestimonialTicker";
import { TestimonialModal } from "@/components/site/TestimonialModal";

type Product = Tables<"products"> & { categories?: { name: string } | null };

const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);

  useEffect(() => {
    document.title = "COG — Comptoir Quincaillerie Générale Chebaa";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", "Quincaillerie générale premium en Algérie. Outillage, plomberie, électricité — qualité professionnelle, livraison rapide.");
    if (!meta.parentElement) document.head.appendChild(meta);

    Promise.all([
      supabase.from("products").select("*, categories(name)").eq("featured", true).limit(8),
      supabase.from("categories").select("*").limit(6),
    ]).then(([p, c]) => {
      if (p.data) setFeatured(p.data as Product[]);
      if (c.data) setCategories(c.data);
    });
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img
          src={heroImg}
          alt="Outils premium COG"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

        <div className="container relative z-10 py-12 md:py-20 px-5 sm:px-6">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-gold mb-4 md:mb-6 flex items-center gap-3">
              <span className="h-px w-8 md:w-12 bg-gold" /> Depuis Chebaa, pour l'Algérie
            </p>
            <h1 className="font-display text-[2.75rem] leading-[1.05] sm:text-5xl md:text-7xl font-bold md:leading-[1.05] tracking-tight text-foreground/95">
              L'<span className="text-gold">excellence</span><br />
              de la quincaillerie<br className="hidden sm:block" />
              <span className="italic font-light">à votre portée.</span>
            </h1>
            <p className="mt-6 md:mt-8 text-[15px] sm:text-base md:text-lg text-foreground/70 leading-relaxed max-w-xl">
              Comptoir Quincaillerie Générale Chebaa — outillage professionnel, matériaux de qualité, et un service à la hauteur de vos exigences.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
              <Button asChild variant="gold" size="xl" className="w-full sm:w-auto shadow-[0_10px_35px_rgba(212,175,55,0.25)] rounded-full h-14 text-[15px]">
                <Link to="/catalogue">Découvrir le catalogue <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="w-full sm:w-auto rounded-full h-14 text-[15px] bg-background/20 backdrop-blur-md border-white/10 hover:bg-white/5 transition-all text-foreground">
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 md:py-20 overflow-hidden border-t border-white/5 bg-muted/10">
        <div className="container">
          <div className="flex lg:grid gap-4 sm:gap-6 lg:grid-cols-4 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            {[
              { icon: Wrench, title: "Outils premium", desc: "Sélection rigoureuse des meilleures marques" },
              { icon: Truck, title: "Livraison rapide", desc: "Partout en Algérie, en quelques jours" },
              { icon: ShieldCheck, title: "Qualité garantie", desc: "Produits certifiés et durables" },
              { icon: Sparkles, title: "Service expert", desc: "Conseils personnalisés par téléphone" },
            ].map((item, i) => (
              <div key={i} className="shrink-0 snap-center w-[260px] sm:w-[300px] lg:w-auto p-6 bg-card border border-border rounded-2xl hover:border-gold/40 hover:-translate-y-1 hover:shadow-luxe-hover transition-all duration-500 group relative overflow-hidden flex flex-col justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
                <item.icon className="h-8 w-8 text-gold group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 relative z-10" />
                <h3 className="font-display text-lg font-semibold mt-4 relative z-10 tracking-tight">{item.title}</h3>
                <p className="text-[13px] sm:text-sm text-muted-foreground mt-1 relative z-10 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-16 overflow-hidden">
          <div className="container">
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-gold mb-3">Nos catégories</p>
                <h2 className="font-display text-4xl md:text-5xl tracking-tight">Explorer par univers</h2>
              </div>
              <Link to="/categories" className="hidden md:inline-flex text-sm text-gold hover:underline uppercase tracking-wider">Tout voir →</Link>
            </div>
            
            <div className="flex lg:grid gap-4 sm:gap-5 lg:grid-cols-3 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalogue?cat=${cat.slug}`}
                  className="w-[260px] sm:w-[320px] lg:w-auto shrink-0 snap-center group relative h-52 lg:h-48 bg-card border border-border rounded-[2rem] lg:rounded-2xl overflow-hidden hover:border-gold/50 shadow-sm hover:shadow-luxe-hover hover:-translate-y-1 transition-all duration-500"
                >
                  {cat.image_url ? (
                    <img 
                      src={cat.image_url} 
                      alt={cat.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-steel-gradient opacity-50" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                    <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold/80 transform group-hover:translate-x-1 group-hover:text-gold transition-all duration-500">Catégorie</p>
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-tight text-foreground/95 group-hover:text-gold transform group-hover:translate-x-1 transition-all duration-500">{cat.name}</h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 uppercase font-medium tracking-wider flex items-center gap-1 group-hover:text-foreground transition-colors">
                        Voir produits <span className="transform group-hover:translate-x-1 transition-transform duration-500 text-gold text-lg">→</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Mobile "Tout voir" button */}
            <div className="mt-4 flex lg:hidden justify-center">
              <Button asChild variant="link" className="text-gold uppercase tracking-wider text-xs">
                <Link to="/categories">Toutes les catégories →</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="container py-16 border-t border-white/5">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-gold mb-3">Sélection</p>
              <h2 className="font-display text-4xl md:text-5xl tracking-tight">Produits vedettes</h2>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-2 lg:gap-6 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-16 md:py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-steel-gradient border border-gold/20 shadow-2xl shadow-black/40 p-8 py-14 md:p-16 text-center transition-all duration-700 group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_65%_52%_/_0.15),_transparent_70%)] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative z-10 transform group-hover:translate-y-[-2px] transition-transform duration-700">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-gold mb-4 drop-shadow-sm">Besoin d'un produit spécifique ?</p>
            <h2 className="font-display text-[1.9rem] leading-[1.1] md:text-5xl max-w-2xl mx-auto tracking-tight drop-shadow-md">
              Notre équipe est à votre <span className="text-gold">écoute</span>.
            </h2>
            <Button asChild variant="gold" size="xl" className="mt-8 hover:scale-[1.02] shadow-[0_10px_35px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_45px_rgba(212,175,55,0.4)] transition-all duration-500 w-full sm:w-auto rounded-full h-[3.5rem] md:h-16 text-[13px] md:text-[15px] uppercase tracking-wider font-extrabold group/btn gap-2">
              <a href="https://wa.me/213792425656" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-5 w-5 bg-background text-gold p-1 rounded-full group-hover/btn:scale-110 transition-transform" /> 
                <span className="hidden sm:inline">Nous écrire sur</span> WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-background overflow-hidden border-t border-border/50">
        <div className="container mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-fade-up">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-gold mb-3">Témoignages</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">Ce que disent <span className="text-gold">nos clients</span></h2>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setTestimonialModalOpen(true)}
            className="border-gold/30 hover:bg-gold/5 text-gold group animate-fade-up w-full md:w-auto h-12 rounded-full"
          >
            <MessageSquare className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Laisser un avis
          </Button>
        </div>
        
        <TestimonialTicker />
      </section>

      <TestimonialModal open={testimonialModalOpen} onOpenChange={setTestimonialModalOpen} />
    </>
  );
};

export default Index;
