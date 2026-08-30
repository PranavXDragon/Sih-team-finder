import './AdminScreen.css';
import { useState } from 'react';
import { useSIH } from "../hooks/useSIH";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import AdminEditTeamModal from "../components/modals/AdminEditTeamModal";
import AdminViewTeamModal from "../components/modals/AdminViewTeamModal";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, TableLayoutType } from "docx";
import { saveAs } from "file-saver";

export default function AdminScreen() {
  const { teams, seekers, stats, deleteTeam, deleteSeeker, updateTeam, user } = useSIH();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [viewingTeam, setViewingTeam] = useState(null);
  const [isSendingEmails, setIsSendingEmails] = useState(false);

  const handleFinalizeEmails = async () => {
    const selectedCount = teams.filter(t => t.status === 'Selected').length;
    const waitlistCount = teams.filter(t => t.status === 'Waitlisted').length;

    if (selectedCount !== 45 || waitlistCount !== 5) {
      alert(`Validation Failed: You must select exactly 45 teams (currently ${selectedCount}) and waitlist exactly 5 teams (currently ${waitlistCount}) before finalizing.`);
      return;
    }

    const confirmSend = window.confirm("Are you sure you want to finalize? This will immediately send official Selection, Waitlist, and Rejection emails to all team leaders based on their status.");
    if (!confirmSend) return;

    setIsSendingEmails(true);
    let successCount = 0;
    let failCount = 0;

    for (const team of teams) {
      const leader = team.members?.[0] || team.members?.find(m => m.is_leader);
      if (!leader || !leader.email || !team.status || team.status === 'Pending') continue;

      let emailType = '';
      if (team.status === 'Selected') emailType = 'TEAM_SELECTED';
      else if (team.status === 'Waitlisted') emailType = 'TEAM_WAITLISTED';
      else if (team.status === 'Rejected') emailType = 'TEAM_REJECTED';

      if (emailType) {
        try {
          const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
              type: emailType,
              payload: { team_id: team.id }
            }
          });
          
          if (error) {
            console.error("Failed to send email to", leader.email, error);
            failCount++;
          } else if (data?.skipped) {
            console.log("Skipped duplicate send for team", team.id);
          } else {
            successCount++;
          }
        } catch (err) {
          console.error("Exception sending email to", leader.email, err);
          failCount++;
        }
      }
    }

    setIsSendingEmails(false);
    alert(`Done! Successfully sent ${successCount} emails. (${failCount} failed).`);
  };
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (user?.email !== "admin@sih2026.com") {
    return (
      <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 16, border: '1px solid var(--border)', maxWidth: 400, width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>SPOC Login</h2>
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="fld">
              <label>SPOC ID (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sih2026.com"
                required
              />
            </div>
            <div className="fld">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {loginError && <p className="err" style={{ display: 'block' }}>{loginError}</p>}
            <button type="submit" className="btn pri" disabled={isLoggingIn} style={{ marginTop: 8 }}>
              {isLoggingIn ? 'Verifying...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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

  const getRuleViolations = (t) => {
    const flags = [];
    if (!t.members || t.members.length < (t.totalSeats || 6)) {
      flags.push("Incomplete Team");
    }
    if (t.members && t.members.length > 0) {
      const hasFemale = t.members.some(m => m.gender === 'f');
      if (!hasFemale) flags.push("No Female");
    }
    return flags;
  };

  const handleDeleteTeam = (t) => {
    setConfirmDelete({ type: 'team', id: t.id, name: t.teamName });
  };

  const handleDeleteSeeker = (s) => {
    setConfirmDelete({ type: 'seeker', id: s.id, name: s.name });
  };

  const handleDownloadDocx = async (team) => {
    // Add empty paragraphs at the top for letterhead
    const topSpacing = Array(8).fill(new Paragraph({ text: "" }));

    const today = new Date().toLocaleDateString("en-GB");
    const members = [...(team.members || [])];
    const seats = team.totalSeats || 6;
    while (members.length < seats) {
      members.push({});
    }

    const colWidths = [10, 16, 8, 24, 12, 18, 12]; // percentages

    const tableRows = [
      new TableRow({
        children: ["", "Name", "Gender", "Email id", "Mobile no.", "Stream", "Academic Year"].map(
          (text, idx) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18 })], alignment: AlignmentType.CENTER })],
            width: { size: colWidths[idx], type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          })
        ),
      }),
      ...members.map((m, i) => {
        const role = i === 0 ? "Team Leader" : "Team Member";
        const gender = m.gender === 'f' ? "Female" : m.gender === 'm' ? "Male" : m.name ? "N/A" : "";
        const year = m.year || "";
        const stream = m.dept || m.branch || "";
        return new TableRow({
          children: [role, m.name || "", gender, m.email || "", m.phone || "", stream, year].map(
            (text, idx) => new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, size: 18 })], alignment: idx === 0 || idx === 2 || idx === 4 || idx === 6 ? AlignmentType.CENTER : AlignmentType.LEFT })],
              width: { size: colWidths[idx], type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            })
          ),
        });
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          ...topSpacing,
          new Paragraph({
            children: [new TextRun({ text: `Date: ${today}`, size: 24 })],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Sub: Smart India Hackathon 2026 – Nomination", bold: true, size: 24 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "I am pleased to nominate the below team from our college to participate in Smart India Hackathon 2026. AICTE Application No. for our college is West/1-6595181/2010/.",
                size: 24,
              }),
            ],
            spacing: { after: 600 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Team 1: ${team.teamName || ""}`, bold: true, size: 24 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: `Problem Statement ID: ${team.psId || ""} (${team.psTitle || ""})`, bold: true, size: 24 })],
            spacing: { after: 400 },
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({ text: "", spacing: { before: 1200 } }), // Adjusted gap for signature to fit on page 1
          new Paragraph({ children: [new TextRun({ text: "Sincerely,", size: 24 })], spacing: { after: 800 } }),
          new Paragraph({ children: [new TextRun({ text: "Dr. V. G. Araipure", bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Principal SCET, Nagpur", bold: true, size: 24 })] }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `SIH_Nomination_${team.teamName || "Team"}.docx`);
  };

  return (
    <div className="admin-container">
      <div className="admin-head">
        <h1>SIH 2026 SPOC Portal</h1>
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
          ) : <p style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 40 }}>No team data yet.</p>}
        </div>

        <div className="admin-chart-card">
          <h3>Teams by Theme</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--dim)" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--dim)" allowDecimals={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }} cursor={{ fill: 'var(--surface)' }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 40 }}>No theme data yet.</p>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, marginTop: 32 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Teams Database</h2>
          <p style={{ color: 'var(--dim)', fontSize: 14 }}>
            Selected: <span style={{ color: teams.filter(t => t.status === 'Selected').length > 45 ? 'var(--stop)' : 'var(--accent)', fontWeight: 'bold' }}>{teams.filter(t => t.status === 'Selected').length}/45</span> | 
            Waitlisted: <span style={{ color: teams.filter(t => t.status === 'Waitlisted').length > 5 ? 'var(--stop)' : 'var(--accent)', fontWeight: 'bold' }}>{teams.filter(t => t.status === 'Waitlisted').length}/5</span>
          </p>
        </div>
        <button 
          className="btn" 
          disabled={isSendingEmails}
          style={{ background: 'var(--accent)', color: 'var(--ink)', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: isSendingEmails ? 'not-allowed' : 'pointer', opacity: isSendingEmails ? 0.7 : 1 }}
          onClick={handleFinalizeEmails}
        >
          {isSendingEmails ? 'Sending Emails...' : 'Finalize & Send Emails'}
        </button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Theme</th>
              <th>Track</th>
              <th>Open Seats</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(t => (
              <tr key={t.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span
                      onClick={() => setViewingTeam(t)}
                      style={{ fontWeight: 'bold', cursor: 'pointer', color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 4 }}
                    >
                      {t.teamName}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {getRuleViolations(t).map((flag, idx) => (
                        <span key={idx} style={{ fontSize: '10px', background: 'var(--stop)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td>{t.theme}</td>
                <td>{t.track}</td>
                <td>{t.seatsOpen}/{t.totalSeats}</td>
                <td>
                  <select 
                    value={t.status || 'Pending'} 
                    onChange={(e) => updateTeam(t.id, { status: e.target.value })}
                    style={{ 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      background: t.status === 'Selected' ? 'rgba(34, 197, 94, 0.15)' : t.status === 'Waitlisted' ? 'rgba(234, 179, 8, 0.15)' : t.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-2)',
                      color: t.status === 'Selected' ? '#4ade80' : t.status === 'Waitlisted' ? '#facc15' : t.status === 'Rejected' ? '#f87171' : 'var(--text)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: 13
                    }}
                  >
                    <option value="Pending" style={{ color: '#000' }}>Pending</option>
                    <option value="Selected" style={{ color: '#000' }}>Selected</option>
                    <option value="Waitlisted" style={{ color: '#000' }}>Waitlisted</option>
                    <option value="Rejected" style={{ color: '#000' }}>Rejected</option>
                  </select>
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn sm" onClick={() => setViewingTeam(t)}>View</button>
                  <button className="btn sm sec" onClick={() => setEditingTeam(t)}>Edit</button>
                  <button className="btn sm" style={{ background: '#3b82f6', color: '#fff', border: 'none' }} onClick={() => handleDownloadDocx(t)}>Download</button>
                  <button className="btn sm danger" onClick={() => handleDeleteTeam(t)}>Delete</button>
                </td>
              </tr>
            ))}
            {teams.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No teams registered yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 32 }}>
        <h2>Seekers Database</h2>
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
                  <button className="btn sm danger" onClick={() => handleDeleteSeeker(s)}>Delete</button>
                </td>
              </tr>
            ))}
            {seekers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No seekers registered yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editingTeam && (
        <AdminEditTeamModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
        />
      )}

      {viewingTeam && (
        <AdminViewTeamModal
          team={viewingTeam}
          onClose={() => setViewingTeam(null)}
        />
      )}

      {confirmDelete && (
        <div className="veil open" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ width: "100%", maxWidth: 400 }}>
            <div className="mhead">
              <div>
                <h2 style={{ margin: 0 }}>Confirm Deletion</h2>
              </div>
              <button className="x" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="mbody" style={{ padding: 24 }}>
              <p style={{ margin: "0 0 12px 0" }}>
                Are you sure you want to delete the {confirmDelete.type} <strong>{confirmDelete.name}</strong>?
              </p>
              <p style={{ color: "var(--stop)", fontSize: "0.85rem", margin: 0 }}>
                This action is irreversible.
              </p>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button className="btn" style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", color: "var(--text)" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="btn danger" style={{ flex: 1, background: 'var(--stop)', color: '#fff', border: 'none' }} onClick={() => {
                  if (confirmDelete.type === 'team') {
                    deleteTeam(confirmDelete.id);
                  } else {
                    deleteSeeker(confirmDelete.id);
                  }
                  setConfirmDelete(null);
                }}>Delete Forever</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
