import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Package, FolderTree, ShoppingBag, Clock, Plus, Settings, ArrowUpRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Tableau de Bord — Admin COG";
    (async () => {
      try {
        const [{ count: products }, { count: categories }, { count: orders }, { count: pending }, { data: recentOrders }] = await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("categories").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
        ]);
        setStats({ products: products || 0, categories: categories || 0, orders: orders || 0, pending: pending || 0 });
        setRecent(recentOrders || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Produits", value: stats.products, icon: Package, color: "text-blue-400", bg: "bg-blue-500/5", to: "/admin/produits" },
    { label: "Catégories", value: stats.categories, icon: FolderTree, color: "text-emerald-400", bg: "bg-emerald-500/5", to: "/admin/categories" },
    { label: "Total Commandes", value: stats.orders, icon: ShoppingBag, color: "text-purple-400", bg: "bg-purple-500/5", to: "/admin/commandes" },
    { label: "En Attente", value: stats.pending, icon: Clock, color: "text-gold", bg: "bg-gold/5", to: "/admin/commandes?status=pending", accent: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8 md:mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-gold" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Gestion Centrale</p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Tableau de bord</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="gold" size="sm" className="shadow-gold-glow flex-1 sm:flex-none">
            <Link to="/admin/produits">
              <Plus className="h-4 w-4 mr-2" /> Nouveau
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hover:border-gold/40 flex-1 sm:flex-none">
            <Link to="/admin/categories">
              <FolderTree className="h-4 w-4 mr-2" /> Univers
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {cards.map((c) => (
          <Link 
            key={c.label} 
            to={c.to}
            className={cn(
              "group relative overflow-hidden bg-card border border-border rounded-2xl p-6 hover:border-gold/30 hover:shadow-luxe-hover transition-all duration-500",
              c.accent && "border-gold/20"
            )}
          >
            <div className={cn("absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700", c.color)}>
              <c.icon className="h-24 w-24" />
            </div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className={cn("p-2.5 rounded-xl", c.bg)}>
                <c.icon className={cn("h-5 w-5", c.color)} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{c.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="font-display text-4xl text-foreground font-bold">{c.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <h2 className="font-display text-xl font-semibold">Commandes récentes</h2>
              <Button asChild variant="ghost" size="sm" className="text-xs text-gold hover:text-gold-bright uppercase tracking-wider">
                <Link to="/admin/commandes">Tout voir <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
            {recent.length === 0 ? (
              <div className="p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Aucune commande pour l'instant.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((o) => (
                  <div key={o.id} className="p-5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate group-hover:text-gold transition-colors">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase">{o.id.split('-')[0]}</span>
                        <span>•</span>
                        <span>{new Date(o.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display text-lg font-bold text-foreground">{Number(o.total).toLocaleString("fr-FR")} DA</p>
                      <Badge variant="outline" className={cn("mt-1 text-[10px] px-2 py-0 border-0 font-semibold uppercase tracking-tighter", statusStyles[o.status])}>
                        {statusLabels[o.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-steel-gradient border border-gold/10 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="font-display text-xl mb-2">Gestion du stock</h3>
                <p className="text-sm text-muted-foreground mb-6">Mettez à jour vos produits et inventaires en quelques clics.</p>
                <Button asChild variant="gold" className="w-full">
                  <Link to="/admin/produits">Accéder au stock</Link>
                </Button>
              </div>
           </div>

           <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-gold" /> Paramètres rapides
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-not-allowed opacity-60">
                  <p className="text-xs font-medium">Maintenance du site</p>
                  <p className="text-[10px] text-muted-foreground mt-1 italic font-mono uppercase">Inactif</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-not-allowed opacity-60">
                  <p className="text-xs font-medium">Notifications SMS</p>
                  <p className="text-[10px] text-muted-foreground mt-1 italic font-mono uppercase">Non configuré</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
