// This script pings Supabase to prevent the project from pausing due to inactivity on the free tier.
// Supabase pauses free tier projects after 7 days of inactivity.
// We make a simple HTTP GET request to the REST API to keep it awake.

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

async function keepAlive() {
  console.log(`Pinging Supabase at ${supabaseUrl}...`);
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/teams?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      console.log('Successfully pinged Supabase REST API.');
    } else {
      console.error(`Failed to ping Supabase: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error pinging Supabase:', error);
    process.exit(1);
  }
}

keepAlive();
