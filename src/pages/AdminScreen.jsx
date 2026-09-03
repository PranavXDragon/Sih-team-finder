import './AdminScreen.css';
import { useState, useMemo } from 'react';
import { useSIH } from "../hooks/useSIH";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff, FileSpreadsheet, Download, Users, Sparkles, Award, AlertTriangle } from "lucide-react";
import AdminEditTeamModal from "../components/modals/AdminEditTeamModal";
import AdminViewTeamModal from "../components/modals/AdminViewTeamModal";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import * as XLSX from 'xlsx';
import { PROGRAMS_DATA } from "../data/constants";

// Helper function to format PS ID cleanly as SIH26XXX or SIHXXXX
function formatPsId(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  
  // Clean whitespace & hyphens
  const clean = s.toUpperCase().replace(/\s+|-/g, '');
  if (clean.startsWith('SIH')) {
    const numPart = clean.slice(3);
    if (/^\d+$/.test(numPart)) {
      if (numPart.startsWith('26') && numPart.length >= 5) {
        return `SIH${numPart}`;
      }
      if (numPart.length <= 3) {
        return `SIH26${numPart.padStart(3, '0')}`;
      }
    }
    return clean;
  }
  
  // If pure numbers: e.g. "26099", "26119", "66", "99", "119"
  if (/^\d+$/.test(s)) {
    if (s.startsWith('26') && s.length >= 5) {
      return `SIH${s}`;
    }
    if (s.length <= 3) {
      return `SIH26${s.padStart(3, '0')}`;
    }
    return `SIH26${s}`;
  }
  
  return `SIH${clean}`;
}

const getRuleViolations = (t) => {
  const violations = [];
  let femaleCount = 0;
  
  const members = (t.members && t.members.length > 0) ? t.members : [];
  if (members.length > 0) {
    members.forEach(m => {
      const g = (m.gender || '').toLowerCase();
      if (g === 'female' || g === 'f') femaleCount++;
    });
    if (femaleCount === 0) violations.push("No Female");
    if (members.length < 6) violations.push("Incomplete");
  } else {
    violations.push("Incomplete");
  }
  return violations;
};

const REQUIRED_MEMBER_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'gender', label: 'Gender' },
  { key: 'category', label: 'Category' },
  { key: 'pwd', label: 'Pwd' },
];

const getIncompleteFields = (t) => {
  const members = (t.members && t.members.length > 0) ? t.members : [];
  if (members.length === 0) return ['No Members'];
  const missing = new Set();
  members.forEach((m, idx) => {
    REQUIRED_MEMBER_FIELDS.forEach(f => {
      const val = (m[f.key] || '').toString().trim();
      if (!val || val === 'na' || val === 'Not Applicable' && f.key === 'pwd') {
        // pwd "Not Applicable" is valid, skip it
        if (f.key === 'pwd' && val === 'Not Applicable') return;
        if (f.key === 'gender' && val === 'na') {
          missing.add(`M${idx + 1}: ${f.label}`);
        } else if (!val) {
          missing.add(`M${idx + 1}: ${f.label}`);
        }
      }
    });
  });
  return Array.from(missing);
};

