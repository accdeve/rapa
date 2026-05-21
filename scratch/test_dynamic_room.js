const { createClient } = require('@supabase/supabase-js');
const http = require('http');

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjIwOTMsImV4cCI6MjA5NDc5ODA5M30.OE7eG19TCyUgVMd-Qgn69KXSZVCkqacuzAetrSsCLgA';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';

const anon = createClient('https://lumusermsvjgringtsmi.supabase.co', ANON_KEY, { auth:{autoRefreshToken:false,persistSession:false}});
const admin = createClient('https://lumusermsvjgringtsmi.supabase.co', SERVICE_ROLE, { auth:{autoRefreshToken:false,persistSession:false}});

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`[GET] ${url} -> Status: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    }).on('error', (err) => {
      console.log(`[GET] ${url} -> ERROR: ${err.message}`);
      resolve(false);
    });
  });
}

async function main() {
  console.log('Testing dynamic room route compilation and rendering...');

  // 1. Create a temporary room in Supabase
  const code = 'E2E-' + Date.now().toString(36).toUpperCase().slice(-4);
  const { data: room, error } = await anon.from('rooms').insert({
    code, title: 'E2E Test Room', session_type: 'brainstorming', max_participants: 10, status: 'waiting'
  }).select().single();

  if (error) {
    console.error('Failed to create room in Supabase:', error.message);
    process.exit(1);
  }

  console.log(`✓ Temporary room created in Supabase: ${code}`);

  // 2. Fetch the dynamic room page from our dev server
  const pageUrl = `http://localhost:3031/room/${code}`;
  const ok = await checkUrl(pageUrl);

  // 3. Clean up the room
  await admin.from('rooms').delete().eq('id', room.id);
  console.log('✓ Cleanup done');

  if (ok) {
    console.log('=== DYNAMIC ROOM ROUTE SUKSES (200 OK) ===');
  } else {
    console.log('=== DYNAMIC ROOM ROUTE GAGAL ===');
    process.exit(1);
  }
}

main().catch(console.error);
