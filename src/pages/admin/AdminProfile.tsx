import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, KeyRound, Bot, Save, ExternalLink } from "lucide-react";

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [savingAuth, setSavingAuth] = useState(false);

  const [authForm, setAuthForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthForm(prev => ({ ...prev, email: user.email || "" }));
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authForm.newPassword && authForm.newPassword !== authForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setSavingAuth(true);
    const updates: any = {};
    if (authForm.newPassword) updates.password = authForm.newPassword;

    const { error } = await supabase.auth.updateUser(updates);

    setSavingAuth(false);
    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      toast.success("Vos informations ont été mises à jour");
      setAuthForm(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
    }
  };


  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Mon Profil</h1>
        <p className="text-muted-foreground mt-1">Gérez votre compte et les notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- Card 1: Auth Settings --- */}
        <form onSubmit={handleUpdateAuth} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="h-10 w-10 rounded-lg bg-onyx flex items-center justify-center border border-border">
              <KeyRound className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Sécurité du Compte</h2>
              <p className="text-xs text-muted-foreground">Modifier votre mot de passe</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email (Lecture seule)</Label>
              <Input 
                id="email" 
                type="email" 
                value={authForm.email} 
                className="bg-muted/50"
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-pwd">Nouveau mot de passe</Label>
              <Input 
                id="new-pwd" 
                type="password" 
                placeholder="Laissez vide pour ne pas changer"
                value={authForm.newPassword}
                onChange={e => setAuthForm(prev => ({...prev, newPassword: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-pwd">Confirmer le mot de passe</Label>
              <Input 
                id="confirm-pwd" 
                type="password" 
                placeholder="Répétez le nouveau mot de passe"
                value={authForm.confirmPassword}
                onChange={e => setAuthForm(prev => ({...prev, confirmPassword: e.target.value}))}
              />
            </div>
          </div>

          <Button type="submit" disabled={savingAuth} variant="gold" className="w-full">
            {savingAuth ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Mettre à jour mes accès
          </Button>
        </form>

        {/* --- Card 2: Telegram Settings --- */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="h-10 w-10 rounded-lg bg-onyx flex items-center justify-center border border-border">
              <Bot className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Bot Telegram</h2>
              <p className="text-xs text-muted-foreground">Accéder aux notifications (Commandes & Avis)</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Le bot Telegram centralise toutes les nouvelles commandes et témoignages clients en temps réel.
          </p>

          <Button asChild className="w-full bg-[#0088cc] text-white hover:bg-[#007AB8]">
            <a href="https://t.me/Tayebcqgbot" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir le Bot Telegram
            </a>
          </Button>
        </div>

      </div>
    </div>
  );
}
