import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const Categories = () => {
  const [cats, setCats] = useState<(Tables<"categories"> & { count: number })[]>([]);

  useEffect(() => {
    document.title = "Catégories — COG";
    (async () => {
      const { data: categories } = await supabase.from("categories").select("*").order("name");
      const { data: products } = await supabase.from("products").select("category_id");
      const counts = new Map<string, number>();
      products?.forEach((p) => { if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) || 0) + 1); });
      setCats((categories || []).map((c) => ({ ...c, count: counts.get(c.id) || 0 })));
    })();
  }, []);

  return (
    <div className="container py-12 md:py-20">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Univers</p>
        <h1 className="font-display text-5xl md:text-6xl">Toutes les catégories</h1>
      </header>

      {cats.length === 0 ? (
        <p className="text-muted-foreground">Aucune catégorie pour l'instant.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Link key={c.id} to={`/catalogue?cat=${c.slug}`} className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-gold/50 hover:shadow-luxe-hover transition-all duration-500">
              {c.image_url && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={c.image_url} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="p-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{c.count} {c.count > 1 ? "produits" : "produit"}</p>
                <h2 className="font-display text-3xl mt-3 group-hover:text-gold transition-colors">{c.name}</h2>
                {c.description && <p className="text-sm text-muted-foreground mt-3">{c.description}</p>}
                <p className="text-xs text-gold mt-6 uppercase tracking-wider">Explorer →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
