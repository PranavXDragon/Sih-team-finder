import './components/modals/Modals.css';
import { useState, useEffect } from "react";
import { useSIH } from "./hooks/useSIH";
import LandingScreen from "./pages/LandingScreen";
import BoardScreen from "./pages/BoardScreen";
import AdminScreen from "./pages/AdminScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/modals/AuthModal";
import OnboardingModal from "./components/modals/OnboardingModal";
import TeamModal from "./components/modals/TeamModal";
import SeekerModal from "./components/modals/SeekerModal";
import RequestsModal from "./components/modals/RequestsModal";

const CLOSING_INSTANT = Date.parse("2026-08-31T00:00:00+05:30");

export default function App() {
  const { toasts, session, isAuthLoading, isLoading, myTeam, mySeekerProfile, addToast, requestToJoin } = useSIH();

  const [screen, setScreenState] = useState(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#board")) return "board";
    if (hash === "#spoc") return "admin";
    return "landing";
  });
  const [boardAction, setBoardAction] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authDefaultSignUp, setAuthDefaultSignUp] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [globalPostTeam, setGlobalPostTeam] = useState(false);
  const [globalListSeeker, setGlobalListSeeker] = useState(false);
  const [globalShowRequests, setGlobalShowRequests] = useState(false);

  useEffect(() => {
    if (session?.user && !isLoading) {
      if (session.user.email === "admin@sih2026.com") return; // Admin skips all onboarding
      const intent = localStorage.getItem('sih_intent');
      const isClosed = Date.now() >= CLOSING_INSTANT;

      // Always process intent if present, regardless of whether they are a new user
      if (intent) {
        localStorage.removeItem('sih_intent');
        if (isClosed) {
          setShowClosedModal(true);
        } else if (intent === "post-team") {
          if (myTeam) {
            addToast("You already have a registered team!", "err");
          } else if (mySeekerProfile) {
            addToast("You are already listed as a Seeker. Seekers cannot create teams.", "err");
          } else {
            setGlobalPostTeam(true);
          }
        } else if (intent === "list-seeker") {
          if (mySeekerProfile) {
            addToast("You already have a listed profile!", "err");
          } else if (myTeam) {
            addToast("You lead a team! Team Leaders cannot list themselves as seekers.", "err");
          } else {
            setGlobalListSeeker(true);
          }
        }
      }

      const key = `sih_onboarding_${session.user.id}`;
      if (!localStorage.getItem(key)) {
        if (myTeam || mySeekerProfile) {
          localStorage.setItem(key, "true");
        } else if (!intent) {
          // Default to post-team if no intent was found (e.g. they just clicked sign up)
          localStorage.setItem(key, "true");
          if (isClosed) {
            setShowClosedModal(true);
          } else {
            setGlobalPostTeam(true);
          }
        } else {
          localStorage.setItem(key, "true");
        }
      }
    }
  }, [session, isLoading, myTeam, mySeekerProfile, addToast]);

  useEffect(() => {
    const handleAuthEvent = (e) => {
      if (e.detail === 'signup') {
        const isClosed = Date.now() >= CLOSING_INSTANT;
        if (isClosed) {
          setShowClosedModal(true);
          return;
        }
      }
      setAuthDefaultSignUp(e.detail === 'signup');
      setShowAuth(true);
    };
    const handleClosedEvent = () => setShowClosedModal(true);

    document.addEventListener("triggerAuth", handleAuthEvent);
    document.addEventListener("triggerClosed", handleClosedEvent);
    return () => {
      document.removeEventListener("triggerAuth", handleAuthEvent);
      document.removeEventListener("triggerClosed", handleClosedEvent);
    };
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#board")) setScreenState("board");
      else if (hash.startsWith("#requests")) {
        setScreenState("board");
        setGlobalShowRequests(true);
        window.location.hash = "board"; // clean url after reading
      }
      else if (hash === "#spoc") setScreenState("admin");
      else setScreenState("landing");
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const setScreen = (s) => {
    if (s === "board") window.location.hash = "board";
    else {
      window.location.hash = "";
    }
    setScreenState(s);
  };

  return (
    <>
      <div className="sheet" aria-hidden="true" />
      <Navbar />

      {screen === "landing" && (
        <LandingScreen onEnter={(act) => {
          if (act === "post-team") {
            setGlobalPostTeam(true);
          } else if (act === "list-seeker") {
            setGlobalListSeeker(true);
          } else {
            setBoardAction(null);
            setScreen("board");
          }
        }} />
      )}

      {screen === "board" && (
        isAuthLoading ? (
          <div style={{ padding: "100px", textAlign: "center", minHeight: "80vh" }}>
            <h2>Loading...</h2>
          </div>
        ) : (
          <BoardScreen initialAction={boardAction} onBack={() => { setBoardAction(null); setScreen("landing"); }} />
        )
      )}

      {screen === "admin" && (
        <AdminScreen />
      )}

      <Footer />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          defaultIsSignUp={authDefaultSignUp}
          onSuccess={() => {
            setShowAuth(false);
            // Onboarding is automatically handled by the useEffect for new users
          }}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          onSelect={(act) => {
            if (session?.user) localStorage.setItem(`sih_onboarding_${session.user.id}`, "true");
            setShowOnboarding(false);
            if (act === "post-team") setGlobalPostTeam(true);
            else if (act === "list-seeker") setGlobalListSeeker(true);
          }}
          onClose={() => {
            if (session?.user) localStorage.setItem(`sih_onboarding_${session.user.id}`, "true");
            setShowOnboarding(false);
            setScreen("board");
          }}
        />
      )}

      {globalPostTeam && (
        <TeamModal
          onClose={() => setGlobalPostTeam(false)}
          onSuccess={() => {
            setGlobalPostTeam(false);
            setScreen("board");
          }}
        />
      )}

      {globalListSeeker && (
        <SeekerModal
          onClose={() => setGlobalListSeeker(false)}
          onSuccess={async () => {
            setGlobalListSeeker(false);
            setScreen("board");

            // Check if there was an intent to join a specific team
            const joinTeamId = localStorage.getItem("sih_join_team_id");
            if (joinTeamId) {
              localStorage.removeItem("sih_join_team_id");
              try {
                await requestToJoin(joinTeamId);
                // We don't need to show a success toast here because requestToJoin handles it!
              } catch (e) {
                console.error(e);
              }
            }
          }}
        />
      )}

      {globalShowRequests && (
        <RequestsModal onClose={() => setGlobalShowRequests(false)} />
      )}

      {showClosedModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 3, 2, 0.76)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', width: '100%', maxWidth: 440, padding: '40px 24px', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 40px 90px -30px var(--shadow-2)', animation: 'rise 0.28s cubic-bezier(0.2, 0.9, 0.3, 1)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--stop)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <span style={{ color: 'var(--stop)', fontSize: 36, fontWeight: 800, lineHeight: 1 }}>!</span>
            </div>
            <h1 style={{ color: 'var(--text)', fontSize: 26, fontWeight: 800, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CLOSED!</h1>
            <p style={{ color: 'var(--dim)', fontSize: 14, margin: '0 0 32px 0', fontWeight: 500, textAlign: 'center', letterSpacing: '0.5px' }}>REGISTRATIONS ARE CLOSED</p>
            <button className="btn" style={{ background: 'var(--stop)', color: '#fff', border: 'none', padding: '10px 32px', fontSize: 15, fontWeight: 700, borderRadius: 8, cursor: 'pointer' }} onClick={() => setShowClosedModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast" data-k={t.kind}>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}


