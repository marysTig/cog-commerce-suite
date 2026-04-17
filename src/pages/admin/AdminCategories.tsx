import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Category = Tables<"categories">;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminCategories = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("name");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { document.title = "Catégories — Admin COG"; load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", description: "" }); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, description: c.description ?? "" }); setOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: editing?.slug || slugify(form.name),
      description: form.description.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Catégorie mise à jour" : "Catégorie créée");
    setOpen(false);
    load();
  };

  const remove = async (c: Category) => {
    if (!confirm(`Supprimer "${c.name}" ?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimée"); load(); }
  };

  return (
    <div className="p-8 max-w-5xl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Organisation</p>
          <h1 className="font-display text-4xl">Catégories</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gold" onClick={openNew}><Plus className="h-4 w-4" /> Ajouter</Button></DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader><DialogTitle className="font-display text-2xl text-gold">{editing ? "Modifier" : "Nouvelle"} catégorie</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-4">
              <div>
                <Label>Nom *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Annuler</Button>
                <Button type="submit" variant="gold" disabled={saving} className="flex-1">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}Enregistrer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Aucune catégorie pour l'instant.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-6 hover:border-gold/40 transition-colors">
              <h3 className="font-display text-xl text-foreground">{c.name}</h3>
              {c.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>}
              <div className="mt-4 flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /> Modifier</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(c)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
