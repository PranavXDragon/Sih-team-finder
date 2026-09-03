import { useState } from "react";
import { createPortal } from "react-dom";
import { useSIH } from "../../hooks/useSIH";
import { SIH_THEMES, SKILLS, YEARS, PROGRAMS_DATA } from "../../data/constants";

import CustomSelect from "../CustomSelect";

const EMPTY_MEMBER = { name: "", email: "", phone: "", program: "UG", branch: "Computer Engineering", year: "3rd Year", gender: "na", category: "Unreserved(UR)", pwd: "Not Applicable" };

const KNOWN_CATEGORIES = ["Unreserved(UR)", "OBC", "SC", "ST", "EWS"];

const CATEGORY_OPTIONS = [
  { value: "Unreserved(UR)", label: "Unreserved(UR)" },
  { value: "OBC", label: "OBC" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "EWS", label: "EWS" }
];

const PWD_OPTIONS = [
  { value: "Not Applicable", label: "Not Applicable" },
  { value: "Visually Impaired(VI)", label: "Visually Impaired(VI)" },
  { value: "Locomotor Disability(LD)", label: "Locomotor Disability(LD)" },
  { value: "Hearing Impaired(HI)", label: "Hearing Impaired(HI)" }
];

const GENDER_OPTIONS = [
  { value: "na", label: "Prefer not to say" },
  { value: "f", label: "Female" },
  { value: "m", label: "Male" }
];

const MEMBER_GENDER_OPTIONS = [
  { value: "na", label: "Prefer not to say" },
  { value: "f", label: "Female" },
  { value: "m", label: "Male" }
];

