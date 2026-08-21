import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const SIHContext = createContext(null);

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
      if (sRes.data) setMySeekerProfile(sRes.data);
      else setMySeekerProfile(null);
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
        (payload) => {
          console.log('Realtime update: teams', payload);
          fetchSupabaseData();
          fetchRoles();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seekers' },
        (payload) => {
          console.log('Realtime update: seekers', payload);
          fetchSupabaseData();
          fetchRoles();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'join_requests' },
        (payload) => {
          console.log('Realtime update: join_requests', payload);
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
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
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
      const { error } = await supabase.from('seekers').delete().eq('id', id);
      if (error) throw error;
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

      const { error } = await supabase.from('join_requests').insert([{
        team_id: teamId,
        user_id: user.id,
        seeker_id: mySeekerProfile.id,
        status: 'pending'
      }]);
      if (error) {
        if (error.code === '23505') throw new Error("You have already applied for this team.");
        throw error;
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
                team_leader_name: targetTeam.contact?.split('|')[0]?.trim() || 'Team Leader',
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
  }, [user, mySeekerProfile, addToast]);

  const acceptRequest = useCallback(async (requestId, seekerProfile) => {
    try {
      if (!myTeam) return;

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
              team_leader: myTeam.contact?.split('|')[0]?.trim() || 'Team Leader',
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

  const rejectRequest = useCallback(async (requestId) => {
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
              type: 'REJECTED',
              payload: {
                student_name: req.seekers.name,
                team_name: myTeam?.teamName || 'the team',
                team_leader: myTeam?.contact?.split('|')[0]?.trim() || 'Team Leader',
                removal_reason: 'Your profile did not match the current requirements for the team.'
              }
            }
          }).catch(err => console.error("Failed to send rejection email", err));
        }
      }

      setMyRequests((prev) => prev.filter(r => r.id !== requestId));
      addToast("Request rejected.", "ok");
    } catch (err) {
      console.error(err);
      addToast("Error rejecting request", "err");
    }
  }, [addToast]);

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
    myTeam, mySeekerProfile, myRequests,
    requestToJoin, acceptRequest, rejectRequest, removeMember
  };

  return <SIHContext.Provider value={value}>{children}</SIHContext.Provider>;
}

export function useSIH() {
  const context = useContext(SIHContext);
  if (!context) throw new Error("useSIH must be used within SIHProvider");
  return context;
}





