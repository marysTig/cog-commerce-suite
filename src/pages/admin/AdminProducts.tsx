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

type Product = Tables<"products">;
type Category = Tables<"categories">;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);

const empty = { name: "", slug: "", description: "", price: 0, category_id: "", image_url: "", in_stock: true, featured: false };

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p, category_id: p.category_id ?? "", description: p.description ?? "", image_url: p.image_url ?? "" });
    setOpen(true);
  };

  const handleImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error("Upload échoué: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm({ ...form, image_url: data.publicUrl });
    setUploading(false);
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
      image_url: form.image_url || null,
      in_stock: form.in_stock,
      featured: form.featured,
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
    <div className="p-8 max-w-7xl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Catalogue</p>
          <h1 className="font-display text-4xl">Produits</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={openNew}><Plus className="h-4 w-4" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-gold">{editing ? "Modifier" : "Nouveau"} produit</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="space-y-4">
              <div>
                <Label>Image</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-24 w-24 rounded-md bg-onyx border border-border overflow-hidden flex items-center justify-center">
                    {form.image_url ? <img src={form.image_url} alt="" className="h-full w-full object-cover" /> : <ImageOff className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])} />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin text-gold" />}
                </div>
              </div>
              <div>
                <Label>Nom *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix (DA) *</Label>
                  <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
                  <span className="text-sm">En stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                  <span className="text-sm">Vedette</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Annuler</Button>
                <Button type="submit" variant="gold" disabled={saving} className="flex-1">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Aucun produit. Ajoutez-en un pour commencer.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Image</th>
                <th className="p-4">Nom</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Stock</th>
                <th className="p-4 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <div className="h-12 w-12 rounded bg-onyx overflow-hidden flex items-center justify-center">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ImageOff className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{p.name}</div>
                    {p.featured && <span className="text-[10px] uppercase tracking-wider text-gold">★ Vedette</span>}
                  </td>
                  <td className="p-4 font-display text-gold">{Number(p.price).toLocaleString("fr-FR")} DA</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.in_stock ? "bg-gold/15 text-gold" : "bg-destructive/15 text-destructive"}`}>
                      {p.in_stock ? "En stock" : "Rupture"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
