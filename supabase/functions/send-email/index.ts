// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { generateEmailHTML } from "./templates.ts"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (!user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    let { to, subject: fallbackSubject, type, payload } = await req.json()

    // 1. Secure SPOC Authorization & Idempotency logic
    const adminTypes = ['TEAM_SELECTED', 'TEAM_WAITLISTED', 'TEAM_REJECTED'];
    if (adminTypes.includes(type)) {
      if (user.email !== 'admin@sih2026.com') {
        return new Response(JSON.stringify({ error: 'Unauthorized SPOC action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        })
      }

      const teamId = payload?.team_id;
      if (!teamId) {
        return new Response(JSON.stringify({ error: 'Missing team_id payload' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // 2. Load persisted team record to derive recipient and status
      const { data: team, error: teamError } = await supabaseClient
        .from('teams')
        .select('*, members:seekers(*)')
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        return new Response(JSON.stringify({ error: 'Team not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      const leader = team.members?.find((m: any) => m.is_leader);
      if (!leader || !leader.email) {
        return new Response(JSON.stringify({ error: 'Team leader not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // 3. Atomically claim the notification delivery
      const { data: claimData, error: claimError } = await supabaseClient
        .from('teams')
        .update({ notification_sent: true })
        .eq('id', teamId)
        .or('notification_sent.is.null,notification_sent.eq.false')
        .select();

      if (claimError) {
        return new Response(JSON.stringify({ error: 'Database error claiming notification', details: claimError }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      if (!claimData || claimData.length === 0) {
        return new Response(JSON.stringify({ message: 'Notification already sent', skipped: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Override inputs with verified DB state
      to = leader.email;
      payload = {
        team_leader_name: leader.name,
        team_name: team.team_name || team.teamName || 'your team'
      };
      
      const authoritativeTeam = claimData[0];
      if (authoritativeTeam.status === 'Selected') type = 'TEAM_SELECTED';
      else if (authoritativeTeam.status === 'Waitlisted') type = 'TEAM_WAITLISTED';
      else if (authoritativeTeam.status === 'Rejected') type = 'TEAM_REJECTED';
      else {
        // Rollback claim if status is not finalizable
        await supabaseClient.from('teams').update({ notification_sent: false }).eq('id', teamId);
        return new Response(JSON.stringify({ error: 'Team status is not finalizable' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    }

    if (!to || !type) {
      return new Response(JSON.stringify({ error: 'Missing parameters: to and type are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    let finalHtml = '';
    let finalSubject = fallbackSubject || 'SIH 2026 Notification';

    if (type) {
      finalHtml = generateEmailHTML(type, payload || {});
      
      if (type === 'REGISTERED') {
        finalSubject = `Welcome to SIH 2026 SCET Platform! 🎉`;
      } else if (type === 'TEAM_CREATED') {
        finalSubject = `Success: Your team ${payload?.team_name || ''} was created!`;
      } else if (type === 'ACCEPTED') {
        finalSubject = `Request Accepted: Welcome to ${payload?.team_name || 'the team'}!`;
      } else if (type === 'REJECTED') {
        finalSubject = `Update on your team request for ${payload?.team_name || 'the team'}`;
      } else if (type === 'JOIN_REQUEST') {
        finalSubject = `New Request to join ${payload?.team_name || 'your team'}!`;
      } else if (type === 'WHATSAPP_GROUP_INVITE') {
        finalSubject = `Action Required: Join the Official SIH WhatsApp Group`;
      } else if (type === 'TEAM_SELECTED') {
        finalSubject = `Congratulations: ${payload?.team_name || 'Your team'} has been SELECTED for SIH 2026!`;
      } else if (type === 'TEAM_WAITLISTED') {
        finalSubject = `Update: ${payload?.team_name || 'Your team'} is Waitlisted for SIH 2026`;
      } else if (type === 'TEAM_REJECTED') {
        finalSubject = `Update on ${payload?.team_name || 'your team'} - SIH 2026`;
      }
    }

    const { data, error: resendError } = await resend.emails.send({
      from: 'SIH 2026 Updates <updates@sih2026.tech>', // User's custom verified domain
      to,
      subject: finalSubject,
      html: finalHtml,
    })

    if (resendError) {
      console.error('Resend Error:', resendError);
      return new Response(JSON.stringify({ error: resendError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
