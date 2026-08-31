import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Verify Caller is Admin using Service Role client
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user || user.email !== 'admin@sih2026.com') {
      console.error('SPOC Auth check failed:', { userEmail: user?.email, userError });
      return new Response(JSON.stringify({ 
        error: `Unauthorized SPOC action: Current session is ${user?.email || 'Logged Out'}. Please sign in as admin@sih2026.com.`,
        details: { currentUser: user?.email, error: userError }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { teamName, theme, track, leaderName, leaderEmail, leaderPhone, leaderGender, leaderProgram, leaderBranch, leaderYear } = await req.json()

    if (!teamName || !leaderName || !leaderEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Provision User Account
    const tempPassword = generatePassword(10);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: leaderEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: leaderName }
    })

    if (authError) {
      return new Response(JSON.stringify({ error: 'Failed to create user', details: authError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const newUserId = authData.user.id;

    // 3. Insert Team
    const leaderMemberData = {
      name: leaderName,
      email: leaderEmail,
      phone: leaderPhone || '',
      gender: leaderGender || '',
      program: leaderProgram || 'UG',
      branch: leaderBranch || '',
      year: leaderYear || '',
      is_leader: true
    };

    const { data: teamData, error: teamError } = await supabaseAdmin.from('teams').insert({
      teamName: teamName,
      theme: theme || 'Software',
      status: 'Pending',
      user_id: newUserId,
      members: [leaderMemberData],
      seatsOpen: 5,
      totalSeats: 6,
      contact: `${leaderName} | ${leaderEmail}`
    }).select().single();

    if (teamError) {
      // Rollback user creation ideally, but for now just fail
      return new Response(JSON.stringify({ error: 'Failed to create team', details: teamError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }



    // 5. Send Welcome Email via Resend
    const htmlBody = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c8f24d; background: #000; padding: 10px 20px; border-radius: 8px;">Welcome to SIH 2026!</h2>
        <p>Hi ${leaderName},</p>
        <p>The SCET SPOC Admin has manually added your team <strong>${teamName}</strong> to the SIH 2026 platform.</p>
        <p>An account has been created for you. You can log in immediately and manage your team profile.</p>
        
        <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Login Details:</strong></p>
          <p style="margin: 0;"><strong>Email:</strong> ${leaderEmail}</p>
          <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> <code style="background: #e4e4e7; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
        </div>

        <p><em>Important: Please log in at <a href="https://sih.scetngp.com" style="color: #000;">sih.scetngp.com</a> and use the "Change Password" option in your Profile dropdown to set a new password.</em></p>
        <br/>
        <p>Best of luck,</p>
        <p><strong>SCET Nodal Center</strong></p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'SIH 2026 Updates <updates@sih2026.tech>',
      to: leaderEmail,
      subject: `Your SIH 2026 Team Account: ${teamName}`,
      html: htmlBody,
    });

    if (emailError) {
      console.error('Email sending failed', emailError);
    }

    return new Response(JSON.stringify({ success: true, team: teamData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: `Runtime error: ${error.message || error}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
