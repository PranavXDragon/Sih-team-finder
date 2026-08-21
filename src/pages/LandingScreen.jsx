import './LandingScreen.css';
import { useState, useEffect } from "react";
import { useSIH } from "../hooks/useSIH";

const RULES = [
  "6 members","\u00B7","1 must be female","\u00B7","one institute","\u00B7","17 themes","\u00B7",
  "software or hardware","\u00B7","one problem statement","\u00B7",
  "6 members","\u00B7","1 must be female","\u00B7","one institute","\u00B7","17 themes","\u00B7",
  "software or hardware","\u00B7","one problem statement","\u00B7",
];

export default function LandingScreen({ onEnter }) {
  const { stats, session, myTeam, mySeekerProfile, addToast } = useSIH();
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date("2026-08-30T23:59:59").getTime();
    
    const tick = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const handleAction = (action) => {
    if (session) {
      if (action === "post-team") {
        if (myTeam) return addToast("You already have a team!", "err");
        if (mySeekerProfile) return addToast("You are already listed as a Seeker. Seekers cannot create teams.", "err");
      }
      if (action === "list-seeker") {
        if (myTeam) return addToast("You lead a team! Team Leaders cannot list themselves as seekers.", "err");
        if (mySeekerProfile) return addToast("You are already listed as a seeker!", "err");
      }
      onEnter(action);
    } else {
      localStorage.setItem('sih_intent', action);
      document.dispatchEvent(new CustomEvent('triggerAuth', { detail: 'signup' }));
    }
  };

  return (
    <div>
      {/* POSTER HERO */}
      <section className="poster" style={{ position: 'relative' }}>
        <div className="hero-bg-img"  aria-hidden="true" />
        <div className="poster-in" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-text-side">
            <div className="kicker-group">
              <span className="kicker">SMART INDIA HACKATHON <i>2026</i></span>
            </div>
            <h1 className="ph">
              <span className="l1">NO TEAM</span>
              <span className="l2">YET?</span>
              <span className="l3">THAT ENDS <br/>TODAY.</span>
            </h1>
            <p className="psub">
              Three seats filled, three still empty. That is what most SIH teams
              look like right now, and it is why good ideas die before the
              deadline. <b>Put your name up.</b> Free, and your number stays
              hidden until someone says yes.
            </p>
            <div className="landcta">
              <button className="big orange" type="button" onClick={() => handleAction("post-team")}>
                REGISTER TEAM
              </button>
              <button className="big blue" type="button" onClick={() => handleAction("list-seeker")}>
                JOIN A TEAM
              </button>
              <button className="big" type="button" style={{ background: "transparent", color: "var(--text)", border: "2px solid var(--text)" }} onClick={() => onEnter(null)}>
                EXPLORE TEAMS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-in">
          {RULES.map((r, i) => <span key={i}>{r}</span>)}
        </div>
      </div>

      {/* STAMPS */}
      <section className="stamps">
        <div className="stamp"><b>{stats.teams}</b><span>Teams up</span></div>
        <div className="stamp"><b>{stats.seats}</b><span>Seats open</span></div>
        <div className="stamp"><b>{stats.seekers}</b><span>Students free</span></div>
        <div className="stamp"><b>{stats.teams + stats.seekers}</b><span>Active Users</span></div>
      </section>

      {/* 3-STEP BEATS */}
      <section className="beats">
        <div className="beat">
          <em>01</em>
          <h3>Create your profile</h3>
          <p>Jump on the board by creating a quick profile. Add your skills, branch, and what kind of team you are looking for.</p>
        </div>
        <div className="beat">
          <em>02</em>
          <h3>Post or pick</h3>
          <p>Put up the seats you still need, or leave your name and skills so teams that need you can find you.</p>
        </div>
        <div className="beat">
          <em>03</em>
          <h3>Somebody says yes</h3>
          <p>Only after a team accepts you do the two of you see each other's WhatsApp. No numbers on the open board.</p>
        </div>
      </section>

      {/* SIH 2026 GUIDELINES & COUNTDOWN */}
      <section style={{ padding: 'clamp(40px, 8vw, 80px) 20px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--open-dim)', color: 'var(--open)', borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Hackathon Starts In
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40, fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 'clamp(14px, 4.5vw, 20px)', letterSpacing: '0.2em' }}>
            <div style={{ background: 'var(--lime)', color: 'var(--ink)', padding: '14px 24px', display: 'flex', alignItems: 'center' }}>
              SMART INDIA HACKATHON
            </div>
            <div style={{ background: 'var(--ink)', color: 'var(--lime)', padding: '14px 24px', display: 'flex', alignItems: 'center' }}>
              2026
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(timeLeft).map(([unit, val]) => (
              <div key={unit} style={{ background: 'linear-gradient(145deg, var(--surface), var(--surface-2))', padding: 'clamp(16px, 4vw, 24px) clamp(20px, 4vw, 32px)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 'clamp(80px, 22vw, 120px)', textAlign: 'center' }}>
                <b style={{ display: 'block', fontSize: 'clamp(36px, 10vw, 56px)', fontFamily: 'var(--poster)', color: 'var(--accent)', lineHeight: 1, marginBottom: 8 }}>{String(val).padStart(2, '0')}</b>
                <span style={{ fontSize: 13, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>{unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 30, fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 'clamp(14px, 4.5vw, 20px)', letterSpacing: '0.2em' }}>
            <div style={{ background: 'var(--lime)', color: 'var(--ink)', padding: '14px 24px', display: 'flex', alignItems: 'center' }}>
              OFFICIAL GUIDELINES
            </div>
            <div style={{ background: 'var(--ink)', color: 'var(--lime)', padding: '14px 24px', display: 'flex', alignItems: 'center' }}>
              2026
            </div>
          </div>
          <div style={{ display: 'grid', gap: 16, background: 'linear-gradient(145deg, var(--surface), var(--surface-2))', padding: 'clamp(20px, 5vw, 40px)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', width: '100%' }}>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text)', display: 'flex', alignItems: 'flex-start' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 12, marginTop: 2, color: "var(--accent)", flexShrink: 0}}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> <span><b style={{ color: 'var(--accent)' }}>Team Size:</b> Exactly 6 members (1 Team Leader + 5 Members).</span></p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text)', display: 'flex', alignItems: 'flex-start' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 12, marginTop: 2, color: "var(--accent)", flexShrink: 0}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> <span><b style={{ color: 'var(--accent)' }}>Diversity:</b> At least one member MUST be female.</span></p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text)', display: 'flex', alignItems: 'flex-start' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 12, marginTop: 2, color: "var(--accent)", flexShrink: 0}}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> <span><b style={{ color: 'var(--accent)' }}>Institution:</b> All members must be from the same institute.</span></p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text)', display: 'flex', alignItems: 'flex-start' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 12, marginTop: 2, color: "var(--accent)", flexShrink: 0}}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> <span><b style={{ color: 'var(--accent)' }}>Problem Statements:</b> Teams can choose from 17 distinct themes across Hardware and Software.</span></p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text)', display: 'flex', alignItems: 'flex-start' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 12, marginTop: 2, color: "var(--accent)", flexShrink: 0}}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 10h6"/></svg> <span><b style={{ color: 'var(--accent)' }}>Registration:</b> Team Leaders register the team and specify skills needed. Other members can list themselves as Seekers.</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}



