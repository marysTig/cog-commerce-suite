import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderModal } from "@/components/site/OrderModal";
import { ChevronLeft, MessageCircle, Loader2, Check, X } from "lucide-react";

type Product = Tables<"products"> & { categories?: { name: string; slug: string } | null };

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <>
      <div className="container py-8">
        <Link to="/catalogue" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
          <ChevronLeft className="h-4 w-4" /> Retour au catalogue
        </Link>
      </div>

      <article className="container pb-20 grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square bg-onyx border border-border rounded-2xl overflow-hidden shadow-luxe">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-steel-gradient">
              <span className="font-display text-7xl text-gold/30">COG</span>
            </div>
          )}
          {product.featured && (
            <span className="absolute top-5 left-5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest bg-gold-gradient text-primary-foreground rounded-full">
              Vedette
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          {product.categories?.name && (
            <Link to={`/catalogue?cat=${product.categories.slug}`} className="text-xs uppercase tracking-[0.3em] text-gold hover:underline mb-4">
              {product.categories.name}
            </Link>
          )}
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">{product.name}</h1>

          <div className="mt-6 flex items-baseline gap-4">
            <p className="font-display text-5xl text-gold">
              {Number(product.price).toLocaleString("fr-FR")}
              <span className="text-lg ml-2 text-muted-foreground font-sans">DA</span>
            </p>
          </div>

          <div className="mt-6">
            {product.in_stock ? (
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/20">
                <Check className="h-3 w-3 mr-1" /> En stock
              </Badge>
            ) : (
              <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Rupture de stock</Badge>
            )}
          </div>

          {product.description && (
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Description</h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button variant="gold" size="xl" disabled={!product.in_stock} onClick={() => setModalOpen(true)} className="flex-1">
              Commander maintenant
            </Button>
            <Button asChild variant="whatsapp" size="xl" className="flex-1">
              <a href={`https://wa.me/213792425656?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> WhatsApp
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
