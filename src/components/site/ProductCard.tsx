import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products"> & { categories?: { name: string } | null };

export const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link
      to={`/produit/${product.slug}`}
      className="group block bg-card border border-border rounded-lg overflow-hidden shadow-luxe hover:shadow-luxe-hover hover:-translate-y-1 transition-all duration-500"
    >
      <div className="relative aspect-square bg-onyx overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-steel-gradient">
            <span className="font-display text-4xl text-gold/30">COG</span>
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="uppercase tracking-wider">Rupture</Badge>
          </div>
        )}
        {product.featured && product.in_stock && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 text-[10px] font-semibold uppercase tracking-widest bg-gold-gradient text-primary-foreground rounded-full">
              Vedette
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        {product.categories?.name && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {product.categories.name}
          </p>
        )}
        <h3 className="font-display text-lg font-semibold leading-tight text-foreground group-hover:text-gold transition-colors line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
        <div className="mt-4 flex items-baseline justify-between">
          <p className="font-display text-2xl text-gold">
            {Number(product.price).toLocaleString("fr-FR")}
            <span className="text-xs ml-1 text-muted-foreground font-sans">DA</span>
          </p>
          <span className="text-xs text-gold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
            Voir →
          </span>
        </div>
      </div>
    </Link>
  );
};
