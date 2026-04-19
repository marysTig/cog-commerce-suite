import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { getProductImage } from "@/lib/utils";
import { useState } from "react";
import { OrderModal } from "./OrderModal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartDrawer = ({ open, onOpenChange }: Props) => {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    onOpenChange(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md bg-card border-l border-border flex flex-col p-0">
          <SheetHeader className="p-6 border-b border-border bg-muted/20">
            <SheetTitle className="font-display text-2xl flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-gold" />
              Mon Panier
              {totalItems > 0 && (
                <span className="ml-auto text-xs font-sans bg-gold/10 text-gold px-2 py-1 rounded-full border border-gold/20">
                  {totalItems} {totalItems > 1 ? "articles" : "article"}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="font-display text-xl mb-2">Votre panier est vide</h3>
                <p className="text-sm text-muted-foreground mb-8">Découvrez notre catalogue pour trouver les meilleurs outils.</p>
                <Button variant="gold" onClick={() => onOpenChange(false)} className="rounded-full px-8">
                  Continuer mes achats
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full p-6">
                <div className="space-y-6">
                  {items.map((item) => {
                    const imgUrl = getProductImage(item.product.image_url);
                    return (
                      <div key={item.product.id} className="flex gap-4 group animate-fade-up">
                        <div className="h-20 w-20 rounded-xl bg-onyx border border-border overflow-hidden shrink-0">
                          {imgUrl ? (
                            <img 
                              src={getOptimizedUrl(imgUrl, { width: 200, height: 200, crop: "fill" })} 
                              alt={item.product.name} 
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-gold transition-colors">{item.product.name}</h4>
                          <button 
                            onClick={() => removeItem(item.product.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-tighter">{item.product.sku || "Sans SKU"}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-background transition-colors text-muted-foreground"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-background transition-colors text-muted-foreground"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="font-display text-base font-bold text-gold">
                            {(Number(item.product.price) * item.quantity).toLocaleString("fr-FR")} <span className="text-[10px] font-sans opacity-60">DA</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </ScrollArea>
            )}
          </div>

          {items.length > 0 && (
            <SheetFooter className="p-6 border-t border-border bg-muted/20 sm:flex-col gap-4">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{totalPrice.toLocaleString("fr-FR")} DA</span>
                </div>
                <div className="flex justify-between text-lg font-display font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-gold">{totalPrice.toLocaleString("fr-FR")} DA</span>
                </div>
              </div>
              <Button onClick={handleCheckout} className="w-full h-14 text-lg font-display bg-gold-gradient shadow-gold-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                Valider la commande <ArrowRight className="h-5 w-5" />
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <OrderModal 
        open={checkoutOpen} 
        onOpenChange={setCheckoutOpen} 
        isCart={true} 
      />
    </>
  );
};