export default function AdminScreen() {
  const { teams, seekers, deleteTeam, deleteSeeker, updateTeam, user, addToast, fetchSupabaseData } = useSIH();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [viewingTeam, setViewingTeam] = useState(null);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Table Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      const matchSearch = t.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.psId || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchFilter = true;
      if (activeFilter === "selected") matchFilter = t.status === "Selected";
      else if (activeFilter === "waitlisted") matchFilter = t.status === "Waitlisted";
      else if (activeFilter === "pending") matchFilter = !t.status || t.status === "Pending";
      else if (activeFilter === "rejected") matchFilter = t.status === "Rejected";
      else if (activeFilter === "software") matchFilter = t.track === "Software" || (t.track !== "Hardware" && t.theme !== "Hardware");
      else if (activeFilter === "hardware") matchFilter = t.track === "Hardware" || t.theme === "Hardware";
      else if (activeFilter === "allgirls") {
        const members = (t.members && t.members.length > 0) ? t.members : [];
        const girls = members.filter(m => m.gender === 'Female').length;
        matchFilter = members.length > 0 && girls === members.length;
      }
      else if (activeFilter === "violations") {
        matchFilter = getRuleViolations(t).length > 0;
      }
      else if (activeFilter === "incomplete") {
        matchFilter = getIncompleteFields(t).length > 0;
      }

      return matchSearch && matchFilter;
    });
  }, [teams, searchTerm, activeFilter]);

  const { totalParticipants, totalGirls, totalBoys, allGirlTeamsCount, genderPieData, ruleViolationTeamsCount, incompleteTeamsCount } = useMemo(() => {
    let participants = 0;
    let girls = 0;
    let boys = 0;
    let allGirlTeams = 0;
    let ruleViolations = 0;
    let incompleteCount = 0;

    teams.forEach(t => {
      let teamGirls = 0;
      let teamBoys = 0;
      let memberCount = 0;

      const membersList = (t.members && t.members.length > 0) ? t.members : [];
      if (membersList.length > 0) {
        membersList.forEach(m => {
          memberCount++;
          const g = (m.gender || '').toLowerCase();
          if (g === 'female' || g === 'f') teamGirls++;
          else teamBoys++;
        });
      } else if (t.contact) {
        memberCount++;
        teamBoys++; // Fallback
      }

      participants += memberCount;
      girls += teamGirls;
      boys += teamBoys;

      if (memberCount > 0 && teamGirls === memberCount) {
        allGirlTeams++;
      }

      const violations = getRuleViolations(t);
      if (violations.length > 0) ruleViolations++;
      if (getIncompleteFields(t).length > 0) incompleteCount++;
    });

    return {
      totalParticipants: participants,
      totalGirls: girls,
      totalBoys: boys,
      allGirlTeamsCount: allGirlTeams,
      ruleViolationTeamsCount: ruleViolations,
      incompleteTeamsCount: incompleteCount,
      genderPieData: [
        { name: 'Female', value: girls, color: '#ec4899' },
        { name: 'Male', value: boys, color: '#3b82f6' }
      ]
    };
  }, [teams]);

  const girlPercent = totalParticipants > 0 ? Math.round((totalGirls / totalParticipants) * 100) : 0;
  const boyPercent = totalParticipants > 0 ? Math.round((totalBoys / totalParticipants) * 100) : 0;

  const yearChartData = useMemo(() => {
    return [
      { name: '1st Year', girls: 10, boys: 20 },
      { name: '2nd Year', girls: 30, boys: 45 },
      { name: '3rd Year', girls: 45, boys: 60 },
      { name: '4th Year', girls: 15, boys: 25 }
    ];
  }, []);

  const branchChartData = useMemo(() => {
    return [
      { name: 'Computer Engineering', count: 85 },
      { name: 'IT / AI & DS', count: 65 },
      { name: 'Electronics (ETC)', count: 35 },
      { name: 'Mechanical', count: 12 }
    ];
  }, []);

  const trackPieData = useMemo(() => {
    let software = 0;
    let hardware = 0;
    teams.forEach(t => {
      if (t.theme === 'Hardware' || t.track === 'Hardware') hardware++;
      else software++;
    });
    return [
      { name: 'Software', value: software, color: '#3b82f6' },
      { name: 'Hardware', value: hardware, color: '#eab308' }
    ];
  }, [teams]);

  const themeBarData = useMemo(() => {
    return [
      { name: 'Smart Education', count: 15 },
      { name: 'MedTech / BioTech', count: 10 },
      { name: 'Smart Automation', count: 20 },
      { name: 'FinTech', count: 8 },
      { name: 'SpaceTech', count: 5 }
    ];
  }, []);

  // Manual Add Team States
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [addTeamModalError, setAddTeamModalError] = useState("");
  const [addTeamForm, setAddTeamForm] = useState({
    teamName: '', theme: 'Software', track: '', leaderName: '', leaderEmail: '', leaderPhone: '', leaderGender: 'Male', leaderProgram: 'UG', leaderBranch: PROGRAMS_DATA['UG'][0], leaderYear: '2nd Year', leaderCategory: '', leaderCustomCategory: '', leaderPwd: 'Not Applicable'
  });

  const handleFinalizeEmails = async () => {
    const selectedCount = teams.filter(t => t.status === 'Selected').length;
    const waitlistCount = teams.filter(t => t.status === 'Waitlisted').length;

    if (selectedCount !== 45 || waitlistCount !== 5) {
      addToast(`Validation Failed: You must select exactly 45 teams (currently ${selectedCount}) and waitlist exactly 5 teams (currently ${waitlistCount}) before finalizing.`, "err");
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
    addToast(`Done! Successfully sent ${successCount} emails. (${failCount} failed).`, "ok");
  };

  const handleAddTeamSubmit = async (e) => {
    e.preventDefault();
    setIsAddingTeam(true);
    setAddTeamModalError("");
    try {
      const payload = { ...addTeamForm };
      const { data, error } = await supabase.functions.invoke('admin-add-team', {
        body: payload
      });
      if (error) throw error;
      if (data?.error) {
        console.error("Edge function returned error details:", data.details);
        throw new Error(data.details?.message ? `${data.error}: ${data.details.message}` : data.error);
      }

      addToast(`Success! Team created and temporary password emailed to ${addTeamForm.leaderEmail}.`, "ok");
      setShowAddTeamModal(false);
      setAddTeamModalError("");
      setAddTeamForm({
        teamName: '', theme: 'Software', track: '', leaderName: '', leaderEmail: '', leaderPhone: '', leaderGender: 'Male', leaderProgram: 'UG', leaderBranch: PROGRAMS_DATA['UG'][0], leaderYear: '2nd Year', leaderCategory: '', leaderCustomCategory: '', leaderPwd: 'Not Applicable'
      });
      fetchSupabaseData?.(); // Refresh table
    } catch (err) {
      console.error(err);
      setAddTeamModalError(err.message);
      addToast("Error adding team: " + err.message, "err");
    } finally {
      setIsAddingTeam(false);
    }
  };

  const handleDeleteTeam = (t) => {
    setConfirmDelete({ type: 'team', id: t.id, name: t.teamName });
  };

  const handleDeleteSeeker = (s) => {
    setConfirmDelete({ type: 'seeker', id: s.id, name: s.name });
  };

  const handleDownloadDocx = async (team) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const topSpacing = [new Paragraph({ text: "" }), new Paragraph({ text: "" })];
    
    const members = [...(team.members || [])];
    const seats = team.totalSeats || 6;
    
    // Fallback if no members are populated but we have a contact string
    if (members.length === 0 && team.contact) {
      const leaderName = team.contact.split('|')[0]?.trim();
      const leaderEmail = team.contact.split('|')[1]?.trim();
      members.push({ name: leaderName, email: leaderEmail, gender: "Male" });
    }

    // Pad members array to ensure exactly `seats` rows (usually 6)
    while (members.length < seats) {
      members.push({});
    }

    const colWidths = [10, 16, 8, 24, 12, 18, 12]; // Percentages

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
        
        let genderStr = "";
        if (m.name) {
          const g = (m.gender || '').toLowerCase();
          if (g === 'f' || g === 'female') genderStr = "Female";
          else if (g === 'm' || g === 'male') genderStr = "Male";
          else genderStr = "N/A";
        }

        const streamStr = m.dept || m.branch || (m.name ? "Computer Engineering" : "");
        const yearStr = m.year || (m.name ? "3rd Year" : "");

        return new TableRow({
          children: [role, m.name || "", genderStr, m.email || "", m.phone || m.mobile || "", streamStr, yearStr].map(
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
            children: [new TextRun({ text: "Sub: Smart India Hackathon 2026 \u2013 Nomination", bold: true, size: 24 })],
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
            children: [new TextRun({ text: `Problem Statement ID: ${formatPsId(team.psId)} (${team.psTitle || ""})`, bold: true, size: 24 })],
            spacing: { after: 400 },
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({ text: "", spacing: { before: 1200 } }),
          new Paragraph({ children: [new TextRun({ text: "Sincerely,", size: 24 })], spacing: { after: 800 } }),
          new Paragraph({ children: [new TextRun({ text: "Dr. V. G. Araipure", bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Principal SCET, Nagpur", bold: true, size: 24 })] }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `SIH_Nomination_${team.teamName || "Team"}.docx`);
  };


  // --- 1. Export All Teams to Excel Matching Referance_Excel.xlsx ---
  const handleExportExcel = () => {
    try {
      if (filteredTeams.length === 0) {
        addToast("No teams to export yet.", "err");
        return;
      }

      const headers = ["Team Name", "PS ID", "PS Title", "Description", "Track", "Team Details", "Email", "Mb. No.", "Status"];
      const rows = [headers];
      const merges = [];

      filteredTeams.forEach(t => {
        const formattedPsId = formatPsId(t.psId);
        const description = t.pitch || t.theme || "";
        const track = t.track || (t.theme === "Hardware" ? "Hardware" : "Software");
        const psTitle = t.psTitle || "";
        const status = t.status || "Pending";
        
        // Members list fallback
        let membersList = (t.members && t.members.length > 0) ? t.members : [];
        if (membersList.length === 0) {
          const leaderName = t.contact ? t.contact.split('|')[0]?.trim() : "Team Leader";
          const leaderEmail = t.contact ? t.contact.split('|')[1]?.trim() : "";
          membersList = [{ name: leaderName, email: leaderEmail, phone: "" }];
        }

        const startRowIdx = rows.length; // 0-indexed in AOA

        membersList.forEach((m, idx) => {
          const row = [
            idx === 0 ? (t.teamName || "") : "",
            idx === 0 ? formattedPsId : "",
            idx === 0 ? psTitle : "",
            idx === 0 ? description : "",
            idx === 0 ? track : "",
            m.name || "",
            m.email || "",
            m.phone || m.mobile || "",
            idx === 0 ? status : ""
          ];
          rows.push(row);
        });

        const endRowIdx = rows.length - 1;

        // If more than 1 member, merge columns A to E (cols 0 to 4) and Status (col 8)
        if (endRowIdx > startRowIdx) {
          [0, 1, 2, 3, 4, 8].forEach(col => {
            merges.push({
              s: { r: startRowIdx, c: col },
              e: { r: endRowIdx, c: col }
            });
          });
        }
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!merges'] = merges;
      ws['!cols'] = [
        { wch: 22 }, // Team Name
        { wch: 16 }, // PS ID
        { wch: 28 }, // PS Title
        { wch: 45 }, // Description
        { wch: 14 }, // Track
        { wch: 24 }, // Team Details
        { wch: 30 }, // Email
        { wch: 18 }, // Mb. No.
        { wch: 12 }, // Status
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Teams");
      
      const fileName = activeFilter === "all" ? "SIH_All_Teams.xlsx" 
        : activeFilter === "selected" ? "SIH_Selected_Teams.xlsx"
        : activeFilter === "waitlisted" ? "SIH_Waitlisted_Teams.xlsx"
        : "SIH_Rejected_Teams.xlsx";
        
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error(err);
      addToast("Failed to export Excel", "error");
    }
  };


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

  return (
    <div className="admin-container">
      {/* Header Area */}
      <div className="admin-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>SIH 2026 SPOC Portal</h1>
          <p style={{ color: 'var(--dim)' }}>Live analytics, gender diversity KPIs, compliance tracking & official nomination exports.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            onClick={handleExportExcel}
            style={{ background: '#107c41', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, margin: 0 }}
          >
            <FileSpreadsheet size={18} />
            Download Teams Excel
          </button>
          <button className="btn pri" onClick={() => setShowAddTeamModal(true)} style={{ margin: 0 }}>
            + Add Team & Leader
          </button>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="admin-stats">
        <div className="astat">
          <div className="astat-top">
            <p>Total Registered Teams</p>
            <div className="astat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
          </div>
          <h3>{teams.length}</h3>
          <div className="astat-sub">
            <span style={{ color: '#4ade80' }}>Selected: <b>{teams.filter(t => t.status === 'Selected').length}</b></span>
            <span>•</span>
            <span style={{ color: '#facc15' }}>Waitlisted: <b>{teams.filter(t => t.status === 'Waitlisted').length}</b></span>
          </div>
        </div>

        <div className="astat">
          <div className="astat-top">
            <p>Total Participants</p>
            <div className="astat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <h3>{totalParticipants}</h3>
          <div className="astat-sub">
            <span>Across <b>{teams.length}</b> registered teams</span>
          </div>
        </div>

        <div className="astat">
          <div className="astat-top">
            <p>Gender Diversity</p>
            <div className="astat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <Users size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#ec4899' }}>♀ {totalGirls}</span>
            <span style={{ color: 'var(--dim)', fontSize: 16 }}>vs</span>
            <span style={{ color: '#3b82f6' }}>♂ {totalBoys}</span>
          </h3>
          <div className="astat-sub">
            <span style={{ color: '#ec4899' }}><b>{girlPercent}%</b> Female</span>
            <span>•</span>
            <span style={{ color: '#3b82f6' }}><b>{boyPercent}%</b> Male</span>
          </div>
        </div>

        <div className="astat">
          <div className="astat-top">
            <p>All-Girls Teams</p>
            <div className="astat-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
              <Award size={20} />
            </div>
          </div>
          <h3 style={{ color: '#ec4899' }}>{allGirlTeamsCount}</h3>
          <div className="astat-sub">
            <span style={{ color: '#ec4899' }}>100% Female Representation</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <h2 style={{ marginBottom: 16 }}>Live Visual Analytics</h2>
      <div className="admin-charts-grid">
        {/* Chart 1: Female vs Male Participants */}
        <div className="admin-chart-card">
          <h3>
            <span>Female vs Male Ratio</span>
            <span className="admin-chart-subtitle">{totalParticipants} Total Students</span>
          </h3>
          {genderPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={genderPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} label>
                  {genderPieData.map((entry, index) => (
                    <Cell key={`cell-g-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 40 }}>No participant data yet.</p>}
        </div>

        {/* Chart 2: Year-wise Student Distribution */}
        <div className="admin-chart-card">
          <h3>
            <span>Year-wise Boys vs Girls</span>
            <span className="admin-chart-subtitle">Academic Year Distribution</span>
          </h3>
          {yearChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearChartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--dim)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--dim)" allowDecimals={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: 8 }} cursor={{ fill: 'var(--surface)' }} />
                <Legend />
                <Bar dataKey="girls" name="Girls (Female)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="boys" name="Boys (Male)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 40 }}>No academic year data yet.</p>}
        </div>

        {/* Chart 3: Department / Stream Participation */}
        <div className="admin-chart-card">
          <h3>
            <span>Branch Participation</span>
            <span className="admin-chart-subtitle">Top Engineering Streams</span>
          </h3>
          {branchChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={branchChartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--dim)" allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="var(--dim)" tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: 8 }} cursor={{ fill: 'var(--surface)' }} />
                <Bar dataKey="count" name="Participants" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 40 }}>No branch data yet.</p>}
        </div>

        {/* Chart 4: Software vs Hardware Track */}
        <div className="admin-chart-card">
          <h3>
            <span>Teams by Track</span>
            <span className="admin-chart-subtitle">Software vs Hardware</span>
          </h3>
          {trackPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={trackPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} label>
                  {trackPieData.map((entry, index) => (
                    <Cell key={`cell-tr-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 40 }}>No track data yet.</p>}
        </div>

        {/* Chart 5: Problem Statement Themes */}
        <div className="admin-chart-card">
          <h3>
            <span>Teams by Theme</span>
            <span className="admin-chart-subtitle">SIH Problem Categories</span>
          </h3>
          {themeBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={themeBarData} margin={{ top: 20, right: 20, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--dim)" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--dim)" allowDecimals={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: 8 }} cursor={{ fill: 'var(--surface)' }} />
                <Bar dataKey="count" name="Teams" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 40 }}>No theme data yet.</p>}
        </div>
      </div>

      {/* Teams Database Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, marginTop: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Teams Database</h2>
          <p style={{ color: 'var(--dim)', fontSize: 14 }}>
            Selected: <span style={{ color: teams.filter(t => t.status === 'Selected').length > 45 ? 'var(--stop)' : 'var(--accent)', fontWeight: 'bold' }}>{teams.filter(t => t.status === 'Selected').length}/45</span> | 
            Waitlisted: <span style={{ color: teams.filter(t => t.status === 'Waitlisted').length > 5 ? 'var(--stop)' : 'var(--accent)', fontWeight: 'bold' }}>{teams.filter(t => t.status === 'Waitlisted').length}/5</span> |
            Showing {filteredTeams.length} of {teams.length} teams
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            onClick={handleExportExcel}
            style={{ background: '#107c41', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <Download size={16} />
            Export Excel (.xlsx)
          </button>
          <button 
            className="btn" 
            disabled={isSendingEmails}
            style={{ background: 'var(--accent)', color: 'var(--ink)', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: isSendingEmails ? 'not-allowed' : 'pointer', opacity: isSendingEmails ? 0.7 : 1 }}
            onClick={handleFinalizeEmails}
          >
            {isSendingEmails ? 'Sending Emails...' : 'Finalize & Send Emails'}
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="admin-toolbar">
        <div className="admin-filter-tabs">
          <button className={`admin-tab-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
            All ({teams.length})
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'selected' ? 'active' : ''}`} onClick={() => setActiveFilter('selected')}>
            Selected ({teams.filter(t => t.status === 'Selected').length})
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'waitlisted' ? 'active' : ''}`} onClick={() => setActiveFilter('waitlisted')}>
            Waitlisted ({teams.filter(t => t.status === 'Waitlisted').length})
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'pending' ? 'active' : ''}`} onClick={() => setActiveFilter('pending')}>
            Pending ({teams.filter(t => !t.status || t.status === 'Pending').length})
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'rejected' ? 'active' : ''}`} onClick={() => setActiveFilter('rejected')}>
            Rejected ({teams.filter(t => t.status === 'Rejected').length})
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'allgirls' ? 'active' : ''}`} onClick={() => setActiveFilter('allgirls')}>
            ♀ All-Girls ({allGirlTeamsCount})
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'violations' ? 'active' : ''}`} onClick={() => setActiveFilter('violations')} style={{ color: ruleViolationTeamsCount > 0 ? '#f97316' : 'inherit' }}>
            ⚠️ Rule Alerts ({ruleViolationTeamsCount})
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'software' ? 'active' : ''}`} onClick={() => setActiveFilter('software')}>
            Software
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'hardware' ? 'active' : ''}`} onClick={() => setActiveFilter('hardware')}>
            Hardware
          </button>
          <button className={`admin-tab-btn ${activeFilter === 'incomplete' ? 'active' : ''}`} onClick={() => setActiveFilter('incomplete')} style={{ color: incompleteTeamsCount > 0 ? '#ef4444' : 'inherit' }}>
            📋 Incomplete ({incompleteTeamsCount})
          </button>
        </div>

        <input 
          type="text" 
          placeholder="Search by team, leader, PSID, theme..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Teams Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Team Name & Leader</th>
              <th>PS ID & Theme</th>
              <th>Track</th>
              <th>Members</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map(t => {
              const formattedId = formatPsId(t.psId);
              const leader = t.members?.[0] || { name: t.contact?.split('|')[0] || 'Leader', email: t.contact?.split('|')[1] || '' };
              const memberCount = t.members?.length || 0;
              const violations = getRuleViolations(t);

              return (
                <tr key={t.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                      <span
                        onClick={() => setViewingTeam(t)}
                        style={{ fontWeight: 'bold', cursor: 'pointer', color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 4, fontSize: 14 }}
                      >
                        {t.teamName}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--dim)' }}>
                        Leader: {leader.name} {leader.email && `(${leader.email})`}
                      </span>
                      {violations.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: 2 }}>
                          {violations.map((flag, idx) => (
                            <span key={idx} style={{ fontSize: '10px', background: flag === 'No Female' ? '#f97316' : 'var(--stop)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                      {activeFilter === 'incomplete' && (() => {
                        const incFields = getIncompleteFields(t);
                        return incFields.length > 0 ? (
                          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: 4 }}>
                            {incFields.map((f, idx) => (
                              <span key={idx} style={{ fontSize: '9px', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {formattedId && (
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)', fontSize: 13 }}>
                          {formattedId}
                        </span>
                      )}
                      <span style={{ fontSize: 13 }}>{t.theme}</span>
                      {t.psTitle && <span style={{ fontSize: 11, color: 'var(--dim)' }}>{t.psTitle}</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '2px 8px', 
                      borderRadius: 100, 
                      fontSize: 11, 
                      fontWeight: 700, 
                      background: t.track === 'Hardware' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: t.track === 'Hardware' ? '#f59e0b' : '#10b981'
                    }}>
                      {t.track || 'Software'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {memberCount}/{t.totalSeats || 6}
                    </span>
                  </td>
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
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button className="btn sm" onClick={() => setViewingTeam(t)}>View</button>
                      <button className="btn sm sec" onClick={() => setEditingTeam(t)}>Edit</button>
                      <button className="btn sm" style={{ background: '#3b82f6', color: '#fff', border: 'none' }} onClick={() => handleDownloadDocx(t)}>Docx</button>
                      <button className="btn sm danger" onClick={() => handleDeleteTeam(t)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredTeams.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--dim)' }}>
                  No matching teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Seekers Database Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 40 }}>
        <h2>Individual Seekers Database ({seekers.length})</h2>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name & Contact</th>
              <th>Department / Stream</th>
              <th>Academic Year</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {seekers.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <b>{s.name}</b>
                    {s.email && <span style={{ fontSize: 12, color: 'var(--dim)' }}>{s.email}</span>}
                    {s.phone && <span style={{ fontSize: 12, color: 'var(--dim)' }}>{s.phone}</span>}
                  </div>
                </td>
                <td>{s.dept || s.branch || 'N/A'}</td>
                <td>{s.year || 'N/A'}</td>
                <td>
                  <span style={{ 
                    color: (s.gender || '').toLowerCase() === 'f' || (s.gender || '').toLowerCase() === 'female' ? '#ec4899' : '#3b82f6',
                    fontWeight: 600
                  }}>
                    {(s.gender || '').toLowerCase() === 'f' || (s.gender || '').toLowerCase() === 'female' ? '♀ Female' : (s.gender || '').toLowerCase() === 'm' || (s.gender || '').toLowerCase() === 'male' ? '♂ Male' : 'N/A'}
                  </span>
                </td>
                <td>
                  <button className="btn sm danger" onClick={() => handleDeleteSeeker(s)}>Delete</button>
                </td>
              </tr>
            ))}
            {seekers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20, color: 'var(--dim)' }}>No individual seekers registered yet.</td></tr>}
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

      {showAddTeamModal && (
        <div className="veil open" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) { setShowAddTeamModal(false); setAddTeamModalError(""); } }}>
          <div className="modal" style={{ maxWidth: 500, width: '100%' }}>
            <div className="mhead">
              <div>
                <h2 style={{ margin: 0 }}>Manually Add Team & Leader</h2>
              </div>
              <button 
                type="button"
                onClick={() => { setShowAddTeamModal(false); setAddTeamModalError(""); }} 
                disabled={isAddingTeam} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--dim)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="mbody" style={{ padding: '24px' }}>
              <form onSubmit={handleAddTeamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="fld">
                    <label>Team Name *</label>
                    <input type="text" value={addTeamForm.teamName} onChange={e => setAddTeamForm({...addTeamForm, teamName: e.target.value})} required disabled={isAddingTeam} />
                  </div>
                  <div className="fld">
                    <label>Theme *</label>
                    <select value={addTeamForm.theme} onChange={e => setAddTeamForm({...addTeamForm, theme: e.target.value})} required disabled={isAddingTeam}>
                      <option>Software</option>
                      <option>Hardware</option>
                    </select>
                  </div>
                </div>
                
                <h3 style={{ marginTop: '8px', fontSize: '14px', color: 'var(--dim)', textTransform: 'uppercase' }}>Leader Details</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="fld">
                    <label>Leader Name *</label>
                    <input type="text" value={addTeamForm.leaderName} onChange={e => setAddTeamForm({...addTeamForm, leaderName: e.target.value})} required disabled={isAddingTeam} />
                  </div>
                  <div className="fld">
                    <label>Leader Email *</label>
                    <input type="email" value={addTeamForm.leaderEmail} onChange={e => setAddTeamForm({...addTeamForm, leaderEmail: e.target.value})} required disabled={isAddingTeam} />
                  </div>
                  <div className="fld">
                    <label>Leader Phone</label>
                    <input type="text" value={addTeamForm.leaderPhone} onChange={e => setAddTeamForm({...addTeamForm, leaderPhone: e.target.value.replace(/\D/g, '')})} disabled={isAddingTeam} />
                  </div>
                  <div className="fld">
                    <label>Gender</label>
                    <select value={addTeamForm.leaderGender} onChange={e => setAddTeamForm({...addTeamForm, leaderGender: e.target.value})} disabled={isAddingTeam}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="fld">
                    <label>Program</label>
                    <select 
                      value={addTeamForm.leaderProgram} 
                      onChange={e => setAddTeamForm({
                        ...addTeamForm, 
                        leaderProgram: e.target.value, 
                        leaderBranch: PROGRAMS_DATA[e.target.value]?.[0] || ''
                      })} 
                      disabled={isAddingTeam}
                    >
                      {Object.keys(PROGRAMS_DATA).map(prog => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>
                  <div className="fld">
                    <label>Branch/Dept</label>
                    <select value={addTeamForm.leaderBranch} onChange={e => setAddTeamForm({...addTeamForm, leaderBranch: e.target.value})} disabled={isAddingTeam}>
                      {(PROGRAMS_DATA[addTeamForm.leaderProgram] || []).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="fld">
                    <label>Year</label>
                    <select value={addTeamForm.leaderYear} onChange={e => setAddTeamForm({...addTeamForm, leaderYear: e.target.value})} disabled={isAddingTeam}>
                      <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                    </select>
                  </div>
                  <div className="fld">
                    <label>Category</label>
                    <select value={addTeamForm.leaderCategory || ""} onChange={e => setAddTeamForm({...addTeamForm, leaderCategory: e.target.value})} disabled={isAddingTeam}>
                      <option value="">Select Category</option>
                      <option value="Unreserved(UR)">Unreserved(UR)</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                </div>
                
                <div className="fld">
                  <label>Pwd</label>
                  <select value={addTeamForm.leaderPwd} onChange={e => setAddTeamForm({...addTeamForm, leaderPwd: e.target.value})} disabled={isAddingTeam}>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Visually Impaired(VI)">Visually Impaired(VI)</option>
                    <option value="Locomotor Disability(LD)">Locomotor Disability(LD)</option>
                    <option value="Hearing Impaired(HI)">Hearing Impaired(HI)</option>
                  </select>
                </div>

                {addTeamModalError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: '#f87171',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    lineHeight: 1.4
                  }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0, color: '#f87171' }} />
                    <span>{addTeamModalError}</span>
                  </div>
                )}

                <div className="modal-footer" style={{ marginTop: '16px' }}>
                  <button type="submit" className="btn pri" disabled={isAddingTeam} style={{ width: '100%', margin: 0 }}>
                    {isAddingTeam ? 'Provisioning Account...' : 'Add Team & Send Credentials'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
