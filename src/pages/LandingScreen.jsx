import './LandingScreen.css';
import { useState } from "react";
import { useSIH } from "../hooks/useSIH";
import AuthModal from "../components/modals/AuthModal";

const RULES = [
  "6 members","\u00B7","1 must be female","\u00B7","one institute","\u00B7","17 themes","\u00B7",
  "software or hardware","\u00B7","one problem statement","\u00B7",
  "6 members","\u00B7","1 must be female","\u00B7","one institute","\u00B7","17 themes","\u00B7",
  "software or hardware","\u00B7","one problem statement","\u00B7",
];

export default function LandingScreen({ onEnter }) {
  const { stats, session, myTeam, mySeekerProfile, addToast } = useSIH();
  const [authPendingAction, setAuthPendingAction] = useState(null);

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
      setAuthPendingAction(action);
    }
  };

  const handleAuthSuccess = () => {
    if (authPendingAction) {
      onEnter(authPendingAction);
    }
    setAuthPendingAction(null);
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
              <button className="big pink" type="button" onClick={() => handleAction("post-team")}>
                CREATE A TEAM
              </button>
              <button className="big blue" type="button" onClick={() => handleAction("list-seeker")}>
                JOIN A TEAM
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

      {authPendingAction && (
        <AuthModal 
          onClose={() => setAuthPendingAction(null)} 
          onSuccess={handleAuthSuccess} 
        />
      )}
    </div>
  );
}



