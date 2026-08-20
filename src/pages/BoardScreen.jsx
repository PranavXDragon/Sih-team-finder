import './BoardScreen.css';
import { useState, useMemo, useEffect } from "react";
import { useSIH } from "../hooks/useSIH";
import { SIH_THEMES, SKILLS } from "../data/constants";
import TeamCard from "../components/TeamCard";
import SeekerCard from "../components/SeekerCard";
import TeamModal from "../components/modals/TeamModal";
import SeekerModal from "../components/modals/SeekerModal";

export default function BoardScreen({ initialAction, onBack }) {
  const { teams, seekers, college, isLoading, myTeam } = useSIH();

  const [tab, setTab] = useState(initialAction === "list-seeker" ? "seekers" : "teams");
  const [query, setQuery] = useState("");
  const [filterTrack, setFilterTrack] = useState("");
  const [filterTheme, setFilterTheme] = useState("");
  const [filterFemale, setFilterFemale] = useState(false);
  const [filterHasPs, setFilterHasPs] = useState(false);
  const [activeSkills, setActiveSkills] = useState([]);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showSeekerModal, setShowSeekerModal] = useState(false);

  useEffect(() => {
    if (initialAction === "post-team") {
      setShowTeamModal(true);
    } else if (initialAction === "list-seeker") {
      setShowSeekerModal(true);
    }
  }, [initialAction]);

  const toggleSkill = (s) =>
    setActiveSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const clearAll = () => {
    setQuery(""); setFilterTrack(""); setFilterTheme("");
    setFilterFemale(false); setFilterHasPs(false); setActiveSkills([]);
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (filterTrack && t.track !== filterTrack) return false;
      if (filterTheme && t.theme !== filterTheme) return false;
      if (filterFemale && !t.needsFemale) return false;
      if (filterHasPs && !t.psId) return false;
      if (query && !t.teamName.toLowerCase().includes(query.toLowerCase()) && !t.psId?.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeSkills.length > 0) {
        if (!t.wantsSkills) return false;
        if (!activeSkills.some((s) => t.wantsSkills.includes(s))) return false;
      }
      return true;
    });
  }, [teams, filterTrack, filterTheme, filterFemale, filterHasPs, query, activeSkills]);

  const filteredSeekers = useMemo(() => {
    return seekers.filter((s) => {
      if (!s.listed) return false;
      if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeSkills.length > 0) {
        if (!s.skills) return false;
        if (!activeSkills.some((sk) => s.skills.includes(sk))) return false;
      }
      return true;
    });
  }, [seekers, query, activeSkills]);

  if (isLoading) {
    return (
      <main className="board">
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <h2>Loading the board...</h2>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="backbar">
        <button className="btn sm gho" type="button" onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--mut)", display: "flex", alignItems: "center", gap: 6, padding: "0" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7"/>
          </svg>
          Back to start
        </button>
      </div>

      <main className="board" style={{ paddingTop: 0 }}>
        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${tab === "teams" ? "on" : ""}`} onClick={() => setTab("teams")}>Teams <span className="cnt">{teams.length}</span></button>
          <button className={`tab ${tab === "seekers" ? "on" : ""}`} onClick={() => setTab("seekers")}>Seekers <span className="cnt">{seekers.length}</span></button>
        </div>

        {/* BOARD BAR */}
        <div className="boardbar">
          <div className="bb-txt">
            <b>{tab === "teams" ? "Teams looking for members" : "Students looking for teams"}</b>
            <span>{tab === "teams" ? `${teams.length} Teams up` : `${seekers.length} Seekers free`}</span>
          </div>
          <span className="sp" />
          
          <div style={{ display: "flex", gap: 12 }}>
            {!myTeam && (
              <button className="btn sm pri" type="button" onClick={() => setShowTeamModal(true)}>+ Post a team</button>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <aside className="filters">
          <div className="f">
            <input type="text" placeholder={tab === "teams" ? "Search teams or PS..." : "Search students..."} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {tab === "teams" && (
            <>
              <div className="f">
                <select value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)}>
                  <option value="">All Tracks</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
              <div className="f">
                <select value={filterTheme} onChange={(e) => setFilterTheme(e.target.value)}>
                  <option value="">All Themes</option>
                  {SIH_THEMES.map((th) => <option key={th} value={th}>{th}</option>)}
                </select>
              </div>
            </>
          )}
          
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 16, marginTop: 12, paddingBottom: 16 }}>
            <div style={{ width: "100%" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--mut)", display: "block", marginBottom: 8 }}>Filter by skills needed:</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SKILLS.map((s) => {
                  const active = activeSkills.includes(s);
                  return (
                    <button key={s} type="button" className={`chip ${active ? "on" : ""}`} onClick={() => toggleSkill(s)}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              {tab === "teams" && (
                <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: "0.9rem", color: "var(--text)" }}>
                  <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer", fontWeight: 600 }}>
                    <input type="checkbox" checked={filterFemale} onChange={(e) => setFilterFemale(e.target.checked)} />
                    Needs Female
                  </label>
                  <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer", fontWeight: 600 }}>
                    <input type="checkbox" checked={filterHasPs} onChange={(e) => setFilterHasPs(e.target.checked)} />
                    Has PS
                  </label>
                </div>
              )}
              
              <button className="btn sm" type="button" onClick={clearAll} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text)", marginLeft: tab !== "teams" ? 0 : "auto" }}>Clear Filters</button>
            </div>
          </div>
        </aside>

        {/* LIST */}
        {tab === "teams" ? (
          <div className="grid">
            {filteredTeams.map((t) => (
              <TeamCard key={t.id} team={t} />
            ))}
            {filteredTeams.length === 0 && (
              <div className="empty" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                <h3>No teams match your filters</h3>
                <p>Try clearing the filters, or be the first to post a team!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid">
            {filteredSeekers.map((s) => (
              <SeekerCard key={s.id} seeker={s} />
            ))}
            {filteredSeekers.length === 0 && (
              <div className="empty" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                <h3>No seekers match your filters</h3>
                <p>Try clearing the filters!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showTeamModal   && <TeamModal   onClose={() => setShowTeamModal(false)} />}
      {showSeekerModal && <SeekerModal onClose={() => setShowSeekerModal(false)} />}
    </>
  );
}







