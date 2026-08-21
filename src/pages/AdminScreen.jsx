import './AdminScreen.css';
import { useSIH } from "../hooks/useSIH";

export default function AdminScreen() {
  const { teams, seekers, stats } = useSIH();

  return (
    <div className="admin-container">
      <div className="admin-head">
        <h1>SIH 2026 Admin Portal</h1>
        <p style={{ color: 'var(--dim)' }}>Live analytics and data tables.</p>
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

      <h2 style={{ marginBottom: 16 }}>Teams Database</h2>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Theme</th>
              <th>Track</th>
              <th>Open Seats</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(t => (
              <tr key={t.id}>
                <td><b>{t.teamName}</b></td>
                <td>{t.theme}</td>
                <td>{t.track}</td>
                <td>{t.seatsOpen}/{t.totalSeats}</td>
              </tr>
            ))}
            {teams.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: 20}}>No teams registered yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginBottom: 16 }}>Seekers Database</h2>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {seekers.map(s => (
              <tr key={s.id}>
                <td><b>{s.name}</b></td>
                <td>{s.dept}</td>
                <td>{s.year}</td>
                <td>{s.gender === 'f' ? 'Female' : s.gender === 'm' ? 'Male' : 'N/A'}</td>
              </tr>
            ))}
            {seekers.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: 20}}>No seekers registered yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
