import { useState } from "react";
import { createPortal } from "react-dom";
import { useSIH } from "../../hooks/useSIH";
import { SKILLS, YEARS, PROGRAMS_DATA } from "../../data/constants";
import CustomSelect from "../CustomSelect";

const GENDER_OPTIONS = [
  { value: "na", label: "Prefer not to say" },
  { value: "f", label: "Female" },
  { value: "m", label: "Male" }
];

export default function SeekerModal({ initialData, onClose, onSuccess, showApplicationsOnly }) {
  const { addSeeker, updateSeeker, college, addToast, user, myApplications } = useSIH();
  const [submitting, setSubmitting] = useState(false);

  let initPhone = "";
  let initEmail = "";
  if (initialData?.whatsapp) {
    const parts = initialData.whatsapp.split("|");
    initPhone = parts[0]?.trim() || "";
    initEmail = parts[1]?.trim() || "";
  }

  let initSkills = initialData?.skills || [];
  let initCustom = "";
  if (initialData?.skills) {
    const custom = initialData.skills.find(s => !SKILLS.includes(s) && s !== "Other (Custom)");
    if (custom) {
      initCustom = custom;
      if (!initSkills.includes("Other (Custom)")) {
        initSkills = [...initSkills, "Other (Custom)"];
      }
    }
  }

  const [form, setForm] = useState({
    name: initialData?.name || (!initialData && user ? user.user_metadata?.full_name : ""),
    program: initialData?.program || "UG",
    branch: initialData?.branch || "Computer Engineering",
    year: initialData?.year || "1st Year",
    gender: initialData?.gender || "na",
    skills: initSkills,
    customSkill: initCustom,
    bio: initialData?.bio || "",
    phone: initPhone,
    email: initEmail,
    listed: initialData?.listed ?? true,
    college: initialData?.college || college || "Suryodaya College of Engineering and Technology",
  });
  const [errs, setErrs] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));



  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full Name is required";
    if (!form.program) e.program = "Program is required";
    if (!form.branch) e.branch = "Branch is required";
    if (!form.year) e.year = "Year is required";
    if (!form.gender || form.gender === "na") e.gender = "Gender is required";
    if (!form.skills.length) e.skills = "At least one skill is required";
    if (!form.bio.trim()) e.bio = "Bio is required";
    if (!form.phone.trim()) e.phone = "WhatsApp number is required";
    if (!form.email.trim()) e.email = "Email is required";
    setErrs(e);
    
    if (Object.keys(e).length > 0) {
      addToast("Please fill all mandatory fields: " + Object.keys(e).join(", "), "err");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      let finalSkills = form.skills.filter(s => s !== "Other (Custom)");
      if (form.skills.includes("Other (Custom)") && form.customSkill.trim()) {
        finalSkills.push(form.customSkill.trim());
      }

      const payload = {
        name: form.name.trim(),
        college: form.college || college,
        program: form.program,
        dept: form.branch,
        year: form.year,
        gender: form.gender,
        skills: finalSkills,
        bio: form.bio.trim(),
        whatsapp: form.phone.trim() + " | " + form.email.trim(),
        listed: form.listed,
      };

      if (initialData) {
        await updateSeeker(initialData.id, payload);
        addToast("Profile updated successfully!", "ok");
      } else {
        await addSeeker(payload);
        addToast("You are now listed! Teams can find you.", "ok");
        if (onSuccess) onSuccess();
      }
      onClose();
    } catch { 
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="mhead">
          <div>
            <h2>{showApplicationsOnly ? "My Applications" : (initialData ? "Edit Profile" : "List yourself as a seeker")}</h2>
            {!showApplicationsOnly && <p>Teams with open seats can find and invite you. Your number stays hidden until you accept.</p>}
          </div>
          <button className="x" type="button" onClick={onClose}>×</button>
        </div>
        {!showApplicationsOnly && (
          <form className="mbody" onSubmit={(e) => e.preventDefault()} noValidate>

          <div className="two">
            <div className={`fld${errs.name ? " bad" : ""}`}>
              <label htmlFor="sName">Full Name<em>*</em></label>
              <input id="sName" placeholder="e.g. Aditi Sharma"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
              <p className="err">Your name is required.</p>
            </div>

            <div className="fld">
              <label>College</label>
              <input value={form.college} disabled style={{ opacity: 0.7 }} />
            </div>
          </div>

          <div className="two">
            <div className="fld">
              <label>Program<em>*</em></label>
              <CustomSelect
                value={form.program}
                onChange={(val) => {
                  set("program", val);
                  set("branch", ""); // Reset branch when program changes
                }}
                options={[
                  { value: "UG", label: "UG (Undergraduate)" },
                  { value: "PG", label: "PG (Postgraduate)" },
                  { value: "Diploma", label: "Diploma" }
                ]}
                placeholder="Select program..."
              />
            </div>

            <div className="fld">
              <label>Branch/Department<em>*</em></label>
              <CustomSelect
                value={form.branch}
                onChange={(val) => set("branch", val)}
                options={form.program ? PROGRAMS_DATA[form.program] : []}
                placeholder={form.program ? "Select branch..." : "Choose program first"}
                disabled={!form.program}
              />
            </div>
          </div>

          <div className="two">
            <div className="fld">
              <label>Year<em>*</em></label>
              <CustomSelect
                value={form.year}
                onChange={(val) => set("year", val)}
                options={YEARS}
                placeholder="Select year..."
              />
            </div>

            <div className="fld">
              <label>Gender<em>*</em></label>
              <CustomSelect
                value={form.gender}
                onChange={(val) => set("gender", val)}
                options={GENDER_OPTIONS}
                placeholder="Select gender..."
              />
            </div>
          </div>

          <div className={`fld${errs.bio ? " bad" : ""}`}>
            <label htmlFor="sBio">Bio/Description<em>*</em></label>
            <textarea id="sBio" placeholder="Tell teams what you're interested in, what you've built, or your background..." maxLength={180}
              value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            <p className="err">Bio/Description is required.</p>
            <p className="hint">{form.bio.length}/180</p>
          </div>

          <div className={`fld${errs.skills ? " bad" : ""}`}>
            <label>Your key skills (Select at least one)<em>*</em></label>
            <div className="chips">
              {SKILLS.map((sk) => {
                const on = form.skills.includes(sk);
                return (
                  <button key={sk} className={`chip${on ? " on" : ""}`} type="button"
                    onClick={() => {
                      const next = on ? form.skills.filter(x => x !== sk) : [...form.skills, sk];
                      set("skills", next);
                    }}>
                    {sk}
                  </button>
                );
              })}
            </div>
            {form.skills.includes("Other (Custom)") && (
              <div style={{ marginTop: 12 }}>
                <input 
                  type="text" 
                  placeholder="Type your custom skill (e.g. GraphQL, Next.js)" 
                  value={form.customSkill}
                  onChange={(e) => set("customSkill", e.target.value)}
                  maxLength={100}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
                />
              </div>
            )}
            <p className="err">Select at least one skill.</p>
          </div>

          <div className="two">
            <div className={`fld${errs.phone ? " bad" : ""}`}>
              <label htmlFor="sPhone">WhatsApp number<em>*</em></label>
              <input id="sPhone" type="tel" placeholder="10-digit number"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <p className="err">Valid 10-digit WhatsApp number is required.</p>
            </div>

            <div className={`fld${errs.email ? " bad" : ""}`}>
              <label htmlFor="sEmail">Email address<em>*</em></label>
              <input id="sEmail" type="email" placeholder="e.g. you@gmail.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} />
              <p className="err">Valid email address is required.</p>
            </div>
          </div>

          {initialData && (
            <div style={{ margin: "8px 0" }}>
              <label className="checkbox">
                <input type="checkbox" checked={form.listed} onChange={(e) => set("listed", e.target.checked)} />
                <span className="box" />
                List profile on student board
              </label>
              <p className="hint">Uncheck this if you've found a team and want to hide your profile.</p>
            </div>
          )}

        </form>
        )}
        
        {((initialData && myApplications && myApplications.length > 0) || showApplicationsOnly) && (
          <div className="mbody" style={{ marginTop: showApplicationsOnly ? 0 : -16, borderTop: showApplicationsOnly ? "none" : "1px solid var(--border)", paddingTop: showApplicationsOnly ? 0 : 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ margin: 0 }}>Teams You Applied To</h3>
              {myApplications && myApplications.length > 0 && (
                <div style={{ display: "flex", gap: 8, fontSize: 12, flexWrap: "wrap" }}>
                  <span style={{ padding: "4px 8px", background: "var(--surface)", borderRadius: 12, color: "var(--text)", border: "1px solid var(--border)" }}>Total: {myApplications.length}</span>
                  <span style={{ padding: "4px 8px", background: "#c8f24d20", borderRadius: 12, color: "#c8f24d", border: "1px solid #c8f24d40" }}>Accepted: {myApplications.filter(a => a.status === 'accepted').length}</span>
                  <span style={{ padding: "4px 8px", background: "#ff4d4d20", borderRadius: 12, color: "#ff4d4d", border: "1px solid #ff4d4d40" }}>Rejected: {myApplications.filter(a => a.status === 'rejected').length}</span>
                </div>
              )}
            </div>
            
            {(!myApplications || myApplications.length === 0) ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-dim)", background: "var(--surface-hover)", borderRadius: 8, marginTop: 12 }}>
                You haven't applied to any teams yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              {myApplications.map(app => (
                <div key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface-hover)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "var(--text)" }}>{app.teams?.teamName || 'Unknown Team'}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-dim)" }}>
                      Status: <span style={{ 
                        color: app.status === 'accepted' ? '#c8f24d' : app.status === 'rejected' ? '#ff4d4d' : '#ff9f1c',
                        fontWeight: 600, textTransform: 'capitalize'
                      }}>{app.status}</span>
                    </p>
                    {app.status === 'rejected' && app.rejection_reason && (
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-dim)" }}>Reason: {app.rejection_reason}</p>
                    )}
                  </div>
                  {app.status === 'accepted' && app.teams?.contact && (
                    <a href={`mailto:${app.teams.contact.split('|').pop().trim()}`} className="btn-primary" style={{ padding: "6px 12px", fontSize: 12, textDecoration: "none" }}>Contact Leader</a>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        <div className="mfoot">
          <span className="sp" />
          {showApplicationsOnly ? (
            <button className="btn pri" type="button" onClick={onClose}>Close</button>
          ) : (
            <>
              <button className="btn gho" type="button" onClick={onClose} disabled={submitting}>Cancel</button>
              <button className="btn pri" type="button" onClick={submit} disabled={submitting}>
                {submitting ? "Saving..." : (initialData ? "Save Changes" : "Save and list me")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
