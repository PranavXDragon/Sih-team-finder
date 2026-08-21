import { useState, useEffect } from "react";
import { SIH_THEMES, SKILLS, PROGRAMS_DATA, YEARS } from "../../data/constants";
import { useSIH } from "../../hooks/useSIH";

const EMPTY_MEMBER = { name: "", email: "", phone: "", program: "", branch: "", year: "", gender: "" };

export default function TeamModal({ onClose, onSuccess }) {
  const { user, addToast, session, myTeam, addTeam, updateTeam } = useSIH();
  const [form, setForm] = useState({
    teamName: "",
    theme: "",
    hasIdea: false,
    psId: "",
    psTitle: "",
    pitch: "",
    college: "Suryodaya College of Engineering and Technology",
    leaderName: "",
    leaderEmail: "",
    leaderPhone: "",
    leaderProgram: "",
    leaderBranch: "",
    leaderYear: "",
    leaderGender: "",
    leaderSkills: "",
    members: Array(5).fill({ ...EMPTY_MEMBER }),
    wantsSkills: [],
    customSkill: ""
  });
  const [errs, setErrs] = useState({});
  
  useEffect(() => {
    if (myTeam) {
      setForm(p => ({
        ...p,
        teamName: myTeam.name || "",
        theme: myTeam.theme || "",
        hasIdea: !!myTeam.idea,
        pitch: myTeam.idea || "",
        leaderName: myTeam.contact_name || "",
        leaderEmail: myTeam.contact_email || "",
      }));
    } else if (user) {
      setForm(p => ({
        ...p,
        leaderEmail: p.leaderEmail || user.email || "",
        leaderName: p.leaderName || user.user_metadata?.full_name || "",
      }));
    }
  }, [myTeam, user]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: false }));
  };

  const updateMember = (i, k, v) => {
    const newMembers = [...form.members];
    newMembers[i] = { ...newMembers[i], [k]: v };
    if (k === "program") newMembers[i].branch = "";
    set("members", newMembers);
  };

  const toggleSkill = (s) => {
    const next = form.wantsSkills.includes(s)
      ? form.wantsSkills.filter((x) => x !== s)
      : [...form.wantsSkills, s];
    set("wantsSkills", next);
  };

  const validate = () => {
    const e = {};
    const noSpaceRe = /^\s*$/;
    
    if (!form.teamName || noSpaceRe.test(form.teamName)) e.teamName = true;
    if (!form.theme) e.theme = true;
    
    if (!form.leaderName || noSpaceRe.test(form.leaderName)) e.leaderName = true;
    if (!form.leaderEmail || noSpaceRe.test(form.leaderEmail)) e.leaderEmail = true;
    if (!form.leaderPhone || noSpaceRe.test(form.leaderPhone)) e.leaderPhone = true;
    if (!form.leaderProgram) e.leaderProgram = true;
    if (!form.leaderBranch) e.leaderBranch = true;
    if (!form.leaderYear) e.leaderYear = true;
    if (!form.leaderGender) e.leaderGender = true;

    let hasFemale = form.leaderGender === "Female";
    form.members.forEach((m, i) => {
      if (m.name && !noSpaceRe.test(m.name)) {
        if (!m.email || noSpaceRe.test(m.email) || !m.phone || noSpaceRe.test(m.phone) || !m.program || !m.branch || !m.year || !m.gender) {
          e.members = true;
        }
        if (m.gender === "Female") hasFemale = true;
      }
    });

    if (!hasFemale) e.genderRule = true;
    if (form.wantsSkills.length === 0) e.wantsSkills = true;

    setErrs(e);
    if (Object.keys(e).length > 0) {
      if (e.genderRule) addToast("At least one member MUST be female.", "err");
      else addToast("Please fill all mandatory fields correctly.", "err");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        name: form.teamName.trim(),
        theme: form.theme,
        idea: form.hasIdea ? form.pitch.trim() : "",
        ps_id: form.hasIdea ? form.psId.trim() : "",
        ps_title: form.hasIdea ? form.psTitle.trim() : "",
        contact_name: form.leaderName.trim(),
        contact_email: form.leaderEmail.trim(),
        contact_phone: form.leaderPhone.trim(),
        leader_program: form.leaderProgram,
        leader_branch: form.leaderBranch,
        leader_year: form.leaderYear,
        leader_gender: form.leaderGender,
        leader_skills: form.leaderSkills.trim(),
        members: form.members.filter(m => m.name && m.name.trim() !== ""),
        wants_skills: form.wantsSkills,
        custom_skill: form.wantsSkills.includes("Other (Custom)") ? form.customSkill.trim() : "",
        college: form.college || "Suryodaya College of Engineering and Technology",
      };

      if (myTeam) {
        await updateTeam(myTeam.id, payload);
        addToast("Team updated successfully!", "ok");
      } else {
        await addTeam(payload);
        addToast("Team registered successfully!", "ok");
        if (onSuccess) onSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="veil open" onPointerDown={onClose}>
      <div className="modal big" style={{ maxWidth: 840 }} onPointerDown={(e) => e.stopPropagation()}>
        <div className="mhead">
          <h2>{myTeam ? "Edit Team" : "Register Team"}</h2>
          <button className="iconbtn x" type="button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form className="mbody" onSubmit={(e) => e.preventDefault()}>
          
          <div className="fset">
            <span className="mono">1 · Team details</span>
            <div className={`fld${errs.teamName ? " bad" : ""}`}>
              <label>Team name* {myTeam && <span style={{fontSize: 10, color: "var(--err)", marginLeft: 6}}>(Cannot be changed)</span>}</label>
              <input maxLength={46} value={form.teamName} disabled={!!myTeam} onChange={(e) => set("teamName", e.target.value)} style={myTeam ? { opacity: 0.7 } : {}} />
            </div>
            
            <div className="fld">
              <label>College*</label>
              <input value={form.college} disabled style={{ opacity: 0.7 }} />
            </div>

            <div className={`fld${errs.theme ? " bad" : ""}`}>
              <label>Theme*</label>
              <select value={form.theme} onChange={(e) => set("theme", e.target.value)}>
                <option value="">Select a theme…</option>
                {SIH_THEMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="fset">
            <span className="mono">2 · You (Team Leader)</span>
            <div className="two">
              <div className={`fld${errs.leaderName ? " bad" : ""}`}><label>Name*</label><input value={form.leaderName} onChange={(e) => set("leaderName", e.target.value)} /></div>
              <div className={`fld${errs.leaderEmail ? " bad" : ""}`}><label>Email*</label><input type="email" value={form.leaderEmail} onChange={(e) => set("leaderEmail", e.target.value)} /></div>
              <div className={`fld${errs.leaderPhone ? " bad" : ""}`}><label>Mobile*</label><input type="tel" value={form.leaderPhone} onChange={(e) => set("leaderPhone", e.target.value)} /></div>
              
              <div className={`fld${errs.leaderProgram ? " bad" : ""}`}>
                <label>Program*</label>
                <select value={form.leaderProgram} onChange={(e) => { set("leaderProgram", e.target.value); set("leaderBranch", ""); }}>
                  <option value="">Select</option>
                  {Object.keys(PROGRAMS_DATA).map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className={`fld${errs.leaderBranch ? " bad" : ""}`}>
                <label>Branch*</label>
                <select value={form.leaderBranch} onChange={(e) => set("leaderBranch", e.target.value)} disabled={!form.leaderProgram}>
                  <option value="">Select</option>
                  {form.leaderProgram && PROGRAMS_DATA[form.leaderProgram].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className={`fld${errs.leaderYear ? " bad" : ""}`}>
                <label>Year*</label>
                <select value={form.leaderYear} onChange={(e) => set("leaderYear", e.target.value)}>
                  <option value="">Select</option>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className={`fld${errs.leaderGender ? " bad" : ""}`}>
                <label>Gender*</label>
                <select value={form.leaderGender} onChange={(e) => set("leaderGender", e.target.value)}>
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="fld"><label>Your skills</label><input value={form.leaderSkills} onChange={(e) => set("leaderSkills", e.target.value)} placeholder="e.g. React, Node" /></div>
            </div>
          </div>

          <div className="fset">
            <span className="mono">3 · Members already in the team</span>
            <p className="hint">Leave rows empty if you are looking for members. If you enter a name, all fields for that row become mandatory.</p>
            {form.members.map((m, i) => (
              <div key={i} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 12, marginBottom: 12, background: "var(--surface)" }}>
                <b style={{display: 'block', marginBottom: 8, fontSize: 12}}>Member {i + 2}</b>
                <div className="two" style={{gap: 8}}>
                  <div className="fld"><input placeholder="Name" value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)} /></div>
                  <div className="fld"><input placeholder="Email" type="email" value={m.email} onChange={(e) => updateMember(i, "email", e.target.value)} /></div>
                  <div className="fld"><input placeholder="Mobile" type="tel" value={m.phone} onChange={(e) => updateMember(i, "phone", e.target.value)} /></div>
                  <div className="fld">
                    <select value={m.program} onChange={(e) => updateMember(i, "program", e.target.value)}>
                      <option value="">Program</option>
                      {Object.keys(PROGRAMS_DATA).map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="fld">
                    <select value={m.branch} onChange={(e) => updateMember(i, "branch", e.target.value)} disabled={!m.program}>
                      <option value="">Branch</option>
                      {m.program && PROGRAMS_DATA[m.program].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="fld">
                    <select value={m.year} onChange={(e) => updateMember(i, "year", e.target.value)}>
                      <option value="">Year</option>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="fld">
                    <select value={m.gender} onChange={(e) => updateMember(i, "gender", e.target.value)}>
                      <option value="">Gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Prefer not to say">N/A</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {errs.members && <p className="err" style={{display: 'block'}}>Please fill all fields for the added members.</p>}
          </div>

          <div className="fset">
            <span className="mono">4 · What you still need</span>
            <div className={`fld${errs.wantsSkills ? " bad" : ""}`}>
              <label>Skills you are looking for*</label>
              <div className="chipbar">
                {SKILLS.map((s) => (
                  <button key={s} type="button" className={`chip${form.wantsSkills.includes(s) ? " on" : ""}`} onClick={() => toggleSkill(s)}>{s}</button>
                ))}
              </div>
              {form.wantsSkills.includes("Other (Custom)") && (
                <input style={{marginTop: 10}} placeholder="Specify other skill..." value={form.customSkill} onChange={(e) => set("customSkill", e.target.value)} />
              )}
            </div>
          </div>

        </form>
        <div className="mfoot">
          <span className="sp" />
          <button className="btn gho" type="button" onClick={onClose}>Cancel</button>
          <button className="btn pri" type="button" onClick={submit}>Register Team</button>
        </div>
      </div>
    </div>
  );
}
