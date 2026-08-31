import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PasswordModal({ onClose }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="veil open" style={{ zIndex: 9999 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400, width: '100%' }}>
        <div className="mhead">
          <div>
            <h2 style={{ margin: 0 }}>Change Password</h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={loading} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--dim)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="mbody" style={{ padding: '24px' }}>
          {success ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--accent)' }}>
              <h3 style={{ marginBottom: 8 }}>Password Updated!</h3>
              <p>Your password has been securely changed.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="fld">
                <label>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div className="fld">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              {errorMsg && <p className="err" style={{ display: 'block' }}>{errorMsg}</p>}

              <div className="modal-footer" style={{ marginTop: '16px' }}>
                <button type="submit" className="btn pri" disabled={loading} style={{ width: '100%', margin: 0 }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
