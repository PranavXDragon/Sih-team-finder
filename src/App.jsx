import './components/modals/Modals.css';
import { useState, useEffect } from "react";
import { useSIH } from "./hooks/useSIH";
import LandingScreen from "./pages/LandingScreen";
import BoardScreen from "./pages/BoardScreen";
import AdminScreen from "./pages/AdminScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/modals/AuthModal";

export default function App() {
  const { toasts, session, isAuthLoading } = useSIH();
  
  const [screen, setScreenState] = useState(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#board")) return "board";
    if (hash === "#admin") return "admin";
    return "landing";
  });
  const [boardAction, setBoardAction] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  
  useEffect(() => {
    const handleAuthEvent = (e) => setShowAuth(true);
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
          onSuccess={(isSignUp) => {
            setShowAuth(false);
            if (isSignUp) {
              setBoardAction("post-team");
              setScreen("board");
            }
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


