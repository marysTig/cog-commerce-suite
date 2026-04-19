import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { useCart } from "@/contexts/CartContext";
import { cn, getProductImage } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products"> & { categories?: { name: string } | null };

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product as any);
  };

  const firstImageUrl = getProductImage(product.image_url);

  return (
    <Link
      to={`/produit/${product.slug}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgb(212,175,55,0.15)] hover:border-gold/40 hover:-translate-y-2 transition-all duration-500"
    >
      <div className="relative aspect-square bg-onyx overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

        {/* Add to cart button — bottom right on hover */}
        <div className="absolute bottom-4 right-4 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
           <Button 
             size="icon" 
             variant="gold" 
             className="h-10 w-10 rounded-full shadow-lg shadow-gold/20"
             onClick={handleAddToCart}
           >
             <ShoppingBag className="h-4 w-4" />
           </Button>
        </div>
        {firstImageUrl ? (
          <img
            src={getOptimizedUrl(firstImageUrl, { width: 600, height: 600, crop: "fill" })}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-steel-gradient group-hover:scale-105 transition-transform duration-700">
            <span className="font-display text-4xl text-gold/30">COG</span>
          </div>
        )}
        {(() => {
          const status = (product as any).stock_status ?? (product.in_stock ? "in_stock" : "out_of_stock");
          if (status === "out_of_stock") return (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-20">
              <Badge variant="destructive" className="uppercase tracking-wider">Rupture</Badge>
            </div>
          );
          if (status === "limited") return (
            <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Stock limité
              </span>
            </div>
          );
          return null;
        })()}
        {(product as any).is_promotion && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-red-600/95 border border-red-500/50 text-white rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse-light">
              🔥 PROMO
            </span>
          </div>
        )}
        {product.featured && product.in_stock && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="inline-flex items-center px-3 py-1 text-[10px] font-semibold uppercase tracking-widest bg-gold-gradient text-primary-foreground rounded-full shadow-lg">
              Vedette
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 relative">
        <div className="absolute top-0 right-6 -translate-y-1/2 p-2 bg-card rounded-full border border-border opacity-0 group-hover:opacity-100 group-hover:translate-y-[-60%] group-hover:border-gold/40 transition-all duration-500 shadow-xl shadow-gold/10 z-20 hidden md:flex items-center justify-center group-hover:scale-110">
          <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        {product.categories?.name && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 group-hover:text-gold transition-colors">
            {product.categories.name}
          </p>
        )}
        <h3 className="font-display text-base sm:text-lg font-semibold leading-tight text-foreground group-hover:text-gold transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
          {product.name}
        </h3>
        <div className="mt-3 sm:mt-4 flex items-baseline justify-between border-t border-border/50 pt-3 sm:pt-4 group-hover:border-gold/20 transition-colors duration-500">
          <div className="flex flex-col">
            <p className="font-display text-lg sm:text-2xl text-gold transform group-hover:scale-105 transition-transform origin-left duration-500">
              {Number(product.price).toLocaleString("fr-FR")}
              <span className="text-xs ml-1 text-muted-foreground font-sans">DA</span>
            </p>
            {(product as any).is_promotion && (product as any).old_price > 0 && (
              <p className="text-xs text-red-500/80 line-through font-mono mt-0.5">
                {Number((product as any).old_price).toLocaleString("fr-FR")} DA
              </p>
            )}
          </div>
          <span className="text-xs text-gold opacity-0 group-hover:opacity-100 transform group-hover:-translate-x-2 transition-all duration-500 uppercase tracking-wider font-semibold">
            Découvrir
          </span>
        </div>
      </div>
    </Link>
  );
};
