import { useState } from "react";
import { useSIH } from "../../hooks/useSIH";
import { WA_LINK } from "../../data/constants";

export default function ContactModal({ team, onClose }) {
  const { toast } = useSIH();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);

  if (!team) return null;

  const send = () => {
    if (msg.trim().length < 10) { setErr(true); return; }
    // In a real app this would call an API. Here we just show a success toast
    // and open WhatsApp with pre-filled message as a workaround.
    const text = encodeURIComponent(
      `Hi!\n\nI want to join team "${team.teamName}" (${team.track}, ${team.theme}).\n\n${msg}`
    );
    window.open(`https://wa.me/916374166705?text=${text}`, "_blank");
    toast("Request sent! The team will be notified.", "ok");
    onClose();
  };

  return (
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="mhead">
          <div>
            <h2>Request to join</h2>
            <p>Team: <b>{team.teamName}</b> · {team.track} · {team.theme}</p>
          </div>
          <button className="x" type="button" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          <div className={`fld${err ? " bad" : ""}`}>
            <label htmlFor="joinMsg">Why do you want to join?<em>*</em></label>
            <textarea
              id="joinMsg"
              rows={4}
              maxLength={220}
              placeholder="Tell the team why you are a good fit. Mention your skills and what you can contribute."
              value={msg}
              onChange={(e) => { setMsg(e.target.value); setErr(false); }}
            />
            <p className="err">Write at least a couple of lines — blank requests get ignored.</p>
            <p className="hint">{msg.length}/220</p>
          </div>
          <div className="note info">
            <span>ℹ</span>
            <span>
              Since this is a frontend-only demo, clicking Send will open WhatsApp with
              your message pre-filled so the team leader can be reached directly.
            </span>
          </div>
        </div>
        <div className="mfoot">
          <span className="sp" />
          <button className="btn gho" type="button" onClick={onClose}>Cancel</button>
          <button className="btn pri" type="button" onClick={send}>Send request</button>
        </div>
      </div>
    </div>
  );
}


