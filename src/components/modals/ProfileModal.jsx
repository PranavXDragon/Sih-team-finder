import { useState } from "react";
import { useSIH } from "../../hooks/useSIH";
import TeamModal from "./TeamModal";
import SeekerModal from "./SeekerModal";
import RequestsModal from "./RequestsModal";

export default function ProfileModal({ onClose }) {
  const { user, myTeam, mySeekerProfile, signOut, myRequests } = useSIH();

  const [editTeam, setEditTeam] = useState(false);
  const [editSeeker, setEditSeeker] = useState(false);
  const [showReqs, setShowReqs] = useState(false);

  const handleSignOut = () => {
    signOut();
    window.location.hash = "";
    onClose();
  };

  if (editTeam) return <TeamModal initialData={myTeam} onClose={() => setEditTeam(false)} />;
  if (editSeeker) return <SeekerModal initialData={mySeekerProfile} onClose={() => setEditSeeker(false)} />;
  if (showReqs) return <RequestsModal onClose={() => setShowReqs(false)} />;

  return (
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="mhead">
          <div>
            <h2>Your Profile</h2>
            <p>{user?.email}</p>
          </div>
          <button className="x" type="button" onClick={onClose}>×</button>
        </div>
        <div className="mbody" style={{ padding: 24 }}>
          {myTeam && (
            <div style={{ marginBottom: 24, padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Team Leader</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--mut)", margin: "0 0 16px 0" }}>You are leading the team <b>{myTeam.teamName}</b>.</p>

              <button className="btn sm" style={{ width: "100%", marginBottom: 8, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }} onClick={() => setEditTeam(true)}>
                Edit Team Details
              </button>

              <button className="btn sm pri" style={{ width: "100%" }} onClick={() => setShowReqs(true)}>
                Join Requests {myRequests.length > 0 && <span style={{ background: "#fff", color: "var(--pri)", padding: "1px 6px", borderRadius: 100, marginLeft: 6 }}>{myRequests.length}</span>}
              </button>
            </div>
          )}

          {mySeekerProfile && (
            <div style={{ marginBottom: 24, padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Seeker Profile</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--mut)", margin: "0 0 16px 0" }}>You are listed on the board.</p>

              <button className="btn sm" style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }} onClick={() => setEditSeeker(true)}>
                Edit Profile
              </button>
            </div>
          )}

          {!myTeam && !mySeekerProfile && (
            <div style={{ marginBottom: 24, padding: 16, background: "rgba(255, 184, 108, 0.1)", border: "1px solid rgba(255, 184, 108, 0.2)", borderRadius: 8, color: "var(--text)" }}>
              <p style={{ fontSize: "0.9rem", margin: 0 }}>You haven't posted a team or a seeker profile yet.</p>
            </div>
          )}

          <button className="btn sm" type="button" onClick={handleSignOut} style={{ width: "100%", background: "transparent", border: "1px solid var(--border)", color: "var(--text)" }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

