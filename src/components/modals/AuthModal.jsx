import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (e) {
      setErrorMsg(e.message);
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        onSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ backdropFilter: "blur(8px)" }}>
      <div className="modal" style={{ maxWidth: 420, borderRadius: 24, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 24px 60px rgba(0,0,0,0.12)" }}>
        <div className="mhead" style={{ padding: "28px 28px 16px", borderBottom: "none", marginBottom: 0 }}>
          <div>
            <h2 style={{ fontSize: "28px", letterSpacing: "-0.03em" }}>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p style={{ marginTop: "6px", fontSize: "15px" }}>{isSignUp ? "Sign up to post teams and list yourself." : "Sign in to continue to the team board."}</p>
          </div>
          <button className="x" type="button" onClick={onClose} disabled={loading} style={{ background: "var(--bg)", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dim)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="mbody" style={{ padding: "0 28px 32px" }}>
          
          <button 
            type="button" 
            className="btn" 
            style={{ 
              width: "100%", 
              background: "var(--surface-2)", 
              color: "var(--text)", 
              border: "1px solid var(--border)", 
              marginBottom: "20px",
              padding: "12px",
              borderRadius: "14px",
              fontWeight: 600,
              fontSize: "15px",
              transition: "all 0.2s ease"
            }}
            onClick={handleGoogle}
            disabled={loading}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--border)"}
            onMouseOut={(e) => e.currentTarget.style.background = "var(--surface-2)"}
          >
            <svg style={{ width: 20, height: 20, marginRight: 10 }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "var(--dim)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "1px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ margin: "0 14px", opacity: 0.6 }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          <form onSubmit={handleEmail}>
            <div className="fld">
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--dim)", marginBottom: 6, display: "block" }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                disabled={loading} 
                style={{ padding: "14px 16px", borderRadius: "12px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "16px", width: "100%", color: "var(--text)" }}
                placeholder="you@college.edu"
              />
            </div>
            <div className="fld" style={{ marginTop: 16 }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--dim)", marginBottom: 6, display: "block" }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={6} 
                disabled={loading} 
                style={{ padding: "14px 16px", borderRadius: "12px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "16px", width: "100%", color: "var(--text)" }}
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div style={{ marginTop: 16, color: "var(--stop)", fontSize: "0.9rem", padding: "12px", background: "var(--stop-dim)", borderRadius: "10px", border: "1px solid rgba(255, 69, 107, 0.2)" }}>
                {errorMsg}
              </div>
            )}

            <button type="submit" className="btn pri" style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: "14px", fontSize: "16px", fontWeight: 700, letterSpacing: "0.5px" }} disabled={loading}>
              {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.95rem" }}>
            <span style={{ color: "var(--dim)" }}>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
            <button 
              type="button" 
              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", marginLeft: 8, fontWeight: 700, fontSize: "0.95rem" }}
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
