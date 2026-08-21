import { useState } from "react";
import { useSIH } from "../../hooks/useSIH";
import { SKILLS, DEPARTMENTS, YEARS } from "../../data/constants";

export default function SeekerModal({ initialData, onClose, onSuccess }) {
  const { addSeeker, updateSeeker, college, addToast } = useSIH();

  let initPhone = "";
  let initEmail = "";
  if (initialData?.whatsapp) {
    const parts = initialData.whatsapp.split("|");
    initPhone = parts[0]?.trim() || "";
    initEmail = parts[1]?.trim() || "";
  }

  const [form, setForm] = useState({
    name: initialData?.name || "",
    dept: initialData?.dept || "CSE",
    year: initialData?.year || "3rd Year",
    gender: initialData?.gender || "na",
    skills: initialData?.skills || [],
    bio: initialData?.bio || "",
    phone: initPhone,
    email: initEmail,
    listed: initialData?.listed ?? true,
    college: initialData?.college || college || "Suryodaya College of Engineering and Technology",
  });
  const [errs, setErrs] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleSkill = (s) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s)
        ? f.skills.filter((x) => x !== s)
        : [...f.skills, s],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.skills.length) e.skills = true;
    if (!form.bio.trim()) e.bio = true;
    if (!form.phone.trim()) e.phone = true;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        name: form.name.trim(),
        college: form.college || college,
        dept: form.dept,
        year: form.year,
        gender: form.gender,
        skills: form.skills,
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
    } catch (e) { }
  };

  return (
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="mhead">
          <div>
            <h2>{initialData ? "Edit Profile" : "List yourself as a seeker"}</h2>
            <p>Teams with open seats can find and invite you. Your number stays hidden until you accept.</p>
          </div>
          <button className="x" type="button" onClick={onClose}>×</button>
        </div>
        <form className="mbody" onSubmit={(e) => e.preventDefault()} noValidate>

          <div className="two">
            <div className={`fld${errs.name ? " bad" : ""}`}>
              <label htmlFor="sName">Your full name<em>*</em></label>
              <input id="sName" maxLength={46}
                value={form.name} onChange={(e) => set("name", e.target.value)} />
              <p className="err">Needed.</p>
            </div>
            <div className="fld">
              <label>College</label>
              <input value={form.college} disabled style={{ opacity: 0.7 }} />
            </div>
          </div>

          <div className="three">
            <div className="fld">
              <label>Department<em>*</em></label>
              <select value={form.dept} onChange={(e) => set("dept", e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="fld">
              <label>Year<em>*</em></label>
              <select value={form.year} onChange={(e) => set("year", e.target.value)}>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="fld">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="na">Prefer not to say</option>
                <option value="f">Female</option>
                <option value="m">Male</option>
              </select>
              <p className="hint">For the "1 female member" SIH rule.</p>
            </div>
          </div>

          <div className={`fld${errs.skills ? " bad" : ""}`}>
            <label>What are you good at?<em>*</em></label>
            <div className="chipbar" style={{ margin: 0 }}>
              {SKILLS.map((s) => (
                <button key={s} type="button"
                  className={`chip${form.skills.includes(s) ? " on" : ""}`}
                  onClick={() => toggleSkill(s)}>{s}</button>
              ))}
            </div>
            <p className="err">Pick at least one skill.</p>
          </div>

          <div className={`fld${errs.bio ? " bad" : ""}`}>
            <label htmlFor="sBio">One line about you<em>*</em></label>
            <textarea id="sBio" maxLength={170} rows={3}
              placeholder="e.g. I design my own PCBs and have 3 working ESP32 builds."
              value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            <p className="err">One line so a team leader can judge you in five seconds.</p>
            <p className="hint">{form.bio.length}/170</p>
          </div>

          <div className="two">
            <div className={`fld${errs.phone ? " bad" : ""}`}>
              <label htmlFor="sPhone">WhatsApp number<em>*</em></label>
              <input id="sPhone" inputMode="tel" maxLength={18} placeholder="10 digit number"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <p className="err">Enter a valid number.</p>
            </div>
            <div className="fld">
              <label htmlFor="sEmail">Email</label>
              <input id="sEmail" type="email" maxLength={70}
                value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>

          {initialData && (
            <div className="fld">
              <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer", fontWeight: 600 }}>
                <input type="checkbox" checked={form.listed} onChange={(e) => set("listed", e.target.checked)} />
                Visible on the board
              </label>
              <p className="hint">Uncheck this if you've found a team and want to hide your profile.</p>
            </div>
          )}

          <div className="note warn">
            <span>🔒</span>
            <span>Your number and email are <b>never</b> shown on the board. Shared only when you accept a team.</span>
          </div>

        </form>
        <div className="mfoot">
          <span className="sp" />
          <button className="btn gho" type="button" onClick={onClose}>Cancel</button>
          <button className="btn pri" type="button" onClick={submit}>{initialData ? "Save Changes" : "Save and list me"}</button>
        </div>
      </div>
    </div>
  );
}

