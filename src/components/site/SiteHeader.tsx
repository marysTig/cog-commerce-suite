import { Link, NavLink } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-cqg.png";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/categories", label: "Catégories" },
  { to: "/contact", label: "Contact" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-background/80">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="CQG — Comptoir Quincaillerie Générale"
            className="h-14 w-auto transition-transform duration-500 group-hover:scale-105"
            height={56}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-300 relative",
                  isActive ? "text-gold" : "text-foreground/70 hover:text-gold"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-8 bg-gold-gradient" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/catalogue"
            className="hidden md:inline-flex items-center justify-center h-10 w-10 rounded-full border border-border hover:border-gold/50 hover:text-gold transition-colors"
            aria-label="Rechercher"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            className="md:hidden h-10 w-10 inline-flex items-center justify-center"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 text-sm font-medium uppercase tracking-wide rounded-md transition-colors",
                    isActive ? "text-gold bg-card" : "text-foreground/70"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
