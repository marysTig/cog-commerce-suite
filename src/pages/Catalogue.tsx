import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Product = Tables<"products"> & { categories?: { name: string } | null };

const Catalogue = () => {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("q") || "");

  const activeCat = params.get("cat") || "";

  useEffect(() => {
    document.title = "Catalogue — COG Quincaillerie";
    Promise.all([
      supabase.from("products").select("*, categories(name, slug)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]).then(([p, c]) => {
      if (p.data) setProducts(p.data as Product[]);
      if (c.data) setCategories(c.data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !activeCat || (p as any).categories?.slug === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [products, search, activeCat]);

  const setCat = (slug: string) => {
    const newParams = new URLSearchParams(params);
    if (slug) newParams.set("cat", slug); else newParams.delete("cat");
    setParams(newParams);
  };

  return (
    <div className="container py-12 md:py-20 animate-fade-in">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Catalogue</p>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
          L'excellence <span className="text-gold">partout</span><br />
          <span className="italic font-light">en Algérie.</span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
          Outillage professionnel, matériaux de haute qualité et accessoires sélectionnés avec la plus grande exigence.
        </p>
      </header>

      <div className="flex flex-col gap-8 mb-16">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
          <Input
            placeholder="Rechercher une référence, un outil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-card/40 border-border glass-input rounded-xl text-lg w-full"
          />
        </div>

        <div className="flex flex-nowrap md:flex-wrap gap-2 md:gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
          <Button 
            variant={!activeCat ? "gold" : "outline"} 
            className={cn(
              "rounded-full px-6 transition-all duration-300 whitespace-nowrap snap-start shrink-0",
              !activeCat ? "shadow-gold-glow" : "hover:border-gold/50"
            )}
            onClick={() => setCat("")}
          >
            Toute la collection
          </Button>
          {categories.map((c) => (
            <Button 
              key={c.id} 
              variant={activeCat === c.slug ? "gold" : "outline"}
              className={cn(
                "rounded-full px-6 transition-all duration-300 whitespace-nowrap snap-start shrink-0",
                activeCat === c.slug ? "shadow-gold-glow" : "hover:border-gold/50"
              )}
              onClick={() => setCat(c.slug)}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="font-display text-2xl text-muted-foreground">Aucun produit trouvé</p>
          <p className="text-sm text-muted-foreground mt-2">Essayez d'autres termes ou catégories.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Catalogue;
