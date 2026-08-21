import { useState, useEffect } from "react";
import { useSIH } from "../../hooks/useSIH";
import { SIH_THEMES, SKILLS, DEPARTMENTS, YEARS } from "../../data/constants";

const EMPTY_MEMBER = { name: "", dept: "CSE", year: "3rd Year", gender: "na", skills: "" };

export default function TeamModal({ onClose, initialData, onSuccess }) {
  const { addTeam, updateTeam, college, addToast, user } = useSIH();
  const [step, setStep] = useState(1);
    const leader = initialData?.members?.[0] || {};
  const emptyMembers = [
    { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }
  ];
  
  let initialMembers = emptyMembers;
  if (initialData?.members && initialData.members.length > 1) {
    const others = initialData.members.slice(1);
    initialMembers = others.concat(emptyMembers).slice(0, 4);
  }

  let initPhone = "";
  let initEmail = "";
  if (initialData?.contact) {
    const parts = initialData.contact.split("|");
    initPhone = parts[0]?.trim() || "";
    initEmail = parts[1]?.trim() || "";
  }

  const [form, setForm] = useState({
    teamName: initialData?.teamName || "", 
    college: initialData?.college || college || "Suryodaya College of Engineering and Technology",
    track: initialData?.track || "", 
    theme: initialData?.theme || "",
    hasIdea: initialData?.hasIdea || false, 
    psId: initialData?.psId || "", 
    psTitle: initialData?.psTitle || "", 
    pitch: initialData?.pitch || "",
    leaderName: leader.name || "", 
    leaderDept: leader.dept || "CSE", 
    leaderYear: leader.year || "3rd Year", 
    leaderGender: leader.gender || "na", 
    leaderSkills: leader.skills || "",
    members: initialMembers,
    wantsSkills: initialData?.wantsSkills || [], 
    hasMentor: initialData?.hasMentor || false,
    phone: initPhone, 
    email: initEmail,
  });
  const [errs, setErrs] = useState({});
  
  useEffect(() => {
    if (!initialData && user) {
      setForm(p => ({
        ...p,
        email: p.email || user.email || "",
        leaderName: p.leaderName || user.user_metadata?.full_name || "",
      }));
    }
  }, [user, initialData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleSkill = (s) => {
    setForm((f) => ({
      ...f,
      wantsSkills: f.wantsSkills.includes(s)
        ? f.wantsSkills.filter((x) => x !== s)
        : [...f.wantsSkills, s],
    }));
  };

  const updateMember = (i, k, v) => {
    const m = [...form.members];
    m[i] = { ...m[i], [k]: v };
    setForm((f) => ({ ...f, members: m }));
  };

  const validate = () => {
    const e = {};
    if (!form.teamName.trim()) e.teamName = true;
    if (!form.track) e.track = true;
    if (!form.theme) e.theme = true;
    if (!form.leaderName.trim()) e.leaderName = true;
    if (!form.wantsSkills.length) e.wantsSkills = true;
    if (!form.phone.trim()) e.phone = true;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
        const filledMembers = form.members.filter((m) => m.name.trim());
    const totalMembers = 1 + filledMembers.length; // leader + members
    const seatsOpen = Math.max(0, 6 - totalMembers);
    const payload = {
      teamName: form.teamName.trim(),
      college: form.college || college,
      track: form.track,
      theme: form.theme,
      hasIdea: form.hasIdea,
      psId: form.psId.trim(),
      psTitle: form.psTitle.trim(),
      pitch: form.pitch.trim(),
      hasMentor: form.hasMentor,
      contact: form.phone + ' | ' + form.email,
      needsFemale: true, // simplified
      wantsSkills: form.wantsSkills,
      seatsOpen,
      totalSeats: 6,
      members: [
        { name: form.leaderName, dept: form.leaderDept, year: form.leaderYear, gender: form.leaderGender, skills: form.leaderSkills },
        ...filledMembers,
      ],
    };

    try { 
      if (initialData) {
        await updateTeam(initialData.id, payload);
        addToast("Team updated!", "ok");
      } else {
        await addTeam(payload);
        addToast("Team posted! Others can now find you.", "ok");
        if (onSuccess) onSuccess();
      }
      onClose();
    } catch (e) {}

  };

  return (
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <div className="mhead">
          <div>
            <h2>{initialData ? "Edit your team" : "Create your team"}</h2>
            <p>Only what a student needs to decide if they fit. Your number stays private until you accept someone.</p>
          </div>
          <button className="x" type="button" onClick={onClose}>×</button>
        </div>
        <form className="mbody" onSubmit={(e) => e.preventDefault()} noValidate>

          {/* Section 1: Team */}
          <div className="fset">
            <span className="mono">1 · The team</span>
            <div className="two">
              <div className={`fld${errs.teamName ? " bad" : ""}`}>
                <label htmlFor="tName">Team name<em>*</em></label>
                <input id="tName" maxLength={46} placeholder="e.g. Team Voltbridge"
                  disabled={!!initialData}
                  value={form.teamName} onChange={(e) => set("teamName", e.target.value)}
                  style={initialData ? { opacity: 0.7 } : {}} />
                <p className="err">Give your team a name.</p>
              </div>
              <div className="fld">
                <label>College</label>
                <input value={form.college} disabled style={{ opacity: 0.7 }} />
              </div>
            </div>
            <div className={`fld${errs.track ? " bad" : ""}`}>
              <label>Track<em>*</em></label>
              <div className="radios">
                {["Software", "Hardware"].map((t) => (
                  <label key={t} className={`radio${form.track === t ? " on" : ""}`}>
                    <input type="radio" name="track" value={t} onChange={() => set("track", t)} />
                    <b>{t}</b>
                    <small>{t === "Software" ? "App, web, AI, data" : "PCB, embedded, robots"}</small>
                  </label>
                ))}
              </div>
              <p className="err">Pick one track.</p>
            </div>
            <div className={`fld${errs.theme ? " bad" : ""}`}>
              <label>Theme<em>*</em></label>
              <select value={form.theme} onChange={(e) => set("theme", e.target.value)}>
                <option value="">Select a theme…</option>
                {SIH_THEMES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <p className="err">Pick the theme you are going for.</p>
            </div>
            <label className="check">
              <input type="checkbox" checked={form.hasIdea} onChange={(e) => set("hasIdea", e.target.checked)} />
              <span className="check-box" aria-hidden="true" />
              <span className="check-txt">We already have an idea</span>
              <span className="check-state" data-off="No idea yet" data-on="Yes" />
            </label>
            {form.hasIdea && (
              <div style={{ display: "grid", gap: 13 }}>
                <div className="two">
                  <div className="fld">
                    <label htmlFor="tPsId">Problem statement ID</label>
                    <input id="tPsId" maxLength={16} placeholder="e.g. SIH26P103"
                      value={form.psId} onChange={(e) => set("psId", e.target.value)} />
                  </div>
                  <div className="fld">
                    <label htmlFor="tPsTitle">Problem statement title</label>
                    <input id="tPsTitle" maxLength={90} placeholder="Short title"
                      value={form.psTitle} onChange={(e) => set("psTitle", e.target.value)} />
                  </div>
                </div>
                <div className="fld">
                  <label htmlFor="tPitch">One line about your idea</label>
                  <textarea id="tPitch" maxLength={180}
                    placeholder="e.g. A low cost IoT node that spots water leaks in campus pipelines and alerts on WhatsApp."
                    value={form.pitch} onChange={(e) => set("pitch", e.target.value)} />
                  <p className="hint">{form.pitch.length}/180</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Leader */}
          <div className="fset">
            <span className="mono">2 · You (team leader)</span>
            <div className="three">
              <div className={`fld${errs.leaderName ? " bad" : ""}`}>
                <label htmlFor="tLName">Your name<em>*</em></label>
                <input id="tLName" maxLength={46}
                  value={form.leaderName} onChange={(e) => set("leaderName", e.target.value)} />
                <p className="err">Needed.</p>
              </div>
              <div className="fld">
                <label>Department</label>
                <select value={form.leaderDept} onChange={(e) => set("leaderDept", e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="fld">
                <label>Year</label>
                <select value={form.leaderYear} onChange={(e) => set("leaderYear", e.target.value)}>
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="two">
              <div className="fld">
                <label>Gender</label>
                <select value={form.leaderGender} onChange={(e) => set("leaderGender", e.target.value)}>
                  <option value="na">Prefer not to say</option>
                  <option value="f">Female</option>
                  <option value="m">Male</option>
                </select>
                <p className="hint">Used only for the "1 female member" SIH rule.</p>
              </div>
              <div className="fld">
                <label>Your main skills</label>
                <input maxLength={80} placeholder="e.g. firmware, PCB"
                  value={form.leaderSkills} onChange={(e) => set("leaderSkills", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3: Members */}
          <div className="fset">
            <span className="mono">3 · Members already in the team</span>
            <p className="hint" style={{ margin: 0 }}>You are member 1. Add anyone who already said yes. Leave the rest empty — those become open seats.</p>
            <div style={{ display: "grid", gap: 9 }}>
              {form.members.map((m, i) => (
                <div key={i} className="mrow">
                  <input placeholder={`Member ${i + 2} name (optional)`} value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)} />
                  <select value={m.dept} onChange={(e) => updateMember(i, "dept", e.target.value)}>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <select value={m.year} onChange={(e) => updateMember(i, "year", e.target.value)}>
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                  <select value={m.gender} onChange={(e) => updateMember(i, "gender", e.target.value)} style={{ padding: "9px 6px" }}>
                    <option value="na">—</option>
                    <option value="f">F</option>
                    <option value="m">M</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Needs */}
          <div className="fset">
            <span className="mono">4 · What you still need</span>
            <div className={`fld${errs.wantsSkills ? " bad" : ""}`}>
              <label>Skills you are looking for<em>*</em></label>
              <div className="chipbar" style={{ margin: 0 }}>
                {SKILLS.map((s) => (
                  <button key={s} type="button"
                    className={`chip${form.wantsSkills.includes(s) ? " on" : ""}`}
                    onClick={() => toggleSkill(s)}>{s}</button>
                ))}
              </div>
              <p className="err">Pick at least one skill you need.</p>
            </div>
            <label className="check">
              <input type="checkbox" checked={form.hasMentor} onChange={(e) => set("hasMentor", e.target.checked)} />
              <span className="check-box" aria-hidden="true" />
              <span className="check-txt">We already have a mentor</span>
              <span className="check-state" data-off="Not yet" data-on="Yes" />
            </label>
          </div>

          {/* Section 5: Contact */}
          <div className="fset">
            <span className="mono">5 · Private contact</span>
            <p className="hint" style={{ margin: 0 }}>Never shown on the board. Shared only after you accept a request.</p>
            <div className="two">
              <div className={`fld${errs.phone ? " bad" : ""}`}>
                <label htmlFor="tPhone">WhatsApp number<em>*</em></label>
                <input id="tPhone" inputMode="tel" maxLength={18} placeholder="10 digit number"
                  value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                <p className="err">Enter a valid number.</p>
              </div>
              <div className="fld">
                <label htmlFor="tEmail">Email</label>
                <input id="tEmail" type="email" maxLength={70}
                  value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>
            <div className="note warn">
              <span>🔒</span>
              <span>Your number and email are <b>never</b> shown on the board.</span>
            </div>
          </div>

        </form>
        <div className="mfoot">
          <span className="sp" />
          <button className="btn gho" type="button" onClick={onClose}>Cancel</button>
          <button className="btn pri" type="button" onClick={submit}>{initialData ? "Save Changes" : "Post team"}</button>
        </div>
      </div>
    </div>
  );
}








