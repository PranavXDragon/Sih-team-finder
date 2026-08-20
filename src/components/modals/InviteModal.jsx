import { useState } from "react";
import { useSIH } from "../../hooks/useSIH";

export default function InviteModal({ seeker, onClose }) {
  const { toast } = useSIH();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);

  if (!seeker) return null;

  const send = () => {
    if (msg.trim().length < 10) { setErr(true); return; }
    const text = encodeURIComponent(
      `Hi! I found you on SIH 2026 Team Finder.\n\nI want to invite you to our team.\n\n${msg}`
    );
    window.open(`https://wa.me/916374166705?text=${text}`, "_blank");
    toast(`Invite sent to ${seeker.name}!`, "ok");
    onClose();
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
          <button className="btn gho" type="button" onClick={onClose}>Cancel</button>
          <button className="btn pri" type="button" onClick={send}>Send invite</button>
        </div>
      </div>
    </div>
  );
}


