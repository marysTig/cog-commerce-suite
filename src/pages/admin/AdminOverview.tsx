import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Package, FolderTree, ShoppingBag, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-gold/15 text-gold border-gold/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const AdminOverview = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, pending: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Dashboard — COG Admin";
    (async () => {
      const [{ count: products }, { count: categories }, { count: orders }, { count: pending }, { data: recentOrders }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
      ]);
      setStats({ products: products || 0, categories: categories || 0, orders: orders || 0, pending: pending || 0 });
      setRecent(recentOrders || []);
    })();
  }, []);

  const cards = [
    { label: "Produits", value: stats.products, icon: Package },
    { label: "Catégories", value: stats.categories, icon: FolderTree },
    { label: "Commandes totales", value: stats.orders, icon: ShoppingBag },
    { label: "En attente", value: stats.pending, icon: Clock, accent: true },
  ];

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Tableau de bord</p>
        <h1 className="font-display text-4xl">Vue d'ensemble</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className={cn(
            "bg-card border rounded-lg p-6",
            c.accent ? "border-gold/40 shadow-gold-glow" : "border-border"
          )}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                <p className="font-display text-4xl mt-3 text-gold">{c.value}</p>
              </div>
              <c.icon className={cn("h-5 w-5", c.accent ? "text-gold" : "text-muted-foreground")} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xl">Commandes récentes</h2>
          <Link to="/admin/commandes" className="text-xs uppercase tracking-wider text-gold hover:underline">Tout voir →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucune commande pour l'instant.</p>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((o) => (
              <div key={o.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{o.customer_name} <span className="text-muted-foreground font-normal">— {o.product_name}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString("fr-FR")} • Qté {o.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-gold">{Number(o.total).toLocaleString("fr-FR")} DA</p>
                  <Badge className={cn("mt-1 text-[10px] border", statusStyles[o.status])}>{statusLabels[o.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
