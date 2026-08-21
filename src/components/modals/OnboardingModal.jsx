import React from 'react';

export default function OnboardingModal({ onClose, onSelect }) {
  return (
    <div className="veil" style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="modal" style={{ maxWidth: 500, width: "100%", background: "var(--surface)", borderRadius: 24, padding: 32, border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Welcome to SIH Team Finder!</h2>
          <p style={{ color: "var(--dim)", fontSize: "1.05rem" }}>What are you looking to do today?</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          <button 
            onClick={() => onSelect('post-team')}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Create a Team</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--dim)", margin: 0 }}>I have an idea and I am looking for members to join my team.</p>
            </div>
          </button>

          <button 
            onClick={() => onSelect('list-seeker')}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Find a Team</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--dim)", margin: 0 }}>I want to join an existing team as a member.</p>
            </div>
          </button>

        </div>

        <button 
          onClick={onClose}
          style={{ display: "block", width: "100%", marginTop: 24, padding: 16, background: "transparent", border: "none", color: "var(--dim)", cursor: "pointer", fontWeight: 500 }}
          onMouseOver={(e) => e.currentTarget.style.color = "var(--text)"}
          onMouseOut={(e) => e.currentTarget.style.color = "var(--dim)"}
        >
          Skip for now, just browse the dashboard
        </button>

      </div>
    </div>
  );
}
