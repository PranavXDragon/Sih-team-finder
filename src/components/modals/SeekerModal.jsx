import { useState } from "react";
import { useSIH } from "../../hooks/useSIH";
import { SKILLS, PROGRAMS_DATA, YEARS } from "../../data/constants";

export default function SeekerModal({ initialData, onClose }) {
  const { addSeeker, updateSeeker, college, addToast } = useSIH();
  
  let initPhone = "";
  let initEmail = "";
  if (initialData?.whatsapp) {
    const parts = initialData.whatsapp.split("|");
    initPhone = parts[0]?.trim() || "";
    initEmail = parts[1]?.trim() || "";
  }

  // To avoid migration, we split the old "dept" if it contains a hyphen, or just use it as branch
  let initProg = "";
  let initBranch = initialData?.dept || "";
  if (initialData?.dept?.includes(" - ")) {
    const parts = initialData.dept.split(" - ");
    initProg = parts[0];
    initBranch = parts[1];
  }

  const [form, setForm] = useState({
    name: initialData?.name || "",
    program: initProg,
    branch: initBranch,
    year: initialData?.year || "",
    gender: initialData?.gender || "",
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
    if (!form.program) e.program = true;
    if (!form.branch) e.branch = true;
    if (!form.year) e.year = true;
    if (!form.gender) e.gender = true;
    if (!form.skills.length) e.skills = true;
    if (!form.bio.trim()) e.bio = true;
    if (!form.phone.trim()) e.phone = true;
    if (!form.email.trim()) e.email = true;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try { 
      const payload = {
        name: form.name.trim(),
        college: form.college,
        dept: `${form.program} - ${form.branch}`,
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
      }
      onClose();
    } catch (e) {}
  };

  return (
    <div className="veil open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="mhead">
          <div>
            <h2>{initialData ? "Edit Profile" : "List yourself as a seeker"}</h2>
            <p>Teams with open seats can find and invite you. Your number stays hidden until you accept.</p>
          </div>
          <button className="x" type="button" onClick={onClose}>x</button>
        </div>
        <form className="mbody" onSubmit={(e) => e.preventDefault()} noValidate>

          <div className="two">
            <div className={`fld${errs.name ? " bad" : ""}`}>
              <label htmlFor="sName">Your full name<em>*</em></label>
              <input id="sName" maxLength={46}
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="fld">
              <label>College</label>
              <input value={form.college} disabled style={{ opacity: 0.7 }} />
            </div>
          </div>

          <div className="two">
            <div className={`fld${errs.program ? " bad" : ""}`}>
              <label>Program<em>*</em></label>
              <select value={form.program} onChange={(e) => { set("program", e.target.value); set("branch", ""); }}>
                <option value="">Select</option>
                {Object.keys(PROGRAMS_DATA).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className={`fld${errs.branch ? " bad" : ""}`}>
              <label>Branch<em>*</em></label>
              <select value={form.branch} onChange={(e) => set("branch", e.target.value)} disabled={!form.program}>
                <option value="">Select</option>
                {form.program && PROGRAMS_DATA[form.program].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="two">
            <div className={`fld${errs.year ? " bad" : ""}`}>
              <label>Year<em>*</em></label>
              <select value={form.year} onChange={(e) => set("year", e.target.value)}>
                <option value="">Select</option>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className={`fld${errs.gender ? " bad" : ""}`}>
              <label>Gender<em>*</em></label>
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
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
          </div>

          <div className={`fld${errs.bio ? " bad" : ""}`}>
            <label htmlFor="sBio">One line about you<em>*</em></label>
            <textarea id="sBio" maxLength={170} rows={3}
              placeholder="e.g. I design my own PCBs and have 3 working ESP32 builds."
              value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            <p className="hint">{form.bio.length}/170</p>
          </div>

          <div className="two">
            <div className={`fld${errs.phone ? " bad" : ""}`}>
              <label htmlFor="sPhone">WhatsApp number<em>*</em></label>
              <input id="sPhone" inputMode="tel" maxLength={18} placeholder="10 digit number"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className={`fld${errs.email ? " bad" : ""}`}>
              <label htmlFor="sEmail">Email<em>*</em></label>
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
