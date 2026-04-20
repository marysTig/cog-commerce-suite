import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-cqg.png";

const AdminLogin = () => {
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Admin — COG";
    if (!loading && user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) toast.error(error);
    else toast.success("Connexion réussie");
  };

  const handleTechnicalReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Mémoire locale réinitialisée. Rechargement...");
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-gradient p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src={logo} alt="CQG — Comptoir Quincaillerie Générale" className="h-24 w-auto mx-auto" height={96} />
          <h1 className="font-display text-3xl text-gold mt-4">Espace Admin</h1>
          <p className="text-sm text-muted-foreground mt-2">Comptoir Quincaillerie Générale</p>
        </div>

        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-8 shadow-luxe space-y-5">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-gold" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
          </div>

          <Button type="submit" variant="gold" className="w-full" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Se connecter
          </Button>

          {user && !isAdmin && !loading && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-center animate-in fade-in slide-in-from-top-1 duration-500">
              <p className="text-sm font-bold text-destructive mb-1">Accès Admin Refusé</p>
              <p className="text-[10px] text-muted-foreground break-all font-mono">UID: {user.id}</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">Ce compte n'a pas les droits nécessaires.</p>
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 text-destructive h-auto p-0 text-[10px] uppercase tracking-widest font-bold"
                onClick={() => window.location.reload()}
              >
                Changer de compte
              </Button>
            </div>
          )}
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold transition-colors gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] text-muted-foreground/30 hover:text-destructive transition-colors uppercase tracking-[0.2em] font-bold"
            onClick={handleTechnicalReset}
          >
            Réinitialisation Technique (429 Error)
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