export default function TeamModal({ onClose, initialData, onSuccess }) {
  const { addTeam, updateTeam, college, addToast, user, removeMember } = useSIH();
  const [submitting, setSubmitting] = useState(false);
  const leader = initialData?.members?.[0] || {};
  const emptyMembers = [
    { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }
  ];

  let initialMembers = emptyMembers;
  if (initialData?.members && initialData.members.length > 1) {
    const others = initialData.members.slice(1).map(m => {
      let cat = m.category || "Unreserved(UR)";
      if (cat && !KNOWN_CATEGORIES.includes(cat)) {
        cat = "Unreserved(UR)";
      }
      return {
        name: m.name || "",
        email: m.email || "",
        phone: m.phone || "",
        program: m.program || "UG",
        branch: m.dept || "Computer Engineering",
        year: m.year || "3rd Year",
        gender: m.gender || "na",
        category: cat,
        pwd: m.pwd || "Not Applicable",
        skills: m.skills || "",
        user_id: m.user_id
      };
    });
    initialMembers = others.concat(emptyMembers).slice(0, 5);
  }

  let initPhone = "";
  let initEmail = "";
  if (initialData?.contact) {
    const parts = initialData.contact.split("|");
    initPhone = parts[0]?.trim() || "";
    initEmail = parts[1]?.trim() || "";
  }

  let initWantsSkills = initialData?.wantsSkills || [];
  let initCustomSkill = "";
  if (initialData?.wantsSkills) {
    const custom = initialData.wantsSkills.find(s => !SKILLS.includes(s) && s !== "Other (Custom)");
    if (custom) {
      initCustomSkill = custom;
      if (!initWantsSkills.includes("Other (Custom)")) {
        initWantsSkills = [...initWantsSkills, "Other (Custom)"];
      }
    }
  }

  let initLeaderCategory = leader.category || "Unreserved(UR)";
  if (initLeaderCategory && !KNOWN_CATEGORIES.includes(initLeaderCategory)) {
    initLeaderCategory = "Unreserved(UR)";
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
    leaderName: leader.name || (!initialData && user ? user.user_metadata?.full_name : ""),
    leaderProgram: leader.program || "UG",
    leaderBranch: leader.dept || "Computer Engineering",
    leaderYear: leader.year || "3rd Year",
    leaderGender: leader.gender || "na",
    leaderCategory: initLeaderCategory,
    leaderPwd: leader.pwd || "Not Applicable",
    leaderSkills: leader.skills || "",
    members: initialMembers,
    wantsSkills: initWantsSkills,
    customSkill: initCustomSkill,
    hasMentor: initialData?.hasMentor || false,
    phone: initPhone,
    email: initEmail || (!initialData && user ? user.email : ""),
  });
  const [errs, setErrs] = useState({});

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
    if (form.hasIdea && !form.theme) e.theme = true;
    if (!form.leaderName.trim()) e.leaderName = true;
    if (!form.leaderGender || form.leaderGender === "na") e.leaderGender = true;
    if (form.hasIdea && !form.wantsSkills.length) e.wantsSkills = true;
    if (!form.phone.trim()) e.phone = true;

    // Member validation: if name is entered, all other fields are required
    let membersValid = true;
    form.members.forEach((m) => {
      if (m.name.trim()) {
        if (!m.email.trim() || !m.phone.trim() || !m.program || !m.branch || !m.year || !m.gender || m.gender === "na") {
          membersValid = false;
        }
      }
    });
    if (!membersValid) e.members = true;

    setErrs(e);
    if (Object.keys(e).length > 0) {
      const friendlyNames = {
        teamName: "team name",
        track: "track",
        theme: "theme",
        leaderName: "leader name",
        leaderGender: "gender",
        wantsSkills: "skills needed",
        phone: "contact number",
        members: "member details"
      };
      const missingFields = Object.keys(e).map(key => friendlyNames[key] || key);
      addToast("Please fill all mandatory fields: " + missingFields.join(", "), "err");
      return false;
    }

    // SIH rule: A complete team of 6 members must include at least one female student
    const filledMembers = form.members.filter((m) => m.name.trim());
    const totalMembers = 1 + filledMembers.length;
    const hasFemale = (form.leaderGender === 'f') || filledMembers.some(m => m.gender === 'f');
    if (totalMembers === 6 && !hasFemale) {
      addToast("SIH Rules: A complete 6-person team must include at least one female member.", "err");
      return false;
    }

    return true;
  };

  const submit = async () => {
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    const filledMembers = form.members.filter((m) => m.name.trim());
    const totalMembers = 1 + filledMembers.length; // leader + members
    const seatsOpen = Math.max(0, 6 - totalMembers);
    let finalWantsSkills = form.wantsSkills.filter(s => s !== "Other (Custom)");
    if (form.wantsSkills.includes("Other (Custom)") && form.customSkill.trim()) {
      finalWantsSkills.push(form.customSkill.trim());
    }

    const hasFemale = (form.leaderGender === 'f') || filledMembers.some(m => m.gender === 'f');
    const payload = {
      teamName: (form.teamName || "").trim(),
      college: form.college || college,
      track: form.track,
      theme: form.theme,
      hasIdea: form.hasIdea,
      psId: (form.psId || "").trim(),
      psTitle: (form.psTitle || "").trim(),
      pitch: (form.pitch || "").trim(),
      contact: String(form.phone || "").replace(/\D/g, '') + ' | ' + (form.email || "").trim(),
      needsFemale: !hasFemale,
      wantsSkills: finalWantsSkills,
      seatsOpen,
      totalSeats: 6,
      members: [
        {
          name: (form.leaderName || "").trim(),
          program: form.leaderProgram,
          dept: form.leaderBranch,
          year: form.leaderYear,
          gender: form.leaderGender,
          category: form.leaderCategory,
          pwd: form.leaderPwd,
          skills: (form.leaderSkills || "").trim(),
          email: (form.email || "").trim(),
          phone: String(form.phone || "").replace(/\D/g, '')
        },
        ...filledMembers.map(m => ({
          name: (m.name || "").trim(),
          email: (m.email || "").trim(),
          phone: String(m.phone || "").replace(/\D/g, ''),
          program: m.program,
          dept: m.branch,
          year: m.year,
          gender: m.gender,
          category: m.category,
          pwd: m.pwd,
          skills: (m.skills || "").trim(),
          user_id: m.user_id
        })),
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
    } catch (err) {
      console.error("Error submitting team:", err);
      addToast(err.message || "Failed to post team", "err");
    } finally {
      setSubmitting(false);
    }

  };

  return createPortal(
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
                  <label key={t} className={`radio${form.track === t ? " on" : ""}`} onClick={() => set("track", t)}>
                    <input type="radio" name="track" value={t} onChange={() => set("track", t)} />
                    <b>{t}</b>
                    <small>{t === "Software" ? "App, web, AI, data" : "PCB, embedded, robots"}</small>
                  </label>
                ))}
              </div>
              <p className="err">Pick one track.</p>
            </div>
            <label className="check">
              <input type="checkbox" checked={form.hasIdea} onChange={(e) => set("hasIdea", e.target.checked)} />
              <span className="check-box" aria-hidden="true" />
              <span className="check-txt">We already have an SIH Problem Statement</span>
              <span className="check-state" data-off="No PS/Idea yet" data-on="Yes" />
            </label>
            {form.hasIdea && (
              <div style={{ display: "grid", gap: 13 }}>
                <div className={`fld${errs.theme ? " bad" : ""}`}>
                  <label>Theme<em>*</em></label>
                  <CustomSelect
                    value={form.theme}
                    onChange={(val) => set("theme", val)}
                    options={SIH_THEMES}
                    placeholder="Select a theme…"
                  />
                  <p className="err">Pick the theme you are going for.</p>
                </div>
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
                <p className="hint" style={{ marginTop: "-8px", marginBottom: "4px", color: "var(--mut)" }}>
                  Use latest problem statement.
                </p>
                <div className="fld">
                  <label htmlFor="tPitch">One line about your idea</label>
                  <textarea id="tPitch" maxLength={500}
                    placeholder="e.g. A low cost IoT node that spots water leaks in campus pipelines and alerts on WhatsApp."
                    value={form.pitch} onChange={(e) => set("pitch", e.target.value)} />
                  <p className="hint">{form.pitch.length}/500</p>
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
                <label>Program</label>
                <CustomSelect
                  value={form.leaderProgram}
                  onChange={(val) => {
                    const defaultBranch = PROGRAMS_DATA[val]?.[0] || "";
                    setForm(p => ({
                      ...p,
                      leaderProgram: val,
                      leaderBranch: defaultBranch
                    }));
                  }}
                  options={Object.keys(PROGRAMS_DATA)}
                />
              </div>
              <div className="fld">
                <label>Branch</label>
                <CustomSelect
                  value={form.leaderBranch}
                  onChange={(val) => set("leaderBranch", val)}
                  options={form.leaderProgram ? PROGRAMS_DATA[form.leaderProgram] : []}
                  placeholder="Select branch…"
                />
              </div>
            </div>
            <div className="three">
              <div className="fld">
                <label>Year</label>
                <CustomSelect
                  value={form.leaderYear}
                  onChange={(val) => set("leaderYear", val)}
                  options={YEARS}
                />
              </div>
              <div className={`fld${errs.leaderGender ? " bad" : ""}`}>
                <label>Gender<em>*</em></label>
                <CustomSelect
                  value={form.leaderGender}
                  onChange={(val) => set("leaderGender", val)}
                  options={GENDER_OPTIONS}
                />
              </div>
              <div className="fld">
                <label>Category</label>
                <CustomSelect
                  value={form.leaderCategory}
                  onChange={(val) => set("leaderCategory", val)}
                  options={CATEGORY_OPTIONS}
                />
              </div>
              <div className="fld">
                <label>Pwd</label>
                <CustomSelect
                  value={form.leaderPwd}
                  onChange={(val) => set("leaderPwd", val)}
                  options={PWD_OPTIONS}
                />
              </div>
            </div>
            <div className="fld" style={{ marginTop: 12 }}>
              <label>Your main skills</label>
              <input maxLength={80} placeholder="e.g. firmware, PCB"
                value={form.leaderSkills} onChange={(e) => set("leaderSkills", e.target.value)} />
            </div>
          </div>

          {/* Section 3: Members */}
          <div className="fset">
            <span className="mono">3 · Members already in the team</span>
            <p className="hint">You are member 1. Add anyone who already said yes. Leave the rest empty — those become open seats. If you enter a name, all fields for that member are required.</p>
            <div style={{ display: "grid", gap: 12 }}>
              {form.members.map((m, i) => (
                <div key={i} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <b style={{ fontSize: 13, color: "var(--accent-2)" }}>Member {i + 2}</b>
                    {m.name.trim() && (
                      <button
                        type="button"
                        className="btn sm"
                        style={{
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                          background: "rgba(239, 68, 68, 0.1)",
                          borderColor: "rgba(239, 68, 68, 0.2)",
                          color: "var(--stop)",
                          height: "auto",
                          margin: 0
                        }}
                        onClick={async () => {
                          if (confirm(`Are you sure you want to remove ${m.name} from the team?`)) {
                            if (m.user_id && initialData) {
                              await removeMember(initialData.id, m.user_id, m.email, m.name, initialData.teamName);
                            }
                            // Clear local state fields for this member
                            const updated = [...form.members];
                            updated[i] = { ...EMPTY_MEMBER };
                            setForm(f => ({ ...f, members: updated }));
                            addToast("Member removed from visual list. Click 'Save Changes' to update the team.", "ok");
                          }
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="three" style={{ gap: 12, marginBottom: 12 }}>
                    <div className="fld">
                      <input placeholder="Name (optional)" value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)} />
                    </div>
                    <div className="fld">
                      <input placeholder="Email" type="email" value={m.email} onChange={(e) => updateMember(i, "email", e.target.value)} disabled={!m.name} />
                    </div>
                    <div className="fld">
                      <input placeholder="Mobile Number" type="tel" value={m.phone} onChange={(e) => updateMember(i, "phone", e.target.value.replace(/\D/g, ''))} disabled={!m.name} />
                    </div>
                  </div>
                  <div className="mrow-dropdowns">
                    <CustomSelect
                      value={m.program}
                      onChange={(val) => {
                        const defaultBranch = PROGRAMS_DATA[val]?.[0] || "";
                        const updated = [...form.members];
                        updated[i] = { ...updated[i], program: val, branch: defaultBranch };
                        setForm(f => ({ ...f, members: updated }));
                      }}
                      options={Object.keys(PROGRAMS_DATA)}
                      disabled={!m.name}
                    />
                    <CustomSelect
                      value={m.branch}
                      onChange={(val) => updateMember(i, "branch", val)}
                      options={m.program ? PROGRAMS_DATA[m.program] : []}
                      placeholder="Select branch…"
                      disabled={!m.name}
                    />
                    <CustomSelect
                      value={m.year}
                      onChange={(val) => updateMember(i, "year", val)}
                      options={YEARS}
                      disabled={!m.name}
                    />
                    <CustomSelect
                      value={m.gender}
                      onChange={(val) => updateMember(i, "gender", val)}
                      options={MEMBER_GENDER_OPTIONS}
                      disabled={!m.name}
                    />
                    <div className="fld">
                      <CustomSelect
                        value={m.category || "Unreserved(UR)"}
                        onChange={(val) => updateMember(i, "category", val)}
                        options={CATEGORY_OPTIONS}
                        disabled={!m.name}
                      />
                    </div>
                  </div>
                  <div className="fld">
                    <CustomSelect
                      value={m.pwd || "Not Applicable"}
                      onChange={(val) => updateMember(i, "pwd", val)}
                      options={PWD_OPTIONS}
                      disabled={!m.name}
                    />
                  </div>
                </div>
              ))}
            </div>
            {errs.members && <p className="err" style={{ display: "block", marginTop: 8 }}>Please fill all fields for the added members.</p>}
          </div>

          {/* Section 4: Needs */}
          <div className="fset">
            <span className="mono">4 · What you still need</span>
            <div className={`fld${errs.wantsSkills ? " bad" : ""}`}>
              <label>Skills you are looking for{form.hasIdea && <em>*</em>}</label>
              <div className="chipbar" style={{ margin: 0 }}>
                {SKILLS.map((s) => (
                  <button key={s} type="button"
                    className={`chip${form.wantsSkills.includes(s) ? " on" : ""}`}
                    onClick={() => toggleSkill(s)}>{s}</button>
                ))}
              </div>
              {form.wantsSkills.includes("Other (Custom)") && (
                <div style={{ marginTop: 12 }}>
                  <input
                    type="text"
                    placeholder="Type the custom skill you need"
                    value={form.customSkill}
                    onChange={(e) => set("customSkill", e.target.value)}
                    maxLength={25}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
                  />
                </div>
              )}
              <p className="err">Pick at least one skill you need.</p>
            </div>
            <label className="check">
              <input type="checkbox" checked={form.hasMentor} onChange={(e) => set("hasMentor", e.target.checked)} />
              <span className="check-box" aria-hidden="true" />
              <span className="check-txt">Do you already have a mentor for your SIH team?</span>
              <span className="check-state" data-off="Not yet" data-on="Yes" />
            </label>
          </div>

          {/* Section 5: Contact */}
          <div className="fset">
            <span className="mono">5 · Private contact</span>
            <p className="hint" style={{ margin: 0 }}>Never shown on the board. Shared only after you accept a request.</p>
            <div className="two">
              <div className={`fld${errs.phone ? " bad" : ""}`}>
                <label htmlFor="tPhone">Team Leader WhatsApp number<em>*</em></label>
                <input id="tPhone" inputMode="tel" maxLength={18} placeholder="10 digit number"
                  value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ''))} />
                <p className="err">Enter a valid number.</p>
              </div>
              <div className="fld">
                <label htmlFor="tEmail">Team Leader Email</label>
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
          <button className="btn gho" type="button" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn pri" type="button" onClick={submit} disabled={submitting}>
            {submitting ? "Posting..." : (initialData ? "Save Changes" : "Post team")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}








