import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedUrl } from "@/lib/cloudinary";

interface GalleryImage {
  id: string;
  image_url: string;
}

export const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    supabase
      .from("gallery_images")
      .select("id, image_url")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setImages(data);
      });
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-gold mb-3">En images</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground font-bold leading-tight">
            Notre <span className="text-gold">Galerie</span>
          </h2>
          <p className="text-muted-foreground mt-4">Plongez dans notre univers à travers ces réalisations et moments capturés.</p>
        </div>

        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {images.map((img, index) => (
            <div 
              key={img.id} 
              className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_40px_rgb(212,175,55,0.15)] border border-border hover:border-gold/30 transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={getOptimizedUrl(img.image_url, { width: 800, quality: 85 })}
                alt="Galerie COG"
                loading="lazy"
                className="w-full h-auto object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 select-none pointer-events-none">
                <div className="w-8 h-8 rounded-full border border-gold/50 flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 mb-2">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                </div>
                <p className="font-display text-xl text-foreground transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">COG Quincaillerie</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
