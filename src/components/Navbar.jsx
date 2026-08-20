import './Navbar.css';
import { useState } from "react";
import { useSIH } from "../hooks/useSIH";
import ProfileModal from "./modals/ProfileModal";

export default function Navbar() {
  const { theme, toggleTheme, user } = useSIH();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <header className="top nav-top">
        <div className="nav-logos">
          <img src="/Society.png" alt="Society Logo" />
          <img src="/Academic.png" alt="Academic Logo" />
          <div style={{ width: 1, height: 32, background: "var(--border)", margin: "0 4px" }} />
          <img src="/SIH2026-logo.png" alt="SIH 2026 Logo" className="sih-logo-img" />
        </div>
        <div className="nav-brand-text">
          <span className="college-name">
            Suryodaya College of Engineering & Technology
          </span>
          <div className="brand-sih-row">
            <a className="brand" href="#">
              <span>SIH <b>2026</b></span>
            </a>
            <span className="tag">Team Finder</span>
          </div>
        </div>
        <span className="sp" />
        {user && (
          <button 
            className="btn sm profile-btn" 
            type="button" 
            onClick={() => setShowProfile(true)} 
          >
            Profile
          </button>
        )}
        <button className="iconbtn" type="button" onClick={toggleTheme} title="Toggle Theme" style={{ width: 34, height: 34, borderRadius: 100 }}>
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </header>
      
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}

