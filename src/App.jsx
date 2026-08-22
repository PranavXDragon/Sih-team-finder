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
  const [globalPostTeam, setGlobalPostTeam] = useState(false);
  const [globalListSeeker, setGlobalListSeeker] = useState(false);
  const [globalShowRequests, setGlobalShowRequests] = useState(false);

  useEffect(() => {
    if (session?.user && !isLoading) {
      if (session.user.email === "admin@sih2026.com") return; // Admin skips all onboarding
      const intent = localStorage.getItem('sih_intent');

      // Always process intent if present, regardless of whether they are a new user
      if (intent) {
        localStorage.removeItem('sih_intent');
        if (intent === "post-team") {
          if (myTeam) {
            addToast("You already have a registered team!", "err");
          } else {
            setGlobalPostTeam(true);
          }
        } else if (intent === "list-seeker") {
          if (mySeekerProfile) {
            addToast("You already have a listed profile!", "err");
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
          setGlobalPostTeam(true);
        } else {
          localStorage.setItem(key, "true");
        }
      }
    }
  }, [session, isLoading, myTeam, mySeekerProfile, addToast]);

  useEffect(() => {
    const handleAuthEvent = (e) => {
      setAuthDefaultSignUp(e.detail === 'signup');
      setShowAuth(true);
    };
    document.addEventListener("triggerAuth", handleAuthEvent);
    return () => document.removeEventListener("triggerAuth", handleAuthEvent);
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


