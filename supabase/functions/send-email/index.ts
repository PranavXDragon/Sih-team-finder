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

    const { to, subject: fallbackSubject, type, payload } = await req.json()

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
