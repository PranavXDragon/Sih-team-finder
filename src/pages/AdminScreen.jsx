import './AdminScreen.css';
import { useSIH } from "../hooks/useSIH";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AdminScreen() {
  const { teams, seekers, stats, deleteTeam, deleteSeeker, user } = useSIH();

  // Prepare data for Charts
  const tracksMap = { "Software": 0, "Hardware": 0 };
  const themesMap = {};

  teams.forEach(t => {
    const track = t.track === "Software" ? "Software" : t.track === "Hardware" ? "Hardware" : "Other";
    if (tracksMap[track] !== undefined) tracksMap[track]++;
    
    if (t.theme) {
      themesMap[t.theme] = (themesMap[t.theme] || 0) + 1;
    }
  });

  const pieData = [
    { name: 'Software', value: tracksMap['Software'], color: 'var(--lime)' },
    { name: 'Hardware', value: tracksMap['Hardware'], color: 'var(--tang)' },
  ].filter(d => d.value > 0);

  const barData = Object.keys(themesMap).map(key => ({
    name: key.substring(0, 15) + (key.length > 15 ? '...' : ''), // truncate long theme names
    count: themesMap[key],
    fullName: key
  })).sort((a, b) => b.count - a.count);

  const exportTeamsCSV = () => {
    if (!teams.length) return;
    const header = ["ID", "Team Name", "Track", "Theme", "Open Seats", "Contact"];
    const rows = teams.map(t => [t.id, t.teamName, t.track, t.theme, t.seatsOpen, t.contact]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [header.join(","), ...rows.map(e => e.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sih_teams.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSeekersCSV = () => {
    if (!seekers.length) return;
    const header = ["ID", "Name", "Dept", "Year", "Gender", "WhatsApp", "Bio"];
    const rows = seekers.map(s => [s.id, s.name, s.dept, s.year, s.gender, s.whatsapp, s.bio]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [header.join(","), ...rows.map(e => e.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sih_seekers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteTeam = (id) => {
    if (window.confirm("Are you sure you want to delete this team? This action is irreversible.")) {
      deleteTeam(id);
    }
  };

  const handleDeleteSeeker = (id) => {
    if (window.confirm("Are you sure you want to delete this seeker profile?")) {
      deleteSeeker(id);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-head">
        <h1>SIH 2026 Admin Portal</h1>
        <p style={{ color: 'var(--dim)' }}>Live analytics and data tables.</p>
        
        {user?.email !== "admin@sih2026.com" && (
          <div style={{ background: 'var(--stop-dim)', color: 'var(--stop)', padding: 12, borderRadius: 8, marginTop: 16, border: '1px solid rgba(255, 84, 112, 0.4)' }}>
            <b>Warning:</b> You are not logged in as admin@sih2026.com. Edit/Delete actions may fail due to Database Row Level Security rules.
          </div>
        )}
      </div>

      <div className="admin-stats">
        <div className="astat">
          <h3>{stats.teams}</h3>
          <p>Total Teams</p>
        </div>
        <div className="astat">
          <h3>{stats.seekers}</h3>
          <p>Total Seekers</p>
        </div>
        <div className="astat">
          <h3>{stats.seats}</h3>
          <p>Open Seats</p>
        </div>
      </div>

      <h2 style={{ marginBottom: 16 }}>Analytics Overview</h2>
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3>Teams by Track</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{color: 'var(--dim)', textAlign:'center', marginTop:40}}>No team data yet.</p>}
        </div>

        <div className="admin-chart-card">
          <h3>Teams by Theme</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--dim)" angle={-45} textAnchor="end" tick={{fontSize: 12}} />
                <YAxis stroke="var(--dim)" allowDecimals={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }} cursor={{fill: 'var(--surface)'}} />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{color: 'var(--dim)', textAlign:'center', marginTop:40}}>No theme data yet.</p>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 32 }}>
        <h2>Teams Database</h2>
        <button className="btn sm pri" onClick={exportTeamsCSV}>Export CSV</button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Theme</th>
              <th>Track</th>
              <th>Open Seats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(t => (
              <tr key={t.id}>
                <td><b>{t.teamName}</b></td>
                <td>{t.theme}</td>
                <td>{t.track}</td>
                <td>{t.seatsOpen}/{t.totalSeats}</td>
                <td>
                  <button className="btn sm danger" onClick={() => handleDeleteTeam(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {teams.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: 20}}>No teams registered yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 32 }}>
        <h2>Seekers Database</h2>
        <button className="btn sm pri" onClick={exportSeekersCSV}>Export CSV</button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {seekers.map(s => (
              <tr key={s.id}>
                <td><b>{s.name}</b></td>
                <td>{s.dept}</td>
                <td>{s.year}</td>
                <td>{s.gender === 'f' ? 'Female' : s.gender === 'm' ? 'Male' : 'N/A'}</td>
                <td>
                  <button className="btn sm danger" onClick={() => handleDeleteSeeker(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {seekers.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: 20}}>No seekers registered yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
