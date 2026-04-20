import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
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
  const syncInProgress = useRef<string | null>(null);
  const lastSessionToken = useRef<string | null>(null);

  const checkAdmin = async (uid: string) => {
    console.log("[Auth] Checking admin role for UID:", uid);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin");
      
      if (error) {
        console.error("[Auth] Error fetching user_roles:", error);
        return false;
      }
      
      const is_admin = Array.isArray(data) && data.length > 0;
      console.log("[Auth] Admin role status:", is_admin ? "VERIFIED" : "DENIED");
      setIsAdmin(is_admin);
      return is_admin;
    } catch (err) {
      console.error("[Auth] Critical error during admin check:", err);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function syncAuth(sess: Session | null) {
      if (!mounted) return;
      
      const token = sess?.access_token ?? null;
      const userId = sess?.user?.id ?? null;

      // Deduplication: If this session token was already processed, skip re-verification
      if (token === lastSessionToken.current && token !== null) {
        console.log("[Auth] Token unchanged, skipping sync.");
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);
        return;
      }

      // Guard: Prevent overlapping sync operations for the same token
      if (syncInProgress.current === token && token !== null) return;
      syncInProgress.current = token;
      
      console.log("[Auth] Session update detected. User ID:", userId || "none", "Email:", sess?.user?.email || "none");
      setSession(sess);
      setUser(sess?.user ?? null);
      
      if (sess?.user) {
        try {
          // Only show loading if we haven't verified this user yet
          if (!isAdmin) setLoading(true);
          const is_admin = await checkAdmin(sess.user.id);
          
          if (is_admin) {
            lastSessionToken.current = token;
            console.log("[Auth] Admin verification successful for:", sess.user.email);
          } else {
            console.warn("[Auth] Admin verification failed for UID:", sess.user.id);
          }
        } catch (err) {
          console.error("[Auth] Failed to sync admin status:", err);
        } finally {
          syncInProgress.current = null;
          if (mounted) {
            setLoading(false);
            console.log("[Auth] Sync complete, loading: false");
          }
        }
      } else {
        console.log("[Auth] No active session found.");
        lastSessionToken.current = null;
        syncInProgress.current = null;
        setIsAdmin(false);
        setLoading(false);
      }

    }

    // Get initial session
    console.log("[Auth] Starting initial session check...");
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      console.log("[Auth] Initial session check complete");
      if (mounted) syncAuth(sess);
    }).catch(err => {
      console.error("[Auth] Initial session error:", err);
      if (mounted) setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      console.log("[Auth] Auth state change event:", _event);
      // Throttle or debounce if needed, but deduplication by token should suffice
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
