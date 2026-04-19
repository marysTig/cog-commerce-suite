import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
}

export const TestimonialTicker = () => {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data);
      });
  }, []);

  if (items.length === 0) return null;

  // Duplicate items for a seamless loop if needed
  const displayItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-onyx/30 border-y border-border/50 py-12 overflow-hidden relative group">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      
      <div className="flex animate-marquee whitespace-nowrap gap-8 items-center hover:[animation-play-state:paused]">
        {displayItems.map((t, idx) => (
          <div 
            key={`${t.id}-${idx}`} 
            className="inline-flex flex-col gap-3 min-w-[300px] max-w-[400px] p-6 rounded-2xl bg-card/40 border border-border/50"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < t.rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} 
                />
              ))}
            </div>
            <p className="text-sm text-foreground/90 whitespace-normal line-clamp-2 italic leading-relaxed">
              "{t.comment}"
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">
              {t.name}
            </p>
          </div>
        ))}
      </div>
      
      {/* CSS for Marquee in index.css will be needed */}
    </div>
  );
};
