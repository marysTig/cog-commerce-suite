import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-cog.png";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-gradient p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src={logo} alt="COG" className="h-20 w-20 mx-auto" width={80} height={80} />
          <h1 className="font-display text-3xl text-gold mt-4">Espace Admin</h1>
          <p className="text-sm text-muted-foreground mt-2">COG Quincaillerie Chebaa</p>
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
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
