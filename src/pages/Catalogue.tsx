import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Search, Loader2 } from "lucide-react";

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
    <div className="container py-12 md:py-20">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Catalogue</p>
        <h1 className="font-display text-5xl md:text-6xl">Tous nos produits</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">Outillage, matériaux et accessoires sélectionnés avec exigence.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-card border-border"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <Button variant={!activeCat ? "gold" : "gold-outline"} size="sm" onClick={() => setCat("")}>
          Toutes
        </Button>
        {categories.map((c) => (
          <Button key={c.id} variant={activeCat === c.slug ? "gold" : "gold-outline"} size="sm" onClick={() => setCat(c.slug)}>
            {c.name}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="font-display text-2xl text-muted-foreground">Aucun produit trouvé</p>
          <p className="text-sm text-muted-foreground mt-2">Essayez d'autres termes ou catégories.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Catalogue;
