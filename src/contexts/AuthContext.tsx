import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (uid: string) => {
    console.log("Checking admin role for UID:", uid);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin");
    
    if (error) {
      console.error("Error checking admin role:", error);
    }
    
    console.log("Admin role response:", data);
    setIsAdmin(Array.isArray(data) && data.length > 0);
    return Array.isArray(data) && data.length > 0;
  };

  useEffect(() => {
    let mounted = true;

    async function syncAuth(sess: Session | null) {
      if (!mounted) return;
      
      setSession(sess);
      setUser(sess?.user ?? null);
      
      if (sess?.user) {
        // Only show loading if we don't know the status yet
        if (!isAdmin) setLoading(true);
        console.log("Syncing admin for:", sess.user.id);
        await checkAdmin(sess.user.id);
        if (mounted) setLoading(false);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (mounted) syncAuth(sess);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (mounted) syncAuth(sess);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
