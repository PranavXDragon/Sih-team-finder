import { useState, useRef, useEffect } from "react";
import { useSIH } from "../hooks/useSIH";
import TeamModal from "./modals/TeamModal";
import SeekerModal from "./modals/SeekerModal";
import RequestsModal from "./modals/RequestsModal";

export default function ProfileDropdown() {
  const { user, myTeam, mySeekerProfile, signOut, myRequests } = useSIH();
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut();
    window.location.hash = "";
    setOpen(false);
  };

  const handleOpenModal = (modal) => {
    setActiveModal(modal);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button 
        className="btn sm profile-btn" 
        type="button" 
        onClick={() => setOpen(!open)}
        style={{ margin: 0 }}
      >
        Profile
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 220,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "0 10px 40px -10px var(--shadow-1)",
          padding: 6,
          zIndex: 100,
          animation: "cs-fade 0.15s ease-out"
        }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
            <span style={{ display: "block", fontSize: 11, fontFamily: "var(--mono)", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Signed in as</span>
            <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{user?.email}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {myTeam && (
              <>
                <button type="button" className="cs-opt" onClick={() => handleOpenModal('team')}>Edit Team</button>
                <button type="button" className="cs-opt" onClick={() => handleOpenModal('reqs')} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Join Requests
                  {myRequests.length > 0 && <span style={{ background: "var(--accent)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 100, fontWeight: 700 }}>{myRequests.length}</span>}
                </button>
              </>
            )}
            
            {mySeekerProfile && (
              <button type="button" className="cs-opt" onClick={() => handleOpenModal('seeker')}>Edit Seeker Profile</button>
            )}

            {!myTeam && (
              <button type="button" className="cs-opt" onClick={() => handleOpenModal('team')}>Register Team</button>
            )}
            {!mySeekerProfile && (
              <button type="button" className="cs-opt" onClick={() => handleOpenModal('seeker')}>Join a Team (Seeker)</button>
            )}
            
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            
            <button type="button" className="cs-opt" onClick={handleSignOut} style={{ color: "var(--stop)" }}>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {activeModal === 'team' && <TeamModal initialData={myTeam} onClose={() => setActiveModal(null)} />}
      {activeModal === 'seeker' && <SeekerModal initialData={mySeekerProfile} onClose={() => setActiveModal(null)} />}
      {activeModal === 'reqs' && <RequestsModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}
