import './Cards.css';
import { useSIH } from "../hooks/useSIH";

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TeamCard({ team, onEdit }) {
  const { user, myTeam, mySeekerProfile, myAcceptedRequests, requestToJoin, addToast } = useSIH();
  const filled = team.totalSeats - team.seatsOpen;
  const isFull = team.seatsOpen === 0;

  const isMyTeam = myTeam && myTeam.id === team.id;
  const isAccepted = myAcceptedRequests?.includes(team.id);

  const handleJoin = async () => {
    if (!user) {
      window.location.hash = ""; // Redirect to landing page
      document.dispatchEvent(new CustomEvent('triggerAuth', { detail: 'signup' }));
      return;
    }
    if (myTeam) {
      addToast("You lead a team! You cannot join another.", "err");
      return;
    }
    await requestToJoin(team.id);
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#board?team=${team.id}`;
    navigator.clipboard.writeText(url);
    addToast("Link copied!", "ok");
  };

  return (
    <div className="card" data-full={isFull ? "1" : "0"}>
      <div className="rail">
        <span>{isFull ? "Full" : "Open"}</span>
      </div>
      <div className="chead">
        <h3>{team.teamName}</h3>
        <span className="track" data-t={team.track}>{team.track}</span>
      </div>
      {team.pitch && <p className="pitch">{team.pitch}</p>}
      <div className="rowmeta">
        <span>College <i>{team.college.split(",")[0]}</i></span>
        <span>Theme <i>{team.theme}</i></span>
        {team.psId && <span>PS <i>{team.psId}</i></span>}
        {team.hasMentor && <span style={{ color: "var(--open)" }}>✓ Has mentor</span>}
      </div>

      {team.wantsSkills?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {team.wantsSkills.map((s) => (
             <span key={s} className="chip mini" style={{ cursor: "default" }}>{s}</span>
          ))}
        </div>
      )}

      <div className="seats">
        <div className="pips">
          {Array.from({ length: team.totalSeats }).map((_, i) => (
            <span key={i} className={`pip${i < filled ? " on" : ""}`} />
          ))}
        </div>
        <b>{isFull ? "Team full" : `${team.seatsOpen} seat${team.seatsOpen > 1 ? "s" : ""} open`}</b>
        {team.needsFemale && (
          <span className="chip mini" style={{ background: "var(--warn-dim)", borderColor: "rgba(255, 159, 28, 0.4)", color: "var(--warn)", cursor: "default" }}>
            Needs ♀
          </span>
        )}
      </div>

      <div className="cfoot">
        <span className="ago">{timeAgo(team.createdAt)}</span>
        <span className="sp" />
        
        <button className="iconbtn" type="button" onClick={handleShare} style={{ marginRight: 8, width: 32, height: 32 }} title="Copy link to team">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </button>

        {isMyTeam ? (
          <span style={{ color: "var(--mut)", fontSize: "0.85rem", fontWeight: 600 }}>Your Team</span>
        ) : isAccepted ? (
          <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#10b981', padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
            {team.contact || "Accepted! (No contact info provided)"}
          </div>
        ) : !isFull ? (
          <button className="btn sm pri" type="button" onClick={handleJoin}>
            Request to join
          </button>
        ) : null}
      </div>
    </div>
  );
}








