import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, MapPin, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Order = Tables<"orders">;

const statusStyles: Record<string, string> = {
  pending: "bg-gold/15 text-gold border-gold/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};
const statusLabels: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", delivered: "Livrée", cancelled: "Annulée",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { document.title = "Commandes — Admin COG"; load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Statut mis à jour"); load(); }
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Commande supprimée"); load(); }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Gestion</p>
          <h1 className="font-display text-4xl">Commandes</h1>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmées</SelectItem>
            <SelectItem value="delivered">Livrées</SelectItem>
            <SelectItem value="cancelled">Annulées</SelectItem>
          </SelectContent>
        </Select>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Aucune commande.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-lg p-6 hover:border-gold/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-display text-xl">{o.customer_name}</h3>
                    <span className={cn("text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border", statusStyles[o.status])}>
                      {statusLabels[o.status]}
                    </span>
                  </div>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gold" /> {o.customer_phone}</p>
                    <p className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-gold mt-0.5" /> {o.customer_address}</p>
                  </div>
                  <div className="mt-4 p-3 bg-onyx rounded-md border border-border">
                    <p className="text-sm"><span className="text-muted-foreground">Produit :</span> <span className="text-foreground font-medium">{o.product_name}</span></p>
                    <p className="text-sm mt-1"><span className="text-muted-foreground">Quantité :</span> {o.quantity} × {Number(o.product_price).toLocaleString("fr-FR")} DA</p>
                    {o.notes && <p className="text-sm mt-2 text-muted-foreground italic">"{o.notes}"</p>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{new Date(o.created_at).toLocaleString("fr-FR")}</p>
                </div>

                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <p className="font-display text-3xl text-gold">{Number(o.total).toLocaleString("fr-FR")} <span className="text-sm font-sans">DA</span></p>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmée</SelectItem>
                      <SelectItem value="delivered">Livrée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild variant="whatsapp" size="sm">
                    <a href={`https://wa.me/${o.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-3.5 w-3.5" /> Contacter
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. La commande de {o.customer_name} sera définitivement supprimée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteOrder(o.id)} className="bg-destructive hover:bg-destructive/90">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
