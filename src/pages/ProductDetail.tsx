import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderModal } from "@/components/site/OrderModal";
import { ChevronLeft, MessageCircle, Loader2, ShoppingBag } from "lucide-react";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { useCart } from "@/contexts/CartContext";

type Product = Tables<"products"> & { categories?: { name: string; slug: string } | null };

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase.from("products").select("*, categories(name, slug)").eq("slug", slug).maybeSingle().then(({ data }) => {
      if (data) {
        const p = data as Product;
        setProduct(p);
        document.title = `${p.name} — COG`;
        const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
        meta.setAttribute("name", "description");
        meta.setAttribute("content", (p.description || p.name).slice(0, 160));
        if (!meta.parentElement) document.head.appendChild(meta);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  if (!product) return (
    <div className="container py-32 text-center">
      <h1 className="font-display text-4xl">Produit introuvable</h1>
      <Button asChild variant="gold" className="mt-6"><Link to="/catalogue">Retour au catalogue</Link></Button>
    </div>
  );

  const whatsappMsg = encodeURIComponent(`Bonjour, je suis intéressé par : ${product.name} (${Number(product.price).toLocaleString("fr-FR")} DA)`);

  let images: string[] = [];
  if (product?.image_url) {
    try {
      if (product.image_url.startsWith("[")) {
        images = JSON.parse(product.image_url);
      } else {
        images = [product.image_url];
      }
    } catch {
      images = [product.image_url];
    }
  }

  const stockStatus = (product as any).stock_status ?? (product.in_stock ? "in_stock" : "out_of_stock");
  const isOutOfStock = stockStatus === "out_of_stock";

  const stockBadge = {
    in_stock:     { label: "En stock",     cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400" },
    limited:      { label: "Stock limité", cls: "bg-orange-500/15 text-orange-400 border border-orange-500/30",   dot: "bg-orange-400" },
    out_of_stock: { label: "Rupture de stock", cls: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30",     dot: "bg-zinc-400" },
  }[stockStatus as string] ?? { label: "En stock", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400" };

  const { addItem } = useCart();

  return (
    <>
      <div className="container py-8">
        <Link to="/catalogue" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
          <ChevronLeft className="h-4 w-4" /> Retour au catalogue
        </Link>
      </div>

      <article className="container pb-20 grid gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-onyx border border-border rounded-2xl overflow-hidden shadow-luxe">
            {images.length > 0 ? (
              <img src={getOptimizedUrl(images[activeImageIndex], { width: 1200, height: 1200, crop: "fill" })} alt={product.name} className="h-full w-full object-cover transition-opacity duration-500 animate-in fade-in" key={activeImageIndex} />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-steel-gradient">
                <span className="font-display text-7xl text-gold/30">COG</span>
              </div>
            )}
            {product.featured && (
              <span className="absolute top-5 left-5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest bg-gold-gradient text-primary-foreground rounded-full shadow-md z-10 pointer-events-none">
                Vedette
              </span>
            )}
            {(product as any).is_promotion && (
              <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest bg-red-600/95 border border-red-500/50 text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] z-10 pointer-events-none animate-pulse-light">
                🔥 PROMO
              </span>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 snap-center rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImageIndex === idx ? "border-gold shadow-md" : "border-transparent hover:border-gold/50 opacity-70 hover:opacity-100"}`}
                >
                  <img src={getOptimizedUrl(img, { width: 150, height: 150, crop: "thumb" })} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          {product.categories?.name && (
            <Link to={`/catalogue?cat=${product.categories.slug}`} className="text-xs uppercase tracking-[0.3em] text-gold hover:underline mb-4">
              {product.categories.name}
            </Link>
          )}
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">{product.name}</h1>

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-end gap-4">
              <p className="font-display text-5xl text-gold">
                {Number(product.price).toLocaleString("fr-FR")}
                <span className="text-lg ml-2 text-muted-foreground font-sans">DA</span>
              </p>
              {(product as any).is_promotion && (product as any).old_price > 0 && (
                <p className="text-2xl text-red-500/70 line-through mb-1 font-mono">
                  {Number((product as any).old_price).toLocaleString("fr-FR")} DA
                </p>
              )}
            </div>
            {product.sku && (
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-2">
                Réf: {product.sku}
              </p>
            )}
          </div>

          <div className="mt-6">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${stockBadge.cls}`}>
              <span className={`h-2 w-2 rounded-full ${stockBadge.dot}`} />
              {stockBadge.label}
            </span>
          </div>

          {product.description && (
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Description</h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="gold" 
                size="xl" 
                disabled={isOutOfStock} 
                onClick={() => setModalOpen(true)} 
                className="flex-[2] shadow-gold-glow"
              >
                Achat Direct
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                disabled={isOutOfStock} 
                onClick={() => addItem(product)} 
                className="flex-1 border-gold/40 hover:bg-gold/5 text-gold"
              >
                <ShoppingBag className="h-5 w-5 mr-2" /> Panier
              </Button>
            </div>
            
            <Button asChild variant="whatsapp" size="xl" className="w-full">
              <a href={`https://wa.me/213792425656?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5 mr-2" /> Commander via WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </article>

      <OrderModal product={product} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};

export default ProductDetail;
