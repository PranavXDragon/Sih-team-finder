import './Cards.css';
function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SeekerCard({ seeker, onInvite }) {
  const initials = seeker.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isFemale = seeker.gender === "f";

  return (
    <div className="scard">
      <div className="scard-head">
        <div className={`scard-av${isFemale ? " f" : ""}`}>{initials}</div>
        <div className="scard-info">
          <b>{seeker.name}</b>
          <small>{seeker.program ? `${seeker.program} - ` : ""}{seeker.dept} · {seeker.year} · {seeker.college.split(",")[0]}</small>
        </div>
        {isFemale && (
          <span className="chip mini" style={{ background: "rgba(219,39,119,0.15)", borderColor: "rgba(219,39,119,0.4)", color: "#f9a8d4", cursor: "default" }}>
            ♀
          </span>
        )}
      </div>
      {seeker.bio && <p className="scard-bio">{seeker.bio}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {seeker.skills?.map((s) => (
          <span key={s} className="chip mini" style={{ cursor: "default" }}>{s}</span>
        ))}
      </div>
      <div className="scard-foot">
        <span className="ago">{timeAgo(seeker.createdAt)}</span>
        <span className="sp" />
        <button className="btn sm pri" type="button" onClick={() => onInvite(seeker)}>
          Invite to team
        </button>
      </div>
    </div>
  );
}



