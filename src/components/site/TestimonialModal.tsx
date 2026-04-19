import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Loader2, Check } from "lucide-react";
import { sendTelegramMessage } from "@/lib/telegram";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TestimonialModal = ({ open, onOpenChange }: Props) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ name: "", comment: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.comment.length < 5) {
      toast.error("Le commentaire est trop court");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("testimonials").insert({
      name: form.name || "Client Anonyme",
      comment: form.comment,
      rating,
      is_approved: false
    });

    setLoading(false);
    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      setSuccess(true);
      toast.success("Témoignage envoyé ! Il sera visible après modération.");
      
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      const escapeMd = (str: string) => str ? str.replace(/[_*[\]`]/g, '\\$&') : '';
      const actualName = form.name ? form.name : "Client Anonyme";
      
      const telegramMessage = `⭐ *Nouveau Témoignage !*
      
👤 *Nom:* ${escapeMd(actualName)}
⭐ *Note:* ${rating}/5
💬 *Avis:* ${escapeMd(form.comment)}

🔗 [Voir les témoignages](${origin}/admin/temoignages)`;

      sendTelegramMessage(telegramMessage);

      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setForm({ name: "", comment: "" });
        setRating(5);
      }, 2500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-gold">Laisser un avis</DialogTitle>
          <DialogDescription>
            Votre avis nous aide à nous améliorer et aide les autres clients.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-12 flex flex-col items-center text-center animate-scale-in">
            <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <Check className="h-8 w-8 text-gold" />
            </div>
            <h3 className="font-display text-xl mt-6">C'est envoyé !</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Merci pour votre retour. Votre avis sera publié après validation par notre équipe.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Note globale</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={`h-8 w-8 ${s <= rating ? "text-gold fill-gold" : "text-muted-foreground/20 hover:text-gold/40"}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-name">Votre nom</Label>
              <Input 
                id="t-name" 
                placeholder="Ex: Ahmed B." 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-comment">Votre commentaire *</Label>
              <Textarea 
                id="t-comment" 
                required 
                rows={4}
                placeholder="Partagez votre expérience avec COG..." 
                value={form.comment} 
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />
            </div>

            <Button type="submit" variant="gold" className="w-full h-12" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Envoyer mon avis
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
