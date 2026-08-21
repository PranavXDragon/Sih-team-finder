import './BoardScreen.css';
import { useState, useEffect } from "react";
import { useSIH } from "../hooks/useSIH";
import { SIH_THEMES } from "../data/constants";
import TeamCard from "../components/TeamCard";
import SeekerCard from "../components/SeekerCard";
import TeamModal from "../components/modals/TeamModal";
import SeekerModal from "../components/modals/SeekerModal";
import CustomSelect from "../components/CustomSelect";

export default function BoardScreen({ initialAction, onBack }) {
  const { teams, seekers, stats, isLoading } = useSIH();

  const [tab, setTab] = useState(initialAction === "list-seeker" ? "seekers" : "teams");
  const [query, setQuery] = useState("");
  const [filterTrack, setFilterTrack] = useState("");
  const [filterTheme, setFilterTheme] = useState("");
  const [filterFemale, setFilterFemale] = useState(false);
  const [filterHasPs, setFilterHasPs] = useState(false);
  const [activeSkills, setActiveSkills] = useState([]);

  // Initialize filterTeamId directly from window.location.hash
  const [filterTeamId, setFilterTeamId] = useState(() => {
    const hash = window.location.hash;
    return hash.includes('?team=') ? decodeURIComponent(hash.split('?team=')[1]) : "";
  });

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showSeekerModal, setShowSeekerModal] = useState(false);

  useEffect(() => {
    const handleHashTeam = () => {
      const hash = window.location.hash;
      setFilterTeamId(hash.includes('?team=') ? decodeURIComponent(hash.split('?team=')[1]) : "");
    };
    window.addEventListener("hashchange", handleHashTeam);
    return () => window.removeEventListener("hashchange", handleHashTeam);
  }, []);

  useEffect(() => {
    if (initialAction === "post-team") {
      setShowTeamModal(true);
    } else if (initialAction === "list-seeker") {
      setShowSeekerModal(true);
    }
  }, [initialAction]);

  // Clear team filter if they start typing other filters
  if ((query || filterTrack || filterTheme || filterFemale || filterHasPs || activeSkills.length > 0) && filterTeamId) {
    setFilterTeamId("");
    if (window.location.hash.includes("?team=")) {
      window.location.hash = "board";
    }
  }



  const clearAll = () => {
    setQuery(""); setFilterTrack(""); setFilterTheme("");
    setFilterFemale(false); setFilterHasPs(false); setActiveSkills([]);
    setFilterTeamId("");
    if (window.location.hash.includes("?team=")) {
      window.location.hash = "board";
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (filterTeamId) {
        const cleanStr = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
        const isMatch = t.id === filterTeamId || cleanStr(t.teamName) === cleanStr(filterTeamId);
        if (!isMatch) return false;
      }
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
  }, [teams, filterTrack, filterTheme, filterFemale, filterHasPs, query, activeSkills, filterTeamId]);

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
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          Back to start
        </button>
      </div>

      <main className="board" style={{ paddingTop: 0 }}>
        {/* STAMPS */}
        <section className="stamps" style={{ marginBottom: "30px" }}>
          <div className="stamp"><b>{stats.teams}</b><span>Teams up</span></div>
          <div className="stamp"><b>{stats.seats}</b><span>Seats open</span></div>
          <div className="stamp"><b>{stats.seekers}</b><span>Students free</span></div>
          <div className="stamp"><b>{stats.teams + stats.seekers}</b><span>Active Users</span></div>
        </section>

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
                <CustomSelect
                  value={filterTrack}
                  onChange={setFilterTrack}
                  options={["Software", "Hardware"]}
                  placeholder="All Tracks"
                />
              </div>
              <div className="f">
                <CustomSelect
                  value={filterTheme}
                  onChange={setFilterTheme}
                  options={SIH_THEMES}
                  placeholder="All Themes"
                />
              </div>
            </>
          )}

          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 16, marginTop: 12, paddingBottom: 16 }}>


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
      {showTeamModal && <TeamModal onClose={() => setShowTeamModal(false)} />}
      {showSeekerModal && <SeekerModal onClose={() => setShowSeekerModal(false)} />}
    </>
  );
}







