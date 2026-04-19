import { Link, NavLink } from "react-router-dom";
import { Menu, X, Search, Phone, MapPin, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo-cqg.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "./CartDrawer";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/categories", label: "Catégories" },
  { to: "/contact", label: "Contact" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [open]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled ? "h-16 border-b border-border/60 backdrop-blur-xl bg-background/90 shadow-lg" : "h-20 bg-transparent"
      )}
    >
      <div className="container h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src={logo}
            alt="CQG"
            className={cn("w-auto transition-all duration-500", scrolled ? "h-10" : "h-12 md:h-14")}
            height={56}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 relative group",
                  isActive ? "text-gold" : "text-foreground/60 hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-gold-gradient transition-all duration-300",
                    isActive ? "w-8 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-50"
                  )} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/catalogue"
            className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full border border-border/50 hover:border-gold/50 hover:text-gold transition-all duration-300 hover:shadow-gold-glow"
            aria-label="Rechercher"
          >
            <Search className="h-4 w-4" />
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-border/50 hover:border-gold/50 hover:text-gold transition-all duration-300 hover:shadow-gold-glow relative group"
              aria-label="Panier"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] flex items-center justify-center bg-gold-gradient text-[10px] font-bold text-primary-foreground rounded-full px-1 border border-background animate-pulse-light">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          
          <Button asChild variant="gold" size="sm" className="hidden md:flex shadow-gold-glow">
            <Link to="/contact">Estimation</Link>
          </Button>

          <button
             onClick={() => setOpen(!open)}
             className="lg:hidden p-2 rounded-lg bg-card/40 border border-border/50 text-foreground relative z-[60]"
             aria-label="Menu"
          >
            {open ? <X className="h-6 w-6 animate-in spin-in-90 duration-300" /> : <Menu className="h-6 w-6 animate-in fade-in duration-300" />}
          </button>
        </div>
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-[55] bg-background/98 backdrop-blur-2xl transition-all duration-700 lg:hidden flex flex-col",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-full"
      )}>
        <div className="container pt-24 flex-1 flex flex-col justify-between pb-12">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link, idx) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: `${idx * 100}ms` }}
                className={({ isActive }) =>
                  cn(
                    "text-4xl sm:text-5xl font-display font-bold transition-all duration-500 hover:text-gold hover:translate-x-4",
                    isActive ? "text-gold" : "text-foreground/40",
                    open ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className={cn(
            "space-y-8 pt-8 border-t border-border/50 transition-all duration-700 delay-500",
            open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          )}>
            <div className="grid gap-6">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-gold" />
                </div>
                <p className="text-sm font-medium">+213 0792 42 56 56</p>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-gold" />
                </div>
                <p className="text-sm font-medium">Bordj Bou Arreridj, Algérie</p>
              </div>
            </div>

            <div className="flex gap-4">
               <Button asChild variant="gold" className="flex-1 h-14 text-lg font-display">
                 <Link to="/catalogue" onClick={() => setOpen(false)}>Explorer le catalogue</Link>
               </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
