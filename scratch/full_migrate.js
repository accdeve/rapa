const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://lumusermsvjgringtsmi.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjIwOTMsImV4cCI6MjA5NDc5ODA5M30.OE7eG19TCyUgVMd-Qgn69KXSZVCkqacuzAetrSsCLgA';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } });
const anon  = createClient(SUPABASE_URL, ANON_KEY,   { auth: { autoRefreshToken: false, persistSession: false } });

// ─── Step 1: Inspect rooms table schema ───────────────────────────────────────
async function inspectRoomsSchema() {
  console.log('\n📋 Step 1: Inspect rooms schema');
  // Try with gm_id = null
  const r1 = await admin.from('rooms').insert({ code:'SCH-001', title:'Schema Check', session_type:'brainstorming', max_participants:10, status:'waiting', gm_id: null }).select().single();
  if (r1.error) console.log('  gm_id=null:', r1.error.message);
  else { console.log('  gm_id nullable: YES ✓'); await admin.from('rooms').delete().eq('id', r1.data.id); }

  const r2 = await admin.from('rooms').insert({ code:'SCH-002', title:'Schema Check', session_type:'brainstorming', max_participants:10, status:'waiting' }).select().single();
  if (r2.error) console.log('  gm_id omitted:', r2.error.message);
  else { console.log('  gm_id omittable: YES ✓'); await admin.from('rooms').delete().eq('id', r2.data.id); }
}

// ─── Step 2: Check & fix RLS by testing anon access ───────────────────────────
async function checkAndReportRLS() {
  console.log('\n🔒 Step 2: RLS Check');
  const tables = ['rooms', 'participants', 'questions', 'votes'];
  const results = {};
  
  for (const t of tables) {
    const r = await anon.from(t).select('*').limit(1);
    results[t] = { canSelect: !r.error, selectErr: r.error?.code };
  }
  
  // Test INSERT on rooms (the critical one)
  const insertTest = await anon.from('rooms').insert({
    code: 'RLS-TST', title: 'RLS Test', session_type: 'brainstorming', max_participants: 10, status: 'waiting'
  }).select().single();
  
  results['rooms'].canInsert = !insertTest.error;
  results['rooms'].insertErr = insertTest.error?.code;
  if (insertTest.data) await admin.from('rooms').delete().eq('id', insertTest.data.id);
  
  console.log('  Results:', JSON.stringify(results, null, 4));
  return results;
}

// ─── Step 3: Create canvas_items ─────────────────────────────────────────────
async function createCanvasItems() {
  console.log('\n🗄️  Step 3: canvas_items table');
  const check = await admin.from('canvas_items').select('*').limit(1);
  if (!check.error) {
    console.log('  ✓ canvas_items already exists');
    return;
  }
  console.log('  ✗ canvas_items missing:', check.error.code);
  console.log('  → Cannot create via REST API (needs DDL). Generating SQL to report...');
}

// ─── Step 4: Test full flow with service_role (what frontend should do) ────────
async function testFullFlowAdmin() {
  console.log('\n🚀 Step 4: Full flow test (admin)');
  const code = 'FLW-' + crypto.randomUUID().slice(0,4).toUpperCase();
  
  // Create room (without gm_id since it's a FK to auth.users)
  const { data: room, error: roomErr } = await admin.from('rooms').insert({
    code,
    title: 'Flow Test Room',
    session_type: 'brainstorming',
    max_participants: 50,
    status: 'waiting'
  }).select().single();
  
  if (roomErr) { console.log('  ✗ Room create failed:', roomErr.message); return; }
  console.log('  ✓ Room created:', room.id, 'code:', room.code);
  
  // Create participant
  const { data: participant, error: partErr } = await admin.from('participants').insert({
    room_id: room.id,
    avatar_seed: crypto.randomUUID(),
    is_muted: false
  }).select().single();
  if (partErr) console.log('  ✗ Participant failed:', partErr.message, partErr.code);
  else console.log('  ✓ Participant created:', participant?.id);
  
  // Create question
  const { data: question, error: qErr } = await admin.from('questions').insert({
    room_id: room.id,
    content: 'Test question?',
    status: 'pending'
  }).select().single();
  if (qErr) console.log('  ✗ Question failed:', qErr.message, qErr.code);
  else console.log('  ✓ Question created:', question?.id);
  
  // Cleanup
  await admin.from('rooms').delete().eq('id', room.id);
  console.log('  ✓ Cleanup done');
}

// ─── Step 5: Generate SQL fix report ─────────────────────────────────────────
function printSQLFixes() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📄 SQL TO RUN IN SUPABASE DASHBOARD > SQL Editor');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log(`-- ① Fix RLS: Allow anon users to INSERT/UPDATE/DELETE (app has no auth)
-- Run this in: https://supabase.com/dashboard/project/lumusermsvjgringtsmi/sql

-- ROOMS
DROP POLICY IF EXISTS "allow_anon_all_rooms" ON public.rooms;
CREATE POLICY "allow_anon_all_rooms" ON public.rooms
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- PARTICIPANTS  
DROP POLICY IF EXISTS "allow_anon_all_participants" ON public.participants;
CREATE POLICY "allow_anon_all_participants" ON public.participants
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- QUESTIONS
DROP POLICY IF EXISTS "allow_anon_all_questions" ON public.questions;
CREATE POLICY "allow_anon_all_questions" ON public.questions
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- VOTES
DROP POLICY IF EXISTS "allow_anon_all_votes" ON public.votes;
CREATE POLICY "allow_anon_all_votes" ON public.votes
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ② Create canvas_items table (MISSING)
CREATE TABLE IF NOT EXISTS public.canvas_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('idea','support')),
  parent_id   UUID REFERENCES public.canvas_items(id) ON DELETE CASCADE,
  content     TEXT NOT NULL DEFAULT '',
  color       TEXT DEFAULT 'var(--tertiary)',
  x_pos       FLOAT8 DEFAULT 100,
  y_pos       FLOAT8 DEFAULT 100,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.canvas_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_anon_all_canvas" ON public.canvas_items;
CREATE POLICY "allow_anon_all_canvas" ON public.canvas_items
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ③ Remove gm_id FK if it references auth.users (rooms is used anonymously)
-- Check first: SELECT conname FROM pg_constraint WHERE conname LIKE '%rooms_gm%';
-- If exists, drop it:
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_gm_id_fkey;

-- ④ Make gm_id nullable (already should be, but ensure)
ALTER TABLE public.rooms ALTER COLUMN gm_id DROP NOT NULL;

-- Done!
SELECT 'Migration complete' AS status;
`);
  console.log('═══════════════════════════════════════════════════════\n');
}

async function main() {
  console.log('🔧 VoxSilent — Full Database Diagnostics & Fix\n');
  await inspectRoomsSchema();
  await checkAndReportRLS();
  await createCanvasItems();
  await testFullFlowAdmin();
  printSQLFixes();
}

main().catch(console.error);
