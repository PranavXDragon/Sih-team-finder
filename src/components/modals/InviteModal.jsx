import { useState } from "react";
import { useSIH } from "../../hooks/useSIH";

export default function InviteModal({ seeker, onClose }) {
  const { toast, sendTeamInvite } = useSIH();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!seeker) return null;

  const send = async () => {
    if (msg.trim().length < 10) { setErr(true); return; }

    setLoading(true);
    try {
      await sendTeamInvite(seeker, msg);
      toast(`Invite sent to ${seeker.name}!`, "ok");
      onClose();
    } catch (_err) {
      // Error is handled by context toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="mhead">
          <div>
            <h2>Invite {seeker.name}</h2>
            <p>{seeker.dept} · {seeker.year} · {seeker.college.split(",")[0]}</p>
          </div>
          <button className="x" type="button" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          <div className={`fld${err ? " bad" : ""}`}>
            <label htmlFor="invMsg">Why do you want them?<em>*</em></label>
            <textarea
              id="invMsg"
              rows={4}
              maxLength={220}
              placeholder="Tell them why they are a great fit and what your team is working on."
              value={msg}
              onChange={(e) => { setMsg(e.target.value); setErr(false); }}
            />
            <p className="err">Write at least a couple of lines.</p>
            <p className="hint">{msg.length}/220</p>
          </div>
          <div className="note info">
            <span>ℹ</span>
            <span>They see your message. Contact is only shared after acceptance.</span>
          </div>
        </div>
        <div className="mfoot">
          <span className="sp" />
          <button className="btn gho" type="button" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn pri" type="button" onClick={send} disabled={loading}>
            {loading ? 'Sending...' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  );
}


