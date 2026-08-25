import "./AuthModal.css";

export default function AdminViewTeamModal({ team, onClose }) {
  return (
    <div className="auth-flo-wrapper" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-flo-card" style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', background: '#fff' }}>
        <button type="button" className="auth-flo-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="auth-flo-header">
          <h1 className="auth-flo-title">{team.teamName}</h1>
          <p className="auth-flo-subtitle">Team Details</p>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Track</p>
              <p style={{ fontWeight: 500 }}>{team.track || 'N/A'}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Theme</p>
              <p style={{ fontWeight: 500 }}>{team.theme || 'N/A'}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Problem Statement</p>
              <p style={{ fontWeight: 500 }}>{team.psId ? `${team.psId} - ${team.psTitle}` : 'N/A'}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Contact Info</p>
              <p style={{ fontWeight: 500 }}>{team.contact || 'N/A'}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Seats</p>
              <p style={{ fontWeight: 500 }}>{team.seatsOpen} open (out of {team.totalSeats})</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Skills Needed</p>
              <p style={{ fontWeight: 500 }}>
                {team.wantsSkills && team.wantsSkills.length > 0 
                  ? team.wantsSkills.map(s => s === "Other (Custom)" && team.customSkill ? team.customSkill : s).join(", ") 
                  : 'None specified'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Needs Female</p>
              <p style={{ fontWeight: 500 }}>{team.needsFemale ? "Yes" : "No"}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Has Mentor</p>
              <p style={{ fontWeight: 500 }}>{team.hasMentor ? "Yes" : "No"}</p>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Pitch / Idea</p>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
              {team.pitch || 'No pitch provided.'}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Team Members ({team.members?.length || 0})</p>
            {team.members && team.members.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {team.members.map((m, idx) => (
                  <div key={idx} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{m.name} {idx === 0 ? <span style={{ fontSize: 10, background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>Leader</span> : null}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                      <p><span style={{ color: 'var(--dim)' }}>Email:</span> {m.email || 'N/A'}</p>
                      <p><span style={{ color: 'var(--dim)' }}>Phone:</span> {m.phone || 'N/A'}</p>
                      <p><span style={{ color: 'var(--dim)' }}>Dept:</span> {m.dept || 'N/A'}</p>
                      <p><span style={{ color: 'var(--dim)' }}>Gender:</span> {m.gender === 'f' ? 'Female' : m.gender === 'm' ? 'Male' : 'N/A'}</p>
                      <p><span style={{ color: 'var(--dim)' }}>Year:</span> {m.year || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--dim)' }}>No members listed.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
