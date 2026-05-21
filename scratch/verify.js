const { createClient } = require('@supabase/supabase-js');
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjIwOTMsImV4cCI6MjA5NDc5ODA5M30.OE7eG19TCyUgVMd-Qgn69KXSZVCkqacuzAetrSsCLgA';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';

const anon  = createClient('https://lumusermsvjgringtsmi.supabase.co', ANON_KEY,   { auth:{autoRefreshToken:false,persistSession:false}});
const admin = createClient('https://lumusermsvjgringtsmi.supabase.co', SERVICE_ROLE, { auth:{autoRefreshToken:false,persistSession:false}});

async function main() {
  console.log('Verifikasi lengkap setelah migration...\n');
  let allOk = true;

  // 1. rooms INSERT (anon)
  const code = 'VRF-' + Date.now().toString(36).toUpperCase().slice(-4);
  const { data: room, error: e1 } = await anon.from('rooms').insert({
    code, title: 'Verification Room', session_type: 'brainstorming', max_participants: 50, status: 'waiting'
  }).select().single();
  if (e1) { console.log('FAIL rooms INSERT:', e1.message, e1.code); allOk=false; }
  else     { console.log('OK   rooms INSERT  — code:', room.code, '| id:', room.id); }

  if (!room) { console.log('\nAbort: room not created'); return; }

  // 2. participants INSERT (anon)
  const { data: p, error: e2 } = await anon.from('participants').insert({
    room_id: room.id, avatar_seed: 'anon-test-seed', is_muted: false
  }).select().single();
  if (e2) { console.log('FAIL participants INSERT:', e2.message, e2.code); allOk=false; }
  else     { console.log('OK   participants INSERT — id:', p.id); }

  // 3. questions INSERT (anon)
  const { data: q, error: e3 } = await anon.from('questions').insert({
    room_id: room.id, content: 'Apa prioritas Q4?', status: 'pending'
  }).select().single();
  if (e3) { console.log('FAIL questions INSERT:', e3.message, e3.code); allOk=false; }
  else     { console.log('OK   questions INSERT  — id:', q.id); }

  // 4. canvas_items INSERT (anon)
  const { data: c, error: e4 } = await anon.from('canvas_items').insert({
    room_id: room.id, type: 'idea', content: 'Ide pertama', x_pos: 100, y_pos: 100
  }).select().single();
  if (e4) { console.log('FAIL canvas_items INSERT:', e4.message, e4.code); allOk=false; }
  else     { console.log('OK   canvas_items INSERT — id:', c.id); }

  // 5. rooms SELECT (anon)
  const { data: sel, error: e5 } = await anon.from('rooms').select('*').eq('id', room.id).single();
  if (e5) { console.log('FAIL rooms SELECT:', e5.message); allOk=false; }
  else     { console.log('OK   rooms SELECT      — status:', sel.status); }

  // 6. rooms UPDATE (anon) — simulate start session
  const { error: e6 } = await anon.from('rooms').update({ status: 'active' }).eq('id', room.id);
  if (e6) { console.log('FAIL rooms UPDATE:', e6.message); allOk=false; }
  else     { console.log('OK   rooms UPDATE      — status active'); }

  // Cleanup
  await admin.from('rooms').delete().eq('id', room.id);
  console.log('OK   Cleanup done\n');

  if (allOk) {
    console.log('=== SEMUA PASS! Database siap production. ===');
  } else {
    console.log('=== Ada yang masih gagal, cek di atas. ===');
  }
}
main().catch(console.error);
