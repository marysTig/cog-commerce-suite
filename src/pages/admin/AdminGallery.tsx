import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, GripVertical, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
  display_order: number;
}

const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement de la galerie");
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Galerie Photo — Admin COG";
    loadImages();
  }, []);

  const handleUploadFiles = async (files: FileList) => {
    setUploading(true);
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i]);
        const { error } = await supabase
          .from("gallery_images")
          .insert({ image_url: url });
          
        if (error) throw error;
        successCount++;
      } catch (error: any) {
        toast.error(`Échec pour l'image ${i + 1}: ${error.message}`);
      }
    }
    
    if (successCount > 0) {
      toast.success(`${successCount} photo(s) ajoutée(s) à la galerie !`);
      loadImages();
    }
    setUploading(false);
  };

  const removeImage = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette photo de la galerie publique ?")) return;
    
    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);
      
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Photo retirée !");
      setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-7xl animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Interface Client</p>
          <h1 className="font-display text-4xl">Galerie Photo</h1>
          <p className="text-sm text-muted-foreground mt-2">Gérez le mur d'images qui s'affiche au-dessus du footer.</p>
        </div>
        
        <div>
          <label className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-primary-foreground px-4 py-2 rounded-md font-medium cursor-pointer shadow-gold-glow transition-all">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ajouter des photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUploadFiles(e.target.files);
                }
              }}
            />
          </label>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-muted/5 flex flex-col items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-display text-xl mb-1">Votre galerie est vide</h3>
          <p className="text-sm text-muted-foreground">Téléchargez de belles photos de votre magasin ou réalisations.</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {images.map((img) => (
            <div key={img.id} className="relative group break-inside-avoid rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-gold-glow transition-all duration-300">
              <img 
                src={img.image_url} 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" 
                alt="Galerie"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="rounded-full shadow-lg"
                  onClick={() => removeImage(img.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
