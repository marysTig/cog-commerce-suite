import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";

type Product = Tables<"products">;
type Category = Tables<"categories">;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);

type StockStatus = "in_stock" | "limited" | "out_of_stock";

const stockOptions: { value: StockStatus; label: string; color: string; dot: string }[] = [
  { value: "in_stock",     label: "En stock",     color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-emerald-500/30", dot: "bg-emerald-400" },
  { value: "limited",     label: "Stock limité", color: "bg-orange-500/15 text-orange-400 border-orange-500/30 ring-orange-500/30",   dot: "bg-orange-400" },
  { value: "out_of_stock",label: "Rupture",      color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30 ring-zinc-500/30",         dot: "bg-zinc-400" },
];

const getStockBadge = (status: string | null | undefined) => {
  const s = stockOptions.find(o => o.value === (status ?? "in_stock")) ?? stockOptions[0];
  return s;
};

const empty = { name: "", slug: "", description: "", price: 0, category_id: "", image_urls: [] as string[], stock_status: "in_stock" as StockStatus, featured: false, sku: "", stock_quantity: 0, is_promotion: false, old_price: 0 };

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Persistence logic for mobile (prevents losing form on camera-refresh)
  useEffect(() => {
    const draft = localStorage.getItem("cog_product_draft");
    if (draft) {
      try {
        const { form: savedForm, editing: savedEditing } = JSON.parse(draft);
        setForm(savedForm);
        setEditing(savedEditing);
        setOpen(true);
        // Clear it once restored so it doesn't pop up forever if they never save
        localStorage.removeItem("cog_product_draft");
      } catch (e) {
        console.error("Draft restore failed", e);
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      localStorage.setItem("cog_product_draft", JSON.stringify({ form, editing }));
    } else {
      localStorage.removeItem("cog_product_draft");
    }
  }, [form, open, editing]);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts(p || []);
    setCategories(c || []);
    setLoading(false);
  };

  useEffect(() => { document.title = "Produits — Admin COG"; load(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...empty }); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    let parsedUrls = [];
    try {
      if (p.image_url) {
        if (p.image_url.startsWith("[")) {
          parsedUrls = JSON.parse(p.image_url);
        } else {
          parsedUrls = [p.image_url];
        }
      }
    } catch {
      parsedUrls = p.image_url ? [p.image_url] : [];
    }
    const stockStatus: StockStatus = (p as any).stock_status === "limited" ? "limited" : (p as any).stock_status === "out_of_stock" ? "out_of_stock" : "in_stock";
    setForm({ 
      ...p, 
      category_id: p.category_id ?? "", 
      description: p.description ?? "", 
      image_urls: parsedUrls,
      sku: (p as any).sku ?? "",
      stock_quantity: (p as any).stock_quantity ?? 0,
      stock_status: stockStatus,
      is_promotion: (p as any).is_promotion ?? false,
      old_price: (p as any).old_price ?? 0,
    });
    setOpen(true);
  };

  const handleImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f: any) => ({ ...f, image_urls: [...(f.image_urls || []), url] }));
    } catch (error: any) {
      toast.error("Upload Cloudinary échoué: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((f: any) => {
      const newUrls = [...f.image_urls];
      newUrls.splice(index, 1);
      return { ...f, image_urls: newUrls };
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.price < 0) { toast.error("Nom et prix valides requis"); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: editing?.slug || slugify(form.name),
      description: form.description || null,
      price: form.price,
      category_id: form.category_id || null,
      image_url: form.image_urls && form.image_urls.length > 0 ? JSON.stringify(form.image_urls) : null,
      in_stock: form.stock_status !== "out_of_stock",
      featured: form.featured,
      sku: form.sku || null,
      stock_quantity: form.stock_quantity || 0,
      stock_status: form.stock_status,
      is_promotion: form.is_promotion,
      old_price: (form.is_promotion && form.old_price > 0) ? form.old_price : null,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Produit mis à jour" : "Produit ajouté");
    setOpen(false);
    load();
  };

  const remove = async (p: Product) => {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); load(); }
  };

  return (
    <div className="p-8 max-w-7xl animate-fade-in">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Catalogue</p>
          <h1 className="font-display text-4xl">Produits</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={openNew} className="shadow-gold-glow"><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent 
            className="max-w-2xl bg-card border-gold/10 max-h-[90vh] overflow-y-auto"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-gold">{editing ? "Modifier" : "Nouveau"} produit</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="space-y-6 pt-2">
              <div>
                <Label className="mb-3 block">Images du produit</Label>
                <div className="flex flex-wrap items-center gap-4">
                  {form.image_urls?.map((url: string, idx: number) => (
                    <div key={idx} className="relative h-24 w-24 rounded-xl bg-onyx border border-border overflow-hidden group">
                      <img src={url} alt={`Produit ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-background/80 backdrop-blur p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="h-24 w-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gold/50 transition-all hover:bg-gold/5">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        if (e.target.files) {
                          for (let i = 0; i < e.target.files.length; i++) {
                            await handleImage(e.target.files[i]);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Nom du produit *</Label>
                  <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Référence (SKU)</Label>
                   <Input placeholder="Ex: ART-123" value={form.sku} onChange={(e) => setForm(prev => ({ ...prev, sku: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix actuel (DA) *</Label>
                  <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={form.category_id || "none"} onValueChange={(v) => setForm(prev => ({ ...prev, category_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <Switch checked={form.is_promotion} onCheckedChange={(v) => setForm(prev => ({ ...prev, is_promotion: v }))} />
                  <span className="text-sm font-bold text-red-500 group-hover:text-red-400 transition-colors">🔥 Produit en promotion</span>
                </label>
                
                {form.is_promotion && (
                  <div className="space-y-2 pt-2 animate-fade-in">
                    <Label className="text-red-500">Ancien prix barré (DA) *</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={form.old_price} 
                      onChange={(e) => setForm(prev => ({ ...prev, old_price: parseFloat(e.target.value) || 0 }))} 
                      placeholder="Prix d'origine avant réduction"
                      className="border-red-500/30 focus-visible:ring-red-500"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quantité initiale en stock</Label>
                <Input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>

              <div className="space-y-4 py-2 border-y border-border/50">
                <div className="space-y-3">
                  <Label>Disponibilité</Label>
                  <div className="flex flex-wrap gap-2">
                    {stockOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, stock_status: opt.value }))}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200",
                          form.stock_status === opt.value
                            ? `${opt.color} ring-2 scale-105 shadow-md`
                            : "bg-muted/40 text-muted-foreground border-border hover:border-gold/40 hover:text-foreground"
                        )}
                      >
                        <span className={cn("h-2 w-2 rounded-full", form.stock_status === opt.value ? opt.dot : "bg-muted-foreground/50")} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <Switch checked={form.featured} onCheckedChange={(v) => setForm(prev => ({ ...prev, featured: v }))} />
                  <span className="text-sm font-medium group-hover:text-gold transition-colors">Mis en vedette</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Annuler</Button>
                <Button type="submit" variant="gold" disabled={saving} className="flex-1 shadow-gold-glow">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Enregistrer le produit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-muted/5">
          <p className="text-muted-foreground">Aucun produit. Ajoutez-en un pour commencer.</p>
        </div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid gap-4 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                <div className="h-20 w-20 rounded-lg bg-onyx border border-border overflow-hidden shrink-0 flex items-center justify-center">
                   {(() => {
                      try {
                        const urls = p.image_url ? JSON.parse(p.image_url) : [];
                        const firstUrl = Array.isArray(urls) ? urls[0] : p.image_url;
                        return firstUrl ? <img src={firstUrl} alt={p.name} className="h-full w-full object-cover" /> : <ImageOff className="h-4 w-4 text-muted-foreground" />;
                      } catch {
                        return p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ImageOff className="h-4 w-4 text-muted-foreground" />;
                      }
                    })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gold font-display font-bold">{Number(p.price).toLocaleString("fr-FR")} DA</p>
                    {(p as any).is_promotion && (p as any).old_price && (
                      <p className="text-[10px] text-muted-foreground line-through">{Number((p as any).old_price).toLocaleString("fr-FR")} DA</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-mono text-muted-foreground uppercase bg-muted px-1 py-0.5 rounded">
                      {p.sku || "Sans SKU"}
                    </span>
                    {(() => { const s = getStockBadge((p as any).stock_status); return (
                      <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border flex items-center gap-1", s.color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                        {s.label}
                      </span>
                    ); })()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet & Desktop View: Table */}
          <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    <th className="p-5">Images</th>
                    <th className="p-5">Identité & SKU</th>
                    <th className="p-5">Prix</th>
                    <th className="p-5">Stock Réel</th>
                    <th className="p-5">Statut</th>
                    <th className="p-5 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="p-5">
                        <div className="h-14 w-14 rounded-lg bg-onyx border border-border overflow-hidden flex items-center justify-center">
                          {(() => {
                            try {
                              const urls = p.image_url ? JSON.parse(p.image_url) : [];
                              const firstUrl = Array.isArray(urls) ? urls[0] : p.image_url;
                              return firstUrl ? <img src={firstUrl} alt={p.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <ImageOff className="h-4 w-4 text-muted-foreground" />;
                            } catch {
                              return p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <ImageOff className="h-4 w-4 text-muted-foreground" />;
                            }
                          })()}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-semibold text-foreground">{p.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded border border-border">
                            {p.sku || "Sans SKU"}
                          </span>
                          {p.featured && <span className="text-[10px] uppercase tracking-wider text-gold font-bold">★ Vedette</span>}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-display text-base text-foreground font-bold">
                          {Number(p.price).toLocaleString("fr-FR")} <span className="text-[10px] opacity-40 ml-0.5">DA</span>
                        </div>
                        {(p as any).is_promotion && (p as any).old_price && (
                          <div className="text-[10px] text-red-500/80 line-through mt-0.5 font-mono">
                            {Number((p as any).old_price).toLocaleString("fr-FR")} DA
                          </div>
                        )}
                      </td>
                      <td className="p-5">
                         <div className="font-mono text-lg">{p.stock_quantity ?? 0}</div>
                         <p className="text-[9px] uppercase text-muted-foreground tracking-tighter">Unités dispo</p>
                      </td>
                      <td className="p-5">
                        {(() => { const s = getStockBadge((p as any).stock_status); return (
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border", s.color)}>
                          <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                          {s.label}
                        </span>
                        ); })()}
                      </td>
                      <td className="p-5">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="hover:text-gold"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(p)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProducts;
