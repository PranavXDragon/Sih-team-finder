import './Navbar.css';
import { useSIH } from "../hooks/useSIH";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const { theme, toggleTheme, user } = useSIH();

  return (
    <>
      <header className="top nav-top">
        <div className="nav-logos">
          <img src="/SIH2026-logo.png" alt="SIH 2026 Logo" className="sih-logo-img" />
          <div style={{ width: 1, height: 32, background: "#ddd", margin: "0 4px" }} />
          <a href="#" title="Suryodaya Home" style={{ display: 'flex' }}>
            <img src="/Society.png" alt="Society Logo" />
          </a>
          <img src="/Academic.png" alt="Academic Logo" />
        </div>

        <span className="sp" />
        {!user ? (
          <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
            <button className="btn sm profile-btn" type="button" onClick={() => document.dispatchEvent(new CustomEvent('triggerAuth', { detail: 'signin' }))} style={{ margin: 0 }}>Sign In</button>
            <button className="btn sm" type="button" onClick={() => document.dispatchEvent(new CustomEvent('triggerAuth', { detail: 'signup' }))} style={{ margin: 0 }}>Sign Up</button>
          </div>
        ) : (
          <div style={{ marginRight: '12px' }}>
            <ProfileDropdown />
          </div>
        )}
        <button className="iconbtn" type="button" onClick={toggleTheme} title="Toggle Theme" style={{ width: 34, height: 34, borderRadius: 100 }}>
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </header>
    </>
  );
}

