import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Loader2, ArrowRight } from "lucide-react";

const Categories = () => {
  const [cats, setCats] = useState<(Tables<"categories"> & { count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Catégories — COG Quincaillerie";
    (async () => {
      try {
        const { data: categories } = await supabase.from("categories").select("*").order("name");
        const { data: products } = await supabase.from("products").select("category_id");
        const counts = new Map<string, number>();
        products?.forEach((p) => { if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) || 0) + 1); });
        setCats((categories || []).map((c) => ({ ...c, count: counts.get(c.id) || 0 })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container py-12 md:py-20 animate-fade-in">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Univers</p>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
          Explorez nos <span className="text-gold">collections</span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
          Naviguez à travers nos différents univers d'outillage et de matériaux professionnels.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : cats.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Aucune catégorie pour l'instant.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Link 
              key={c.id} 
              to={`/catalogue?cat=${c.slug}`} 
              className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/40 hover:shadow-luxe-hover hover:-translate-y-2 transition-all duration-500"
            >
              {c.image_url ? (
                <div className="aspect-[16/10] overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img 
                    src={c.image_url} 
                    alt={c.name} 
                    loading="lazy" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 text-[10px] font-semibold bg-gold-gradient text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      Cliquer pour ouvrir
                    </span>
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/10] flex items-center justify-center bg-steel-gradient group-hover:bg-gold/10 transition-colors">
                  <span className="font-display text-4xl text-gold/20 italic">COG</span>
                </div>
              )}
              
              <div className="p-8 relative flex-1">
                <div className="absolute -top-6 left-8 px-4 py-2 bg-card border border-border rounded-lg group-hover:border-gold/40 transition-colors shadow-xl z-20">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
                    {c.count} {c.count > 1 ? "produits" : "produit"}
                  </p>
                </div>
                
                <h2 className="font-display text-3xl mt-2 group-hover:text-gold transition-colors">{c.name}</h2>
                {c.description && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
                
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/50 group-hover:border-gold/20 transition-colors">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
                    Explorer l'univers
                  </span>
                  <ArrowRight className="h-5 w-5 text-gold transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
