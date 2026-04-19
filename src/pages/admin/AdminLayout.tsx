import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, LogOut, Loader2, Menu, X, ChevronRight, MessageSquare, User, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-cqg.png";
import { PageTransition } from "@/components/PageTransition";

const links = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/admin/produits", label: "Produits", icon: Package },
  { to: "/admin/categories", label: "Catégories", icon: FolderTree },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag, badgeKey: 'orders' },
  { to: "/admin/temoignages", label: "Témoignages", icon: MessageSquare, badgeKey: 'testimonials' },
  { to: "/admin/galerie", label: "Galerie Photo", icon: ImageIcon },
  { to: "/admin/profil", label: "Profil", icon: User },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState<{ orders: number; testimonials: number }>({ orders: 0, testimonials: 0 });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/admin/login", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchCounts = async () => {
      const [ordersRes, testimonialsRes] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_approved', false)
      ]);
      
      setCounts({
        orders: ordersRes.count || 0,
        testimonials: testimonialsRes.count || 0
      });
    };

    if (user && isAdmin) {
      fetchCounts();
      // Optional: Refresh counts every 2 minutes
      const interval = setInterval(fetchCounts, 120000);
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  if (!user || !isAdmin) return null;

  const SidebarContent = () => (
    <>
      <div className="h-20 px-6 flex items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar shrink-0">
        <Link to="/" className="flex items-center gap-2">
           <img src={logo} alt="CQG" className="h-10 w-auto" height={40} />
           <span className="font-display text-xs tracking-widest text-gold font-bold">ADMIN</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-muted-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold">Menu Principal</p>
        {links.map((l) => {
          const count = l.badgeKey ? (counts as any)[l.badgeKey] : 0;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group",
                isActive
                  ? "bg-gold/10 text-gold border border-gold/20 shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <l.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-gold" : "text-muted-foreground")} />
                    <span>{l.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {count > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-primary-foreground animate-pulse-light shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                        {count}
                      </span>
                    )}
                    <ChevronRight className={cn("h-3 w-3 opacity-0 transition-all", isActive ? "opacity-40 translate-x-0" : "-translate-x-2")} />
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
        <div className="px-4 py-3 rounded-xl bg-muted/30 border border-border/50 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Session</p>
          <p className="text-xs font-medium truncate text-foreground">{user.email}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { signOut(); navigate("/admin/login"); }} 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 group transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3 group-hover:rotate-180 transition-transform duration-500" /> Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background animate-fade-in">
      {/* Mobile Top Header */}
      <header className="lg:hidden h-16 px-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
          <img src={logo} alt="CQG" className="h-8 w-auto" height={32} />
        </div>
        <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
          <span className="text-[10px] font-bold text-gold uppercase">{user.email?.[0]}</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-sidebar border-r border-sidebar-border flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300 lg:hidden",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 w-80 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-500 ease-spring",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent />
        </aside>
      </div>

      <main className="flex-1 w-full min-w-0">
        <div className="container p-4 md:p-8 lg:p-12">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
