import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import heroImg from "@/assets/hero-tools.jpg";
import { ArrowRight, Wrench, Truck, ShieldCheck, Sparkles } from "lucide-react";

type Product = Tables<"products"> & { categories?: { name: string } | null };

const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);

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

        <div className="container relative z-10 py-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6 flex items-center gap-3">
              <span className="h-px w-12 bg-gold" /> Depuis Chebaa, pour l'Algérie
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05]">
              L'<span className="text-gold">excellence</span><br />
              de la quincaillerie<br />
              <span className="italic font-light">à votre portée.</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-xl">
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
          <div key={i} className="p-6 bg-card border border-border rounded-lg hover:border-gold/40 transition-all duration-500 group">
            <item.icon className="h-7 w-7 text-gold group-hover:scale-110 transition-transform duration-500" />
            <h3 className="font-display text-lg font-semibold mt-4">{item.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
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
                className="group relative h-40 bg-steel-gradient border border-border rounded-lg overflow-hidden hover:border-gold/50 transition-all duration-500"
              >
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Catégorie</p>
                  <div>
                    <h3 className="font-display text-2xl font-semibold group-hover:text-gold transition-colors">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Voir produits →</p>
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
        <div className="relative overflow-hidden rounded-2xl bg-steel-gradient border border-gold/20 p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_65%_52%_/_0.1),_transparent_70%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Besoin d'un produit spécifique ?</p>
            <h2 className="font-display text-3xl md:text-5xl max-w-2xl mx-auto">
              Notre équipe est à votre <span className="text-gold">écoute</span>.
            </h2>
            <Button asChild variant="gold" size="xl" className="mt-8">
              <a href="https://wa.me/213792425656" target="_blank" rel="noopener noreferrer">
                Nous écrire sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
