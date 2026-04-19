import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ScrollToTop } from "@/components/ScrollToTop";

import Index from "./pages/Index";
import Catalogue from "./pages/Catalogue";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminGallery from "./pages/admin/AdminGallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
              <ScrollToTop />
              <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/produit/:slug" element={<ProductDetail />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="produits" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="commandes" element={<AdminOrders />} />
                <Route path="temoignages" element={<AdminTestimonials />} />
                <Route path="profil" element={<AdminProfile />} />
                <Route path="galerie" element={<AdminGallery />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
