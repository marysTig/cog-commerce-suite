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
                <h2 className="font-display text-4xl md:text-5xl tracking-tight">Nos catégories</h2>
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

      {/* CTA Section - Sexy Redesign */}
      <section className="container py-16 md:py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 shadow-2xl shadow-black/80 p-6 sm:p-8 py-16 md:p-20 text-center transition-all duration-1000 group">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(212,175,55,0.15),_transparent_70%)]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 blur-[100px] rounded-full group-hover:bg-gold/10 transition-all duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-onyx/40 blur-[100px] rounded-full" />
          
          {/* Floating Icon Decoration */}
          <div className="absolute top-8 right-8 md:top-12 md:right-12 opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
            <Sparkles className="h-20 w-20 text-gold" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold text-gold mb-6 md:mb-8 animate-pulse-light">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Sur-mesure & Conseil
            </div>
            
            <h2 className="font-display text-[2rem] leading-[1.1] sm:text-4xl md:text-6xl font-bold tracking-tight mb-6 md:mb-8 text-white/95 drop-shadow-2xl">
              Besoin d'un produit<br className="sm:hidden" /> <span className="text-gold italic font-display italic">spécifique ?</span>
            </h2>
            
            <p className="text-sm md:text-lg text-white/60 leading-relaxed mb-10 md:mb-12 max-w-xl">
              De l'outillage rare aux pièces spécialisées, notre équipe de Chebaa mobilise tout son réseau pour vous trouver la solution technique idéale.
            </p>

            <div className="w-full flex justify-center">
              <Button asChild variant="gold" size="xl" className="w-full max-w-xs sm:w-auto rounded-full h-16 md:h-18 px-8 md:px-12 text-[14px] md:text-base uppercase tracking-widest font-black shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:shadow-[0_25px_60px_rgba(212,175,55,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-500 group/wa relative overflow-hidden">
                <a href="https://wa.me/213792425656" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                  {/* Internal Glow Effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/wa:translate-x-full transition-transform duration-1000" />
                  
                  <div className="h-8 w-8 rounded-full bg-onyx flex items-center justify-center shadow-inner">
                    <MessageSquare className="h-4 w-4 text-gold fill-gold/20" />
                  </div>
                  <span>WhatsApp direct</span>
                </a>
              </Button>
            </div>
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
