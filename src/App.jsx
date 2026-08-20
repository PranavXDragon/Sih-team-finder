import { useState, useEffect } from "react";
import { useSIH } from "./hooks/useSIH";
import LandingScreen from "./pages/LandingScreen";
import BoardScreen from "./pages/BoardScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  const { toasts, session, isAuthLoading } = useSIH();
  
  const [screen, setScreenState] = useState(() => window.location.hash === "#board" ? "board" : "landing");
  const [boardAction, setBoardAction] = useState(null);

  useEffect(() => {
    const handleHash = () => setScreenState(window.location.hash === "#board" ? "board" : "landing");
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

  // Protect the board route
  useEffect(() => {
    if (!isAuthLoading && screen === "board" && !session) {
      setScreen("landing");
    }
  }, [isAuthLoading, session, screen]);

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
        ) : session ? (
          <BoardScreen initialAction={boardAction} onBack={() => { setBoardAction(null); setScreen("landing"); }} />
        ) : null
      )}
      
      <Footer />
      
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

