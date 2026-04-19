import { Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { GallerySection } from "./GallerySection";
import { PageTransition } from "@/components/PageTransition";

export const SiteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <GallerySection />
      <SiteFooter />
    </div>
  );
};
