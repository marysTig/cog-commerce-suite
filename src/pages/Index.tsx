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

        <div className="container relative z-10 py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gold mb-4 md:mb-6 flex items-center gap-3">
              <span className="h-px w-8 md:w-12 bg-gold" /> Depuis Chebaa, pour l'Algérie
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] md:leading-[1.05]">
              L'<span className="text-gold">excellence</span><br />
              de la quincaillerie<br className="hidden sm:block" />
              <span className="italic font-light">à votre portée.</span>
            </h1>
            <p className="mt-6 md:mt-8 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Comptoir Quincaillerie Générale Chebaa — outillage professionnel, matériaux de qualité, et un service à la hauteur de vos exigences.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="gold" size="xl">
                <Link to="/catalogue">Découvrir le catalogue <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="gold-outline" size="xl">
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="container py-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Wrench, title: "Outils premium", desc: "Sélection rigoureuse des meilleures marques" },
          { icon: Truck, title: "Livraison rapide", desc: "Partout en Algérie, en quelques jours" },
          { icon: ShieldCheck, title: "Qualité garantie", desc: "Produits certifiés et durables" },
          { icon: Sparkles, title: "Service expert", desc: "Conseils personnalisés par téléphone" },
        ].map((item, i) => (
          <div key={i} className="p-6 bg-card border border-border rounded-xl hover:border-gold/40 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
            <item.icon className="h-7 w-7 text-gold group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 relative z-10" />
            <h3 className="font-display text-lg font-semibold mt-4 relative z-10">{item.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 relative z-10">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="container py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Nos catégories</p>
              <h2 className="font-display text-4xl md:text-5xl">Explorer par univers</h2>
            </div>
            <Link to="/categories" className="hidden md:inline-flex text-sm text-gold hover:underline uppercase tracking-wider">Tout voir →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?cat=${cat.slug}`}
                className="group relative h-48 bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/50 hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] hover:-translate-y-1 transition-all duration-500"
              >
                {cat.image_url ? (
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-steel-gradient opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold transform group-hover:translate-x-1 transition-transform duration-500">Catégorie</p>
                  <div>
                    <h3 className="font-display text-2xl font-semibold group-hover:text-gold transform group-hover:translate-x-1 transition-all duration-500">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider flex items-center gap-1 group-hover:text-foreground transition-colors">
                      Voir produits <span className="transform group-hover:translate-x-1 transition-transform duration-500">→</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="container py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Sélection</p>
              <h2 className="font-display text-4xl md:text-5xl">Produits vedettes</h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl bg-steel-gradient border border-gold/20 hover:border-gold/40 hover:shadow-[0_0_50px_rgba(212,175,55,0.1)] p-12 md:p-16 text-center transition-all duration-700 group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_65%_52%_/_0.15),_transparent_70%)] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" />
          <div className="relative z-10 transform group-hover:translate-y-[-2px] transition-transform duration-700">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Besoin d'un produit spécifique ?</p>
            <h2 className="font-display text-3xl md:text-5xl max-w-2xl mx-auto">
              Notre équipe est à votre <span className="text-gold">écoute</span>.
            </h2>
            <Button asChild variant="gold" size="xl" className="mt-8 hover:scale-105 hover:shadow-lg hover:shadow-gold/20 transition-all duration-500">
              <a href="https://wa.me/213792425656" target="_blank" rel="noopener noreferrer">
                Nous écrire sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-background overflow-hidden border-t border-border/50">
        <div className="container mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Témoignages</p>
            <h2 className="font-display text-4xl md:text-5xl">Ce que disent <span className="text-gold">nos clients</span></h2>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setTestimonialModalOpen(true)}
            className="border-gold/30 hover:bg-gold/5 text-gold group animate-fade-up"
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
