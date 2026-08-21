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

export default function App() {
  const { toasts, session, isAuthLoading, isLoading, myTeam, mySeekerProfile } = useSIH();
  
  const [screen, setScreenState] = useState(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#board")) return "board";
    if (hash === "#admin") return "admin";
    return "landing";
  });
  const [boardAction, setBoardAction] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authDefaultSignUp, setAuthDefaultSignUp] = useState(false);
  
  useEffect(() => {
    if (session?.user && !isLoading) {
      const key = `sih_onboarding_${session.user.id}`;
      if (!localStorage.getItem(key)) {
        const intent = localStorage.getItem('sih_intent');
        localStorage.removeItem('sih_intent');
        
        if (myTeam || mySeekerProfile) {
          localStorage.setItem(key, "true");
        } else if (intent === "post-team") {
          localStorage.setItem(key, "true");
          setScreenState("board");
          setBoardAction("post-team");
        } else if (intent === "list-seeker") {
          localStorage.setItem(key, "true");
          setScreenState("board");
          setBoardAction("list-seeker");
        } else {
          setShowOnboarding(true);
        }
      }
    }
  }, [session, isLoading, myTeam, mySeekerProfile]);
  
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
      else if (hash === "#admin") setScreenState("admin");
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
        <LandingScreen onEnter={(act) => { setBoardAction(act); setScreen("board"); }} />
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
          onSuccess={(isSignUp) => {
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
            setBoardAction(act);
            setScreen("board");
          }}
          onClose={() => {
            if (session?.user) localStorage.setItem(`sih_onboarding_${session.user.id}`, "true");
            setShowOnboarding(false);
            setScreen("board");
          }}
        />
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


