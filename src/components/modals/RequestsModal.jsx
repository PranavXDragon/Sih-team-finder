import { useState } from "react";
import { createPortal } from "react-dom";
import { useSIH } from "../../hooks/useSIH";

export default function RequestsModal({ onClose }) {
  const { myRequests, acceptRequest, rejectRequest, addToast } = useSIH();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  return createPortal(
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: "100%", maxWidth: 500 }}>
        <div className="mhead">
          <div>
            <h2>Join Requests</h2>
            <p>Students who want to join your team.</p>
          </div>
          <button className="x" type="button" onClick={onClose}>×</button>
        </div>
        <div className="mbody" style={{ padding: 24, maxHeight: "60vh", overflowY: "auto" }}>
          {myRequests.length === 0 ? (
            <p style={{ color: "var(--mut)" }}>No pending requests.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
              {myRequests.map((req) => (
                <div key={req.id} style={{ border: "1px solid var(--border)", padding: 16, borderRadius: 8, background: "var(--card)", width: "100%", minWidth: 0 }}>
                  <h4 style={{ margin: "0 0 8px 0" }}>{req.seekers.name}</h4>
                  <div style={{ display: "flex", gap: 8, fontSize: "0.85rem", color: "var(--mut)", marginBottom: 12, flexWrap: "wrap" }}>
                    <span>{req.seekers.dept}</span> &bull;
                    <span>{req.seekers.year}</span> &bull;
                    <span>{req.seekers.gender === 'm' ? 'Male' : req.seekers.gender === 'f' ? 'Female' : 'Any'}</span>
                  </div>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.9rem", wordBreak: "break-word", whiteSpace: "normal" }}>{req.seekers.bio}</p>

                  {req.seekers.skills?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                      {req.seekers.skills.map(s => (
                        <span key={s} className="chip mini">{s}</span>
                      ))}
                    </div>
                  )}

                  {rejectingId === req.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <input 
                        type="text" 
                        placeholder="Why are you rejecting? (Sent in email)" 
                        className="inp" 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn sm" style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", color: "var(--text)" }} type="button" onClick={() => {
                          setRejectingId(null);
                          setRejectionReason("");
                        }}>Cancel</button>
                        <button className="btn sm" style={{ flex: 1, background: "var(--err)", color: "#fff", border: "none" }} type="button" onClick={() => {
                          rejectRequest(req.id, rejectionReason);
                          setRejectingId(null);
                          setRejectionReason("");
                        }}>Confirm Reject</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn sm pri" style={{ flex: 1 }} type="button" onClick={() => acceptRequest(req.id, req.seekers)}>Accept</button>
                      <button className="btn sm" style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", color: "var(--text)" }} type="button" onClick={() => {
                        setRejectingId(req.id);
                        setRejectionReason("");
                      }}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

