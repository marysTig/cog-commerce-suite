import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, MapPin, MessageCircle, Trash2, Printer } from "lucide-react";
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
import logoUrl from "@/assets/logo-cqg.png";

type OrderItem = Tables<"order_items">;
type Order = Tables<"orders"> & { order_items: OrderItem[] };

const statusStyles: Record<string, string> = {
  pending: "bg-gold/15 text-gold border-gold/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};
const statusLabels: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", delivered: "Livrée", cancelled: "Annulée",
};
const statusColors: Record<string, string> = {
  pending: "#c8a84b",
  confirmed: "#3b82f6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

// ─── Print bon de commande ───────────────────────────────────────────────────
function printOrder(order: Order) {
  const items: OrderItem[] =
    order.order_items && order.order_items.length > 0
      ? order.order_items
      : [
          {
            id: order.id,
            created_at: order.created_at,
            order_id: order.id,
            product_id: order.product_id ?? null,
            product_name: order.product_name ?? "—",
            product_price: order.product_price ?? 0,
            quantity: order.quantity ?? 1,
            total: order.total ?? 0,
          } as OrderItem,
        ];

  const orderDate = new Date(order.created_at).toLocaleDateString("fr-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const orderTime = new Date(order.created_at).toLocaleTimeString("fr-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusLabel = statusLabels[order.status] ?? order.status;
  const statusColor = statusColors[order.status] ?? "#888";

  const rowsHtml = items
    .map(
      (item, i) => `
      <tr class="${i % 2 === 0 ? "row-even" : "row-odd"}">
        <td class="td-left">${item.product_name}</td>
        <td class="td-center">${Number(item.product_price).toLocaleString("fr-FR")} DA</td>
        <td class="td-center">${item.quantity}</td>
        <td class="td-right bold gold">${Number(item.total).toLocaleString("fr-FR")} DA</td>
      </tr>`
    )
    .join("");

  const notesHtml = order.notes
    ? `<div class="notes-box"><span class="notes-label">Remarques :</span> ${order.notes}</div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Bon de Commande — ${order.id.slice(0, 8).toUpperCase()}</title>
  <style>
    /* ── Reset & base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #f5f5f0;
      color: #1a1a1a;
      min-height: 100vh;
      padding: 40px 24px;
    }

    /* ── Page wrapper ── */
    .page {
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.14);
    }

    /* ── Header band ── */
    .header-band {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 60%, #1a1a1a 100%);
      padding: 32px 40px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .header-logo img {
      height: 70px;
      width: auto;
      display: block;
    }
    .header-info {
      text-align: right;
    }
    .header-company {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
    }
    .header-tagline {
      font-size: 11px;
      color: #aaa;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .header-contacts {
      font-size: 11.5px;
      color: #ccc;
      line-height: 1.8;
    }
    .header-contacts span {
      color: #d4af37;
      margin-right: 4px;
    }

    /* ── Gold divider ── */
    .gold-divider {
      height: 3px;
      background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37);
    }

    /* ── Document title bar ── */
    .doc-title-bar {
      background: #f9f6ee;
      border-bottom: 1px solid #e8e1cc;
      padding: 18px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .doc-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: 0.02em;
    }
    .doc-meta {
      text-align: right;
      font-size: 11.5px;
      color: #777;
      line-height: 1.8;
    }
    .doc-meta strong {
      color: #1a1a1a;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 1.5px solid;
      margin-top: 6px;
    }

    /* ── Body content ── */
    .body {
      padding: 32px 40px;
    }

    /* ── Client card ── */
    .section-label {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #d4af37;
      margin-bottom: 10px;
    }
    .client-card {
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-left: 4px solid #d4af37;
      border-radius: 8px;
      padding: 16px 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
      margin-bottom: 28px;
    }
    .client-field label {
      display: block;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .client-field p {
      font-size: 13.5px;
      font-weight: 600;
      color: #1a1a1a;
    }

    /* ── Items table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 20px;
    }
    thead tr {
      background: #1a1a1a;
      color: #d4af37;
    }
    thead th {
      padding: 10px 14px;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .th-left  { text-align: left; border-radius: 6px 0 0 0; }
    .th-center { text-align: center; }
    .th-right { text-align: right; border-radius: 0 6px 0 0; }

    .row-even { background: #fff; }
    .row-odd  { background: #fafafa; }
    .td-left   { text-align: left;   padding: 11px 14px; color: #1a1a1a; font-weight: 500; }
    .td-center { text-align: center; padding: 11px 14px; color: #555; }
    .td-right  { text-align: right;  padding: 11px 14px; }
    .bold { font-weight: 700; }
    .gold { color: #b8920f; }
    tr:not(:last-child) td { border-bottom: 1px solid #efefef; }

    /* ── Total row ── */
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .total-box {
      background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
      color: #fff;
      border-radius: 10px;
      padding: 16px 24px;
      min-width: 220px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .total-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #aaa;
    }
    .total-amount {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      color: #d4af37;
    }
    .total-currency {
      font-size: 12px;
      font-family: 'Inter', sans-serif;
      color: #aaa;
      margin-left: 4px;
    }

    /* ── Notes ── */
    .notes-box {
      background: #fffbef;
      border: 1px solid #e8d98a;
      border-left: 4px solid #d4af37;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 12.5px;
      color: #555;
      font-style: italic;
      margin-bottom: 24px;
    }
    .notes-label {
      font-style: normal;
      font-weight: 700;
      color: #b8920f;
    }

    /* ── Footer ── */
    .footer {
      border-top: 1px solid #eee;
      padding: 20px 40px;
      background: #fafaf8;
      text-align: center;
    }
    .footer-text {
      font-size: 11px;
      color: #aaa;
      letter-spacing: 0.05em;
    }
    .footer-gold {
      color: #d4af37;
      font-weight: 700;
    }

    /* ── Print styles ── */
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header-band">
      <div class="header-logo">
        <img src="${logoUrl}" alt="CQG Logo" />
      </div>
      <div class="header-info">
        <div class="header-company">Comptoir Quincaillerie Générale</div>
        <div class="header-tagline">Chebaa — Algérie</div>
        <div class="header-contacts">
          <span>✆</span> +213 XXX XXX XXX<br/>
          <span>@</span> contact@cog-chebaa.dz<br/>
          <span>⌂</span> Chebaa, Algérie
        </div>
      </div>
    </div>
    <div class="gold-divider"></div>

    <!-- Document Title Bar -->
    <div class="doc-title-bar">
      <div class="doc-title">Bon de Commande</div>
      <div class="doc-meta">
        <strong>N° ${order.id.slice(0, 8).toUpperCase()}</strong><br/>
        ${orderDate} à ${orderTime}<br/>
        <span class="status-badge" style="color:${statusColor}; border-color:${statusColor}; background:${statusColor}18;">
          ${statusLabel}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Client info -->
      <div class="section-label">Informations client</div>
      <div class="client-card">
        <div class="client-field">
          <label>Nom complet</label>
          <p>${order.customer_name}</p>
        </div>
        <div class="client-field">
          <label>Téléphone</label>
          <p>${order.customer_phone}</p>
        </div>
        <div class="client-field" style="grid-column: 1 / -1;">
          <label>Adresse de livraison</label>
          <p>${order.customer_address}</p>
        </div>
      </div>

      <!-- Items table -->
      <div class="section-label">Détail de la commande</div>
      <table>
        <thead>
          <tr>
            <th class="th-left">Produit</th>
            <th class="th-center">Prix unitaire</th>
            <th class="th-center">Qté</th>
            <th class="th-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Total -->
      <div class="total-row">
        <div class="total-box">
          <span class="total-label">Montant Total</span>
          <span class="total-amount">
            ${Number(order.total).toLocaleString("fr-FR")}
            <span class="total-currency">DA</span>
          </span>
        </div>
      </div>

      ${notesHtml}

    </div><!-- /body -->

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        Merci pour votre confiance —
        <span class="footer-gold">Comptoir Quincaillerie Générale Chebaa</span><br/>
        Document généré le ${new Date().toLocaleString("fr-DZ")}
      </p>
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  <\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    toast.error("Veuillez autoriser les pop-ups pour imprimer.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ─── Component ───────────────────────────────────────────────────────────────
const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
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
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Gestion</p>
          <h1 className="font-display text-4xl">Commandes</h1>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
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
              <div className="flex flex-col lg:flex-row lg:items-start gap-6 justify-between">
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
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Détail commande</p>
                    <div className="bg-onyx rounded-md border border-border divide-y divide-border/50 overflow-hidden">
                      {o.order_items && o.order_items.length > 0 ? (
                        o.order_items.map((item) => (
                          <div key={item.id} className="p-3 flex justify-between items-center gap-4 hover:bg-white/5 transition-colors">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × {Number(item.product_price).toLocaleString("fr-FR")} DA
                              </p>
                            </div>
                            <p className="text-sm font-bold text-gold shrink-0">
                              {Number(item.total).toLocaleString("fr-FR")} DA
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3">
                          <p className="text-sm font-medium text-foreground">{o.product_name}</p>
                          <p className="text-xs text-muted-foreground">{o.quantity} × {Number(o.product_price).toLocaleString("fr-FR")} DA</p>
                        </div>
                      )}
                    </div>
                    {o.notes && <p className="text-sm mt-3 px-3 py-2 bg-muted/30 rounded border-l-2 border-gold text-muted-foreground italic">"{o.notes}"</p>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 uppercase tracking-tighter opacity-60">ID: {o.id.slice(0,8)} — {new Date(o.created_at).toLocaleString("fr-FR")}</p>
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

                  {/* Imprimer bon de commande */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/60 transition-colors"
                    onClick={() => printOrder(o)}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimer bon
                  </Button>

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
