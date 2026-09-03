import { useState } from "react";
import { useSIH } from "../../hooks/useSIH";
import "./AuthModal.css"; // Reuse the flo-modal styles for consistency

export default function AdminEditTeamModal({ team, onClose }) {
  const { updateTeam } = useSIH();

  const [teamName, setTeamName] = useState(team.teamName || "");
  const [contact, setContact] = useState(team.contact || "");
  const [track, setTrack] = useState(team.track || "");
  const [theme, setTheme] = useState(team.theme || "");
  const [psId, setPsId] = useState(team.psId || "");
  const [psTitle, setPsTitle] = useState(team.psTitle || "");
  const [pitch, setPitch] = useState(team.pitch || "");
  const KNOWN_CATEGORIES = ["Open", "OBC", "SC", "ST", "EWS", "Other"];
  const [members, setMembers] = useState(() => {
    return (team.members || []).map(m => {
      let cat = m.category || "";
      let customCat = "";
      if (cat && !KNOWN_CATEGORIES.includes(cat)) {
        customCat = cat;
        cat = "Other";
      return { ...m, category: cat, customCategory: customCat, pwd: m.pwd || "Not Applicable" };
    });
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const normalizedMembers = members.map(m => ({
        ...m,
        phone: m.phone ? String(m.phone).replace(/\D/g, '') : '',
        category: m.category === "Other" ? (m.customCategory || "").trim() : (m.category || "")
      }));

      await updateTeam(team.id, {
        teamName,
        contact,
        track,
        theme,
        psId,
        psTitle,
        pitch,
        members: normalizedMembers,
        seatsOpen: Math.max(0, (team.totalSeats || 6) - normalizedMembers.length)
      });
      onClose(); // close on success
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flo-wrapper" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-flo-card" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <button type="button" className="auth-flo-close" onClick={onClose} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="auth-flo-header">
          <h1 className="auth-flo-title">Edit Team</h1>
          <p className="auth-flo-subtitle">Update data for {team.teamName}</p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <div className="fld">
            <label>Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>

          <div className="fld">
            <label>Contact (Phone/Email)</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="fld">
              <label>Track</label>
              <select value={track} onChange={(e) => setTrack(e.target.value)}>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>

            <div className="fld">
              <label>Theme</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div className="fld">
              <label>PS ID</label>
              <input
                type="text"
                value={psId}
                onChange={(e) => setPsId(e.target.value)}
              />
            </div>
            <div className="fld">
              <label>PS Title</label>
              <input
                type="text"
                value={psTitle}
                onChange={(e) => setPsTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="fld">
            <label>Pitch / Idea Description</label>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label>Team Members ({members.length}/{team.totalSeats || 6})</label>
              {members.length < (team.totalSeats || 6) && (
                <button
                  type="button"
                  onClick={() => setMembers([...members, { name: "", email: "", phone: "", dept: "", gender: "m", year: "" }])}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                >
                  + Add Member
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {members.map((m, idx) => (
                <div key={idx} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <b style={{ fontSize: 14 }}>Member {idx + 1} {idx === 0 ? "(Leader)" : ""}</b>
                    <button
                      type="button"
                      onClick={() => setMembers(members.filter((_, i) => i !== idx))}
                      style={{ background: 'transparent', border: 'none', color: 'var(--stop)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input
                      type="text"
                      placeholder={idx === 0 ? "Full Team Leader Name" : "Full Name"}
                      value={m.name}
                      onChange={(e) => { const newM = [...members]; newM[idx].name = e.target.value; setMembers(newM); }}
                      style={{ padding: 6, fontSize: 13 }}
                    />
                    <input
                      type="text"
                      placeholder="Email"
                      value={m.email}
                      onChange={(e) => { const newM = [...members]; newM[idx].email = e.target.value; setMembers(newM); }}
                      style={{ padding: 6, fontSize: 13 }}
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={m.phone}
                      onChange={(e) => { const newM = [...members]; newM[idx].phone = e.target.value.replace(/\D/g, ''); setMembers(newM); }}
                      style={{ padding: 6, fontSize: 13 }}
                    />
                    <input
                      type="text"
                      placeholder="Department"
                      value={m.dept}
                      onChange={(e) => { const newM = [...members]; newM[idx].dept = e.target.value; setMembers(newM); }}
                      style={{ padding: 6, fontSize: 13 }}
                    />
                    <select
                      value={m.gender}
                      onChange={(e) => { const newM = [...members]; newM[idx].gender = e.target.value; setMembers(newM); }}
                      style={{ padding: 6, fontSize: 13 }}
                    >
                      <option value="m">Male</option>
                      <option value="f">Female</option>
                      <option value="o">Other</option>
                    </select>
                    <select
                      value={m.year || ""}
                      onChange={(e) => { const newM = [...members]; newM[idx].year = e.target.value; setMembers(newM); }}
                      style={{ padding: 6, fontSize: 13 }}
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year">5th Year</option>
                    </select>
                    <select
                      value={m.category || ""}
                      onChange={(e) => { const newM = [...members]; newM[idx].category = e.target.value; setMembers(newM); }}
                      style={{ padding: 6, fontSize: 13 }}
                    >
                      <option value="">Select Category</option>
                      <option value="Open">Open</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                      <option value="Other">Other</option>
                    </select>
                    <select
                      value={m.pwd || "Not Applicable"}
                      onChange={(e) => { const newM = [...members]; newM[idx].pwd = e.target.value; setMembers(newM); }}
                      style={{ padding: 6, fontSize: 13 }}
                    >
                      <option value="Not Applicable">Not Applicable</option>
                      <option value="Visually Impaired(VI)">Visually Impaired(VI)</option>
                      <option value="Locomotor Disability(LD)">Locomotor Disability(LD)</option>
                      <option value="Hearing Impaired(HI)">Hearing Impaired(HI)</option>
                    </select>
                  </div>
                  {m.category === "Other" && (
                    <div style={{ marginTop: 8 }}>
                      <input
                        type="text"
                        placeholder="Specify Category"
                        value={m.customCategory || ""}
                        onChange={(e) => { const newM = [...members]; newM[idx].customCategory = e.target.value; setMembers(newM); }}
                        style={{ padding: 6, fontSize: 13, width: '100%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {members.length === 0 && <p style={{ color: 'var(--dim)', fontSize: 13 }}>No members added.</p>}
            </div>
          </div>

          {errorMsg && (
            <div className="auth-flo-error" style={{ marginBottom: 0 }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-flo-submit"
            style={{ marginTop: 16 }}
          >
            <span style={{ opacity: loading ? 0 : 1 }}>
              Save Changes
            </span>

            {loading && (
              <div className="auth-flo-spinner">
                <div className="auth-flo-spinner-ring" />
              </div>
            )}

            <div className="auth-flo-submit-glow" />
          </button>
        </form>
      </div>
    </div>
  );
}
