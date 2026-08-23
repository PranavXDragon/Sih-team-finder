import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { SIHContext } from "./context";

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

export function SIHProvider({ children }) {
  const [college, setCollegeState] = useState(() => load("sih_college", null));
  const [teams, setTeams] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => load("sih_theme", "light"));

  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [myTeam, setMyTeam] = useState(null);
  const [mySeekerProfile, setMySeekerProfile] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthLoading(false);
      setSession(session);
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthLoading(false);
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Apply theme class
  useEffect(() => {
    localStorage.setItem("sih_theme", JSON.stringify(theme));
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  }, []);

  const setCollege = useCallback((c) => {
    setCollegeState(c);
    localStorage.setItem("sih_college", JSON.stringify(c));
  }, []);

  const addToast = useCallback((msg, kind = "ok") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const fetchSupabaseData = useCallback(async () => {
    try {
      const [teamsRes, seekersRes] = await Promise.all([
        supabase.from('teams').select('*').order('createdAt', { ascending: false }),
        supabase.from('seekers').select('*').order('createdAt', { ascending: false })
      ]);

      if (teamsRes.data) {
        setTeams(teamsRes.data);
      }
      if (seekersRes.data) {
        setSeekers(seekersRes.data);
      }
    } catch (e) {
      console.error(e);
      addToast("Failed to fetch data from server", "err");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Fetch role data when user changes
  const fetchRoles = useCallback(async () => {
    if (!user) {
      setMyTeam(null);
      setMySeekerProfile(null);
      setMyRequests([]);
      setMyApplications([]);
      return;
    }

    try {
      const [tRes, sRes] = await Promise.all([
        supabase.from('teams').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('seekers').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      if (tRes.data) {
        setMyTeam(tRes.data);
        // fetch incoming requests for this team
        const rRes = await supabase.from('join_requests').select('*, seekers(*)').eq('team_id', tRes.data.id).eq('status', 'pending');
        if (rRes.data) setMyRequests(rRes.data);
      } else {
        setMyTeam(null);
        setMyRequests([]);
      }
      if (sRes.data) {
        setMySeekerProfile(sRes.data);
        const appRes = await supabase.from('join_requests').select('*, teams(*)').eq('user_id', user.id);
        if (appRes.data) setMyApplications(appRes.data);
      } else {
        setMySeekerProfile(null);
        setMyApplications([]);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchSupabaseData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          fetchSupabaseData();
          fetchRoles();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seekers' },
        () => {
          fetchSupabaseData();
          fetchRoles();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'join_requests' },
        () => {
          fetchSupabaseData();
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRoles, fetchSupabaseData]);

  const addTeam = useCallback(async (team) => {
    try {
      if (!user) throw new Error("Not logged in");
      const { data, error } = await supabase.from('teams').insert([{ ...team, user_id: user.id }]).select();
      if (error) throw error;
      if (data) {
        setTeams((prev) => [data[0], ...prev]);
        setMyTeam(data[0]);

        supabase.functions.invoke('send-email', {
          body: {
            to: user.email,
            type: 'TEAM_CREATED',
            payload: {
              team_name: data[0].teamName || 'Your Team',
              student_name: data[0].members?.[0]?.name || 'Team Leader'
            }
          }
        }).catch(err => console.error("Failed to send team created email", err));

        // Sync to Google Sheets if configured
        if (import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK) {
          fetch(import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ type: 'team', data: data[0] })
          }).catch(console.error);
        }
      }
      return data[0];
    } catch (err) {
      console.error(err);
      addToast("Error creating team", "err");
      throw err;
    }
  }, [user, addToast]);

  const updateTeam = useCallback(async (id, data) => {
    try {
      const { error } = await supabase.from('teams').update(data).eq('id', id);
      if (error) throw error;
      setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      if (myTeam && myTeam.id === id) setMyTeam((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
      addToast("Error updating team", "err");
    }
  }, [myTeam, addToast]);

  const deleteTeam = useCallback(async (id) => {
    try {
      const { data, error } = await supabase.from('teams').delete().eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Permission denied. Could not delete from Supabase (Check RLS Policies).");

      setTeams((prev) => prev.filter((t) => t.id !== id));
      if (myTeam && myTeam.id === id) {
        setMyTeam(null);
        setMyRequests([]);
      }
    } catch (err) {
      console.error(err);
      addToast("Error deleting team", "err");
    }
  }, [myTeam, addToast]);

  const addSeeker = useCallback(async (seeker) => {
    try {
      if (!user) throw new Error("Not logged in");
      const { data, error } = await supabase.from('seekers').insert([{ ...seeker, listed: true, user_id: user.id }]).select();
      if (error) throw error;
      if (data) {
        setSeekers((prev) => [data[0], ...prev]);
        setMySeekerProfile(data[0]);

        // Send Welcome Email
        const email = data[0].whatsapp?.split('|')[1]?.trim();
        if (email) {
          supabase.functions.invoke('send-email', {
            body: {
              to: email,
              type: 'REGISTERED',
              payload: {
                student_name: data[0].name || 'Student'
              }
            }
          }).catch(err => console.error("Failed to send welcome email", err));
        }

        // Sync to Google Sheets if configured
        if (import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK) {
          fetch(import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ type: 'seeker', data: data[0] })
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error(err);
      addToast("Error listing yourself", "err");
      throw err;
    }
  }, [user, addToast]);

  const updateSeeker = useCallback(async (id, data) => {
    try {
      const { error } = await supabase.from('seekers').update(data).eq('id', id);
      if (error) throw error;
      setSeekers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      if (mySeekerProfile && mySeekerProfile.id === id) setMySeekerProfile((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
      addToast("Error updating profile", "err");
    }
  }, [mySeekerProfile, addToast]);

  const deleteSeeker = useCallback(async (id) => {
    try {
      const { data, error } = await supabase.from('seekers').delete().eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Permission denied. Could not delete from Supabase (Check RLS Policies).");

      setSeekers((prev) => prev.filter((s) => s.id !== id));
      if (mySeekerProfile && mySeekerProfile.id === id) setMySeekerProfile(null);
    } catch (err) {
      console.error(err);
      addToast("Error deleting profile", "err");
    }
  }, [mySeekerProfile, addToast]);

  const requestToJoin = useCallback(async (teamId) => {
    try {
      if (!user) throw new Error("Not logged in");
      if (!mySeekerProfile) throw new Error("You must list yourself as a seeker first!");

      // Check if user is already accepted into a team
      const { data: acceptedData } = await supabase
        .from('join_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (acceptedData) {
        throw new Error("You are already in a team. You can only join one team.");
      }

      // Check if they already applied to THIS team
      const { data: existingRequest } = await supabase
        .from('join_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .maybeSingle();

      let finalRequestData = null;

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          throw new Error("You already have a pending request for this team.");
        }
        if (existingRequest.status === 'accepted') {
          throw new Error("You are already in this team.");
        }
        // If they were rejected, allow them to re-apply (max 1 reapplication)
        if (existingRequest.status === 'rejected') {
          if ((existingRequest.reapply_count || 0) >= 1) {
            throw new Error("You have reached the maximum number of reapplications for this team.");
          }

          const { data, error } = await supabase.from('join_requests')
            .update({ status: 'pending', reapply_count: (existingRequest.reapply_count || 0) + 1 })
            .eq('id', existingRequest.id)
            .select();

          if (error) throw error;
          finalRequestData = data[0];

          // Remove old application from UI so it can be replaced
          setMyApplications(prev => prev.filter(app => app.id !== existingRequest.id));
        }
      } else {
        const { data, error } = await supabase.from('join_requests').insert([{
          team_id: teamId,
          user_id: user.id,
          seeker_id: mySeekerProfile.id,
          status: 'pending'
        }]).select();

        if (error) {
          if (error.code === '23505') throw new Error("You have already applied for this team.");
          throw error;
        }
        finalRequestData = data[0];
      }

      if (finalRequestData) {
        // Fetch the team data to match the join query shape
        const { data: teamData } = await supabase.from('teams').select('*').eq('id', teamId).single();
        const newApp = { ...finalRequestData, teams: teamData };
        setMyApplications(prev => [newApp, ...prev]);
      }

      // Notify team leader via email
      const targetTeam = teams.find(t => t.id === teamId);
      if (targetTeam) {
        const leaderEmail = targetTeam.members?.[0]?.email || targetTeam.contact?.split('|')[1]?.trim();
        if (leaderEmail) {
          supabase.functions.invoke('send-email', {
            body: {
              to: leaderEmail,
              type: 'JOIN_REQUEST',
              payload: {
                team_leader_name: targetTeam.members?.[0]?.name || 'Team Leader',
                requester_name: mySeekerProfile.name,
                branch: mySeekerProfile.dept || 'N/A',
                year: mySeekerProfile.year || 'N/A',
                skills: mySeekerProfile.skills?.join(', ') || 'Various',
                email: mySeekerProfile.whatsapp?.split('|')[1]?.trim() || 'N/A',
                request_message: 'I would love to join your team! Please review my profile on the board.',
                team_name: targetTeam.teamName || 'your team'
              }
            }
          }).catch(err => console.error("Failed to send email to leader", err));
        }
      }

      addToast("Request sent to Team Leader!", "ok");
    } catch (err) {
      console.error(err);
      addToast(err.message || "Error sending request", "err");
      throw err;
    }
  }, [user, mySeekerProfile, teams, addToast]);

  const acceptRequest = useCallback(async (requestId, seekerProfile) => {
    try {
      if (!myTeam) return;

      if (myTeam.members?.length >= 6) {
        throw new Error("Your team is already full (max 6 members).");
      }

      // SIH Rule Check: A complete team of 6 members must include at least one female member
      const tempMembers = [...(myTeam.members || []), {
        name: seekerProfile.name,
        gender: seekerProfile.gender
      }];
      if (tempMembers.length === 6 && !tempMembers.some(m => m.gender === 'f')) {
        throw new Error("SIH Rules: A complete 6-person team must include at least one female member.");
      }

      // Accept request
      const { error: rError } = await supabase.from('join_requests').update({ status: 'accepted' }).eq('id', requestId);
      if (rError) {
        if (rError.code === "23505") {
          throw new Error("This student has already joined another team (each student can only join one team).");
        }
        throw rError;
      }

      // Update team seats and members
      const parts = (seekerProfile.whatsapp || "").split("|");
      const phone = parts[0]?.trim() || "";
      const email = parts[1]?.trim() || "";

      const newMembers = [...(myTeam.members || []), {
        name: seekerProfile.name,
        email: email,
        phone: phone,
        program: seekerProfile.program || "UG",
        dept: seekerProfile.dept,
        year: seekerProfile.year,
        gender: seekerProfile.gender,
        skills: seekerProfile.skills?.join(', '),
        user_id: seekerProfile.user_id
      }];
      const newSeatsOpen = Math.max(0, myTeam.seatsOpen - 1);

      await updateTeam(myTeam.id, { members: newMembers, seatsOpen: newSeatsOpen });

      setMyRequests((prev) => prev.filter(r => r.id !== requestId));

      if (email) {
        supabase.functions.invoke('send-email', {
          body: {
            to: email,
            type: 'ACCEPTED',
            payload: {
              student_name: seekerProfile.name,
              team_name: myTeam.teamName || 'the team',
              team_leader: myTeam.members?.[0]?.name || 'Team Leader',
              member_count: myTeam.members.length + 1
            }
          }
        }).catch(err => console.error("Failed to send acceptance email", err));
      }

      addToast("Student accepted into team!", "ok");
    } catch (err) {
      console.error(err);
      addToast(err.message || "Error accepting student", "err");
    }
  }, [myTeam, updateTeam, addToast]);

  const rejectRequest = useCallback(async (requestId, reason = '') => {
    try {
      const { error } = await supabase.from('join_requests').update({ status: 'rejected' }).eq('id', requestId);
      if (error) throw error;

      const req = myRequests.find(r => r.id === requestId);
      if (req && req.seekers) {
        const seekerEmail = req.seekers.whatsapp?.split('|')[1]?.trim();
        if (seekerEmail) {
          supabase.functions.invoke('send-email', {
            body: {
              to: seekerEmail,
              subject: `Update on your team request for ${myTeam?.teamName || 'the team'}`,
              type: 'REJECTED',
              payload: {
                student_name: req.seekers.name || 'Student',
                team_name: myTeam?.teamName || 'the team',
                team_leader: myTeam?.members?.[0]?.name || 'Team Leader',
                removal_reason: reason || 'The team leader has declined your request.'
              }
            }
          }).catch(err => console.error("Failed to send rejection email", err));
        }
      }

      setMyRequests((prev) => prev.filter(r => r.id !== requestId));
      addToast("Request rejected.", "ok");
    } catch (err) {
      console.error(err);
      addToast(err.message || "Error rejecting request", "err");
    }
  }, [myRequests, myTeam, addToast]);

  const sendTeamInvite = useCallback(async (seeker, message) => {
    try {
      if (!myTeam) throw new Error("You must have a team to send invites.");
      if (myTeam.members?.length >= 6) throw new Error("Your team is already full (max 6 members).");

      let seekerEmail = seeker.email;
      if (!seekerEmail && seeker.whatsapp) {
        seekerEmail = seeker.whatsapp.split('|')[1]?.trim();
      }

      // Check if there is already a request or invite
      const { data: existing } = await supabase.from('join_requests')
        .select('*')
        .eq('team_id', myTeam.id)
        .eq('user_id', seeker.user_id)
        .maybeSingle();

      if (existing) {
        throw new Error("This student has already requested to join or you have already invited them.");
      }

      // Insert invite into database
      const { error: dbErr } = await supabase.from('join_requests').insert({
        team_id: myTeam.id,
        user_id: seeker.user_id,
        seeker_id: seeker.id,
        status: 'invited'
      });

      if (dbErr) throw dbErr;

      // Send Email
      const { error: fnErr } = await supabase.functions.invoke('send-email', {
        body: {
          to: seekerEmail || seeker.email,
          subject: `Team Invitation from ${myTeam.teamName}`,
          type: 'TEAM_INVITE',
          payload: {
            seeker_name: seeker.name,
            team_name: myTeam.teamName,
            team_leader_name: myTeam.members?.[0]?.name || 'The Team Leader',
            invite_message: message
          }
        }
      });
      if (fnErr) throw fnErr;

    } catch (err) {
      addToast(err.message || "Failed to send invite", "err");
      throw err;
    }
  }, [myTeam, addToast]);

  const removeMember = useCallback(async (teamId, memberUserId) => {
    try {
      const { error } = await supabase
        .from('join_requests')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', memberUserId);
      if (error) throw error;
    } catch (err) {
      console.error("Error releasing member:", err);
      addToast("Failed to release member in database", "err");
    }
  }, [addToast]);



  const value = {
    college, setCollege,
    teams, addTeam, updateTeam, deleteTeam,
    seekers, addSeeker, updateSeeker, deleteSeeker,
    toasts, addToast,
    theme, toggleTheme,
    stats: {
      teams: teams.length,
      seats: teams.reduce((acc, t) => acc + Math.max(0, 6 - (t.members || []).length), 0),
      seekers: seekers.filter((s) => s.listed).length,
    },
    isLoading,
    session, user, isAuthLoading,
    signOut: () => supabase.auth.signOut(),
    myTeam, mySeekerProfile, myRequests, myApplications,
    requestToJoin, acceptRequest, rejectRequest, removeMember, sendTeamInvite
  };

  return <SIHContext.Provider value={value}>{children}</SIHContext.Provider>;
}





