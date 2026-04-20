import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Check, X, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Testimonial = Tables<"testimonials">;

const AdminTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Avis Clients — Admin COG";
    load();
  }, []);

  const toggleApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ is_approved: approved })
      .eq("id", id);
    
    if (error) toast.error(error.message);
    else {
      toast.success(approved ? "Avis approuvé" : "Avis masqué");
      load();
    }
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);
    
    if (error) toast.error(error.message);
    else {
      toast.success("Avis supprimé");
      load();
    }
  };

  const pending = items.filter(i => !i.is_approved);
  const approved = items.filter(i => i.is_approved);

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Modération</p>
        <h1 className="font-display text-4xl">Avis Clients</h1>
      </header>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 bg-muted/20 border border-border">
          <TabsTrigger value="pending" className="relative">
            En attente
            {pending.length > 0 && (
              <span className="ml-2 bg-gold text-primary-foreground text-[10px] h-4 w-4 rounded-full flex items-center justify-center">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Publiés ({approved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
          ) : pending.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun avis en attente.</p>
            </div>
          ) : (
            pending.map(t => (
              <TestimonialCard 
                key={t.id} 
                testimonial={t} 
                onApprove={() => toggleApproval(t.id, true)} 
                onDelete={() => deleteTestimonial(t.id)} 
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approved.length === 0 ? (
             <div className="text-center py-20 border border-dashed border-border rounded-xl">
               <p className="text-muted-foreground">Aucun avis publié.</p>
             </div>
          ) : (
            approved.map(t => (
              <TestimonialCard 
                key={t.id} 
                testimonial={t} 
                onUnapprove={() => toggleApproval(t.id, false)} 
                onDelete={() => deleteTestimonial(t.id)} 
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TestimonialCard = ({ 
  testimonial, 
  onApprove, 
  onUnapprove, 
  onDelete 
}: { 
  testimonial: Testimonial; 
  onApprove?: () => void;
  onUnapprove?: () => void;
  onDelete: () => void;
}) => (
  <div className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-gold/30 transition-all group overflow-hidden relative shadow-sm">
    <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
      <div className="flex-1 w-full">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h3 className="font-display text-lg font-bold text-foreground">{testimonial.name}</h3>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < testimonial.rating ? "text-gold fill-gold" : "text-muted-foreground/20"}`} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase ml-auto sm:ml-0 font-medium">{new Date(testimonial.created_at).toLocaleDateString()}</p>
        </div>
        <p className="text-foreground/80 leading-relaxed italic border-l-2 border-gold/20 pl-4 py-1 text-sm sm:text-base">
          "{testimonial.comment}"
        </p>
      </div>

      <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-32 shrink-0">
        {onApprove && (
          <Button size="sm" variant="gold" onClick={onApprove} className="flex-1 sm:w-full h-10 sm:h-9">
            <Check className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Approuver</span><span className="sm:hidden">OK</span>
          </Button>
        )}
        {onUnapprove && (
          <Button size="sm" variant="outline" onClick={onUnapprove} className="flex-1 sm:w-full h-10 sm:h-9 border-gold/20 text-gold hover:bg-gold/5">
            <X className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Masquer</span><span className="sm:hidden">Cacher</span>
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDelete} className="flex-1 sm:w-full h-10 sm:h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
          <Trash2 className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Supprimer</span><span className="sm:hidden">Suppr.</span>
        </Button>
      </div>
    </div>
  </div>
);

export default AdminTestimonials;
