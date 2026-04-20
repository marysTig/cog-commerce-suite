import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
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
    <div className="bg-background min-h-screen">
      {/* Desktop Breadcrumbs */}
      <div className="hidden lg:block container py-8">
        <Link to="/catalogue" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
          <ChevronLeft className="h-4 w-4" /> Retour au catalogue
        </Link>
      </div>

      <article className="lg:container pb-32 lg:pb-20 grid lg:grid-cols-2 lg:gap-16 relative">
        
        {/* IMAGE SECTION */}
        <div className="flex flex-col relative">
          {/* Mobile Back Button Overlay */}
          <Link to="/catalogue" className="absolute top-6 left-6 z-30 flex lg:hidden items-center justify-center h-12 w-12 rounded-full bg-background/50 backdrop-blur-md border border-white/10 text-white shadow-xl hover:bg-background/80 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </Link>

          <div className="relative w-full h-[55vh] lg:h-auto lg:aspect-square bg-onyx lg:border border-border lg:rounded-[2rem] overflow-hidden shadow-luxe">
            {images.length > 0 ? (
              <img src={getOptimizedUrl(images[activeImageIndex], { width: 1200, height: 1200, crop: "fill" })} alt={product.name} className="h-full w-full object-cover transition-opacity duration-500 animate-in fade-in" key={activeImageIndex} />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-steel-gradient">
                <span className="font-display text-7xl text-gold/30">COG</span>
              </div>
            )}
            {/* Badges */}
            {product.featured && (
              <span className="absolute bottom-16 lg:bottom-auto lg:top-6 left-6 lg:left-6 px-4 py-1.5 text-[10px] sm:text-[12px] font-bold uppercase tracking-widest bg-gold-gradient text-primary-foreground rounded-full shadow-[0_5px_15px_rgba(212,175,55,0.3)] z-10 pointer-events-none">
                Vedette
              </span>
            )}
            {(product as any).is_promotion && (
              <span className="absolute bottom-16 lg:bottom-auto lg:top-6 right-6 lg:right-6 inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] sm:text-[12px] font-bold uppercase tracking-widest bg-red-600/95 border border-red-500/50 text-white rounded-full shadow-[0_0_25px_rgba(220,38,38,0.6)] z-10 pointer-events-none animate-pulse-light">
                🔥 PROMO
              </span>
            )}
          </div>
          
          {/* Desktop Thumbnails */}
          {images.length > 1 && (
            <div className="hidden lg:flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x mt-6">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-24 w-24 flex-shrink-0 snap-center rounded-2xl overflow-hidden border-2 transition-all duration-400 ${activeImageIndex === idx ? "border-gold shadow-[0_5px_15px_rgba(212,175,55,0.2)] scale-105" : "border-transparent hover:border-gold/50 opacity-60 hover:opacity-100"}`}
                >
                  <img src={getOptimizedUrl(img, { width: 150, height: 150, crop: "thumb" })} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="relative -mt-10 lg:mt-0 pt-10 pb-6 px-6 lg:p-0 bg-background lg:bg-transparent rounded-t-[2.5rem] lg:rounded-none shadow-[0_-15px_40px_rgba(0,0,0,0.6)] lg:shadow-none z-20 flex flex-col justify-start lg:justify-center">
          
          {/* Mobile Thumbnails */}
          {images.length > 1 && (
            <div className="flex lg:hidden gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-2 px-2 mb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 snap-center rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImageIndex === idx ? "border-gold shadow-md" : "border-transparent opacity-60"}`}
                >
                  <img src={getOptimizedUrl(img, { width: 150, height: 150, crop: "thumb" })} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {product.categories?.name && (
            <Link to={`/catalogue?cat=${product.categories.slug}`} className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gold hover:underline mb-3 md:mb-5">
              {product.categories.name}
            </Link>
          )}
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] md:leading-tight tracking-tight text-foreground/95">
            {product.name}
          </h1>

          <div className="mt-6 md:mt-8 flex flex-col gap-2">
            <div className="flex items-baseline gap-4 flex-wrap">
              <p className="font-display text-4xl md:text-5xl text-gold-bright drop-shadow-sm font-semibold">
                {Number(product.price).toLocaleString("fr-FR")}
                <span className="text-xl md:text-2xl ml-2 text-muted-foreground font-sans font-normal">DA</span>
              </p>
              {(product as any).is_promotion && (product as any).old_price > 0 && (
                <p className="text-xl md:text-2xl text-red-500/70 line-through font-mono">
                  {Number((product as any).old_price).toLocaleString("fr-FR")} DA
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider ${stockBadge.cls} shadow-sm`}>
              <span className={`h-2 w-2 rounded-full ${stockBadge.dot} animate-pulse`} />
              {stockBadge.label}
            </span>
            
            {product.sku && (
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Réf: <span className="text-foreground/70">{product.sku}</span>
              </p>
            )}
          </div>

          {product.description && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <h2 className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gold mb-4 font-semibold">Description</h2>
              <p className="text-foreground/70 text-[15px] md:text-base leading-relaxed md:leading-[1.8] whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* DESKTOP BUTTONS */}
          <div className="hidden lg:flex flex-col gap-5 mt-12">
            <div className="flex gap-4">
              <Button 
                onClick={() => setModalOpen(true)}
                disabled={isOutOfStock}
                className="flex-[2] rounded-full text-[15px] uppercase tracking-wider h-16 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-black font-extrabold shadow-[0_10px_35px_rgba(212,175,55,0.35)] hover:scale-[1.02] hover:shadow-[0_15px_45px_rgba(212,175,55,0.45)] transition-all duration-400 group"
              >
                Achat Direct <ShoppingBag className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button 
                onClick={() => addItem(product)}
                disabled={isOutOfStock}
                variant="outline"
                className="flex-1 rounded-full text-[15px] uppercase tracking-wider h-16 border-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold hover:text-gold shadow-lg shadow-gold/5 transition-all duration-400 group"
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gold blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                </div>
                Panier
              </Button>
            </div>
            
            <a 
              href={`https://wa.me/213792425656?text=${whatsappMsg}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center rounded-full text-[15px] uppercase tracking-wider h-16 bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white font-extrabold shadow-[0_10px_35px_rgba(37,211,102,0.35)] hover:scale-[1.02] hover:shadow-[0_15px_45px_rgba(37,211,102,0.45)] transition-all duration-400"
            >
              <MessageCircle className="h-6 w-6 mr-3" /> Commander via WhatsApp
            </a>
          </div>

          {/* MOBILE PANIER BUTTON */}
          <div className="flex lg:hidden mt-8 mb-4">
            <Button 
                onClick={() => addItem(product)}
                disabled={isOutOfStock}
                variant="outline"
                className="w-full rounded-full text-xs uppercase tracking-wider h-14 border-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold hover:text-gold shadow-lg shadow-gold/5 transition-all outline-none"
            >
                <ShoppingBag className="h-5 w-5 mr-2" /> Ajouter au panier
            </Button>
          </div>

        </div>
      </article>

      {/* STICKY BOTTOM BAR (MOBILE) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-background/80 lg:hidden backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex gap-2 sm:gap-3">
          <Button 
            className="flex-1 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-black font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-14 shadow-[0_8px_30px_rgba(212,175,55,0.4)] active:scale-95 transition-transform"
            disabled={isOutOfStock} 
            onClick={() => setModalOpen(true)}
          >
            Achat Direct
          </Button>
          <a 
            href={`https://wa.me/213792425656?text=${whatsappMsg}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center rounded-full text-[11px] sm:text-xs uppercase tracking-wider h-14 bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white font-extrabold shadow-[0_8px_30px_rgba(37,211,102,0.4)] active:scale-95 transition-transform"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 w-5 mr-1.5" /> WhatsApp
          </a>
        </div>
      </div>

      <OrderModal product={product} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};

export default ProductDetail;
