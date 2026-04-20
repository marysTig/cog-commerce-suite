import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Hash, Eye, ExternalLink, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { uploadToCloudinary } from "@/lib/cloudinary";

type Category = Tables<"categories"> & { product_count?: number };

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminCategories = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "", image_url: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Persistence logic for mobile
  useEffect(() => {
    const draft = localStorage.getItem("cog_category_draft");
    if (draft) {
      try {
        const { form: savedForm, editing: savedEditing } = JSON.parse(draft);
        setForm(savedForm);
        setEditing(savedEditing);
        setOpen(true);
        localStorage.removeItem("cog_category_draft");
      } catch (e) {
        console.error("Category draft restore failed", e);
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      localStorage.setItem("cog_category_draft", JSON.stringify({ form, editing }));
    } else {
      localStorage.removeItem("cog_category_draft");
    }
  }, [form, open, editing]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: categories } = await supabase.from("categories").select("*").order("name");
      const { data: productCounts } = await supabase.from("products").select("category_id");
      
      const countsMap: Record<string, number> = {};
      productCounts?.forEach(p => {
        if (p.category_id) {
          countsMap[p.category_id] = (countsMap[p.category_id] || 0) + 1;
        }
      });

      setItems((categories || []).map(c => ({
        ...c,
        product_count: countsMap[c.id] || 0
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    document.title = "Gérer les Univers — Admin COG"; 
    load(); 
  }, []);

  const openNew = () => { 
    setEditing(null); 
    setForm({ name: "", description: "", image_url: "" }); 
    setOpen(true); 
  };
  
  const openEdit = (c: Category) => { 
    setEditing(c); 
    setForm({ name: c.name, description: c.description ?? "", image_url: c.image_url ?? "" }); 
    setOpen(true); 
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 5Mo"); return; }
    
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Image mise en ligne sur Cloudinary");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: editing?.slug || slugify(form.name),
        description: form.description.trim() || null,
        image_url: form.image_url || null,
      };
      
      const { error } = editing
        ? await supabase.from("categories").update(payload).eq("id", editing.id)
        : await supabase.from("categories").insert(payload);
        
      if (error) throw error;
      
      toast.success(editing ? "Catégorie mise à jour" : "Nouvelle catégorie créée");
      setOpen(false);
      load();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'univers "${c.name}" ? Cette action est irréversible.`)) return;
    
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) {
      toast.error("Suppression impossible : assurez-vous qu'aucun produit n'est lié à cette catégorie.");
    } else { 
      toast.success("Catégorie supprimée"); 
      load(); 
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8 md:mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-gold" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Organisation</p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Catégories & Univers</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={openNew} className="shadow-gold-glow">
              <Plus className="h-4 w-4 mr-2" /> Nouvel Univers
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="bg-card glass-card border-gold/10 sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-gold">
                {editing ? "Modifier l'univers" : "Créer un nouvel univers"}
              </DialogTitle>
              <DialogDescription>
                Définissez un nom et une image pour organiser vos produits.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={save} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nom de la catégorie *</Label>
                <Input 
                  id="cat-name"
                  placeholder="Ex: Outillage Électroportatif"
                  value={form.name} 
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} 
                  required 
                  className="bg-background/50 border-white/5 focus:border-gold/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea 
                  id="cat-desc"
                  placeholder="Brève présentation de cet univers..."
                  rows={3} 
                  value={form.description} 
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} 
                  className="bg-background/50 border-white/5 focus:border-gold/50"
                />
              </div>

              <div className="space-y-3">
                <Label>Image de couverture</Label>
                {form.image_url ? (
                  <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video">
                    <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setForm(prev => ({ ...prev, image_url: "" }))}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 rounded-xl py-12 cursor-pointer hover:border-gold/40 hover:bg-gold/5 transition-all group">
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-gold/10 transition-colors">
                      {uploading ? <Loader2 className="h-6 w-6 animate-spin text-gold" /> : <Upload className="h-6 w-6 text-muted-foreground group-hover:text-gold" />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{uploading ? "Téléversement..." : "Cliquer pour envoyer"}</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5Mo</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" variant="gold" disabled={saving || uploading} className="flex-1 shadow-gold-glow">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editing ? "Mettre à jour" : "Créer l'univers"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="h-10 w-10 animate-spin text-gold" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-card/30">
          <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="font-display text-xl text-muted-foreground">Aucun univers pour l'instant.</p>
          <Button variant="link" onClick={openNew} className="text-gold mt-2">Créer votre première catégorie</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div 
              key={c.id} 
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-luxe-hover transition-all duration-500 flex flex-col"
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-steel-gradient">
                    <FolderTree className="h-10 w-10 text-gold/20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                   <Button asChild variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg">
                      <Link to={`/categories`} target="_blank"><Eye className="h-3.5 w-3.5" /></Link>
                   </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border border-white/10 text-[10px] uppercase font-bold tracking-widest">
                    <Hash className="h-3 w-3 mr-1 text-gold" /> {c.product_count} produits
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors">{c.name}</h3>
                  {c.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed italic">{c.description}</p>}
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="hover:text-gold">
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Modifier
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(c)} className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
