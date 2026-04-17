import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, MessageCircle, Check } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const WHATSAPP_NUMBER = "213792425656";

const orderSchema = z.object({
  customer_name: z.string().trim().min(2, "Nom trop court").max(100),
  customer_phone: z.string().trim().min(6, "Téléphone invalide").max(30),
  customer_address: z.string().trim().min(3, "Adresse trop courte").max(500),
  quantity: z.number().int().min(1).max(1000),
  notes: z.string().max(500).optional(),
});

interface Props {
  product: Tables<"products">;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const OrderModal = ({ product, open, onOpenChange }: Props) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    quantity: 1,
    notes: "",
  });

  const total = Number(product.price) * form.quantity;

  const buildWhatsAppMessage = () =>
    encodeURIComponent(
      `*Nouvelle commande COG*\n\n` +
      `🔹 Produit : ${product.name}\n` +
      `🔹 Quantité : ${form.quantity}\n` +
      `🔹 Prix unitaire : ${Number(product.price).toLocaleString("fr-FR")} DA\n` +
      `🔹 *Total : ${total.toLocaleString("fr-FR")} DA*\n\n` +
      `👤 ${form.customer_name}\n` +
      `📞 ${form.customer_phone}\n` +
      `📍 ${form.customer_address}` +
      (form.notes ? `\n📝 ${form.notes}` : "")
    );

  const submit = async (sendWhatsApp: boolean) => {
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("orders").insert({
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone,
      customer_address: parsed.data.customer_address,
      quantity: parsed.data.quantity,
      total,
      notes: parsed.data.notes || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Erreur lors de l'enregistrement: " + error.message);
      return;
    }

    setSuccess(true);
    toast.success("Commande enregistrée !");

    if (sendWhatsApp) {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`, "_blank");
    }

    setTimeout(() => {
      onOpenChange(false);
      setSuccess(false);
      setForm({ customer_name: "", customer_phone: "", customer_address: "", quantity: 1, notes: "" });
    }, 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-gold">Commander</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {product.name} — {Number(product.price).toLocaleString("fr-FR")} DA
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-12 flex flex-col items-center text-center animate-scale-in">
            <div className="h-16 w-16 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold-glow">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl mt-4">Merci !</h3>
            <p className="text-muted-foreground text-sm mt-2">Nous vous contacterons rapidement.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submit(false); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input id="name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input id="phone" type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Adresse de livraison *</Label>
              <Textarea id="address" rows={2} value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="qty">Quantité *</Label>
              <Input id="qty" type="number" min={1} max={1000} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} required />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-md bg-onyx border border-border">
              <span className="text-sm uppercase tracking-wider text-muted-foreground">Total</span>
              <span className="font-display text-2xl text-gold">{total.toLocaleString("fr-FR")} DA</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button type="submit" variant="gold" disabled={loading} className="flex-1">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Commander
              </Button>
              <Button type="button" variant="whatsapp" disabled={loading} onClick={() => submit(true)} className="flex-1">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
