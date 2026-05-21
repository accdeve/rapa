const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lumusermsvjgringtsmi.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjIwOTMsImV4cCI6MjA5NDc5ODA5M30.OE7eG19TCyUgVMd-Qgn69KXSZVCkqacuzAetrSsCLgA';

const https = require('https');
const crypto = require('crypto');

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Execute SQL via Supabase internal postgres endpoint with service role
function pgExec(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'lumusermsvjgringtsmi.supabase.co',
      path: '/rest/v1/rpc/pg_execute',
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE,
        'Authorization': 'Bearer ' + SERVICE_ROLE,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Prefer': 'return=representation'
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test direct service role insert (bypasses RLS)
async function testServiceRoleInsert() {
  console.log('\n=== Testing Service Role INSERT (bypasses RLS) ===');
  const testCode = 'SRV-TST';
  const { data, error } = await admin.from('rooms').insert({
    code: testCode,
    title: 'Service Role Test',
    gm_id: crypto.randomUUID(),
    session_type: 'brainstorming',
    max_participants: 10,
    status: 'waiting'
  }).select().single();
  
  if (error) {
    console.log('✗ Service role INSERT failed:', error.message, error.code);
    return null;
  }
  console.log('✓ Service role INSERT success:', data.id);
  await admin.from('rooms').delete().eq('code', testCode);
  console.log('✓ Cleaned up test');
  return data;
}

// Check tables via service role
async function checkTables() {
  console.log('\n=== Checking Tables ===');
  const tables = ['rooms', 'canvas_items', 'participants', 'questions', 'votes'];
  for (const t of tables) {
    const { data, error } = await admin.from(t).select('*').limit(1);
    if (error) {
      console.log(`✗ ${t}: ${error.message} (${error.code})`);
    } else {
      console.log(`✓ ${t}: accessible (${data.length} rows)`);
    }
  }
}

// Insert RLS policy via service role using raw SQL trick:
// We create a helper stored procedure first, then call it
async function setupRLSPolicies() {
  console.log('\n=== Setting Up RLS Policies ===');
  
  // Try to create policies using service role client
  // First, try anon INSERT to see current state
  const { error: anonErr } = await anon.from('rooms').insert({
    code: 'POL-CHK',
    title: 'Policy Check',
    gm_id: crypto.randomUUID(),
    session_type: 'brainstorming',
    max_participants: 10,
    status: 'waiting'
  }).select().single();
  
  if (!anonErr) {
    console.log('✓ Anon INSERT already works! Cleaning up...');
    await admin.from('rooms').delete().eq('code', 'POL-CHK');
    return;
  }
  
  console.log('✗ Anon INSERT blocked:', anonErr.code, '-', anonErr.message);
  
  if (anonErr.code === '42501') {
    console.log('\n→ RLS policy missing. Need to run SQL in Supabase Dashboard.');
    console.log('\n📋 SQL TO RUN IN SUPABASE DASHBOARD → SQL Editor:\n');
    console.log(`-- Fix RLS for all tables
CREATE POLICY IF NOT EXISTS "allow_anon_all_rooms" ON rooms FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_anon_all_canvas" ON canvas_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_anon_all_participants" ON participants FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_anon_all_questions" ON questions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_anon_all_votes" ON votes FOR ALL TO anon USING (true) WITH CHECK (true);`);
  }
}

// Check canvas_items
async function checkCanvasItems() {
  console.log('\n=== canvas_items Table ===');
  const { data, error } = await admin.from('canvas_items').select('*').limit(1);
  if (error) {
    console.log('✗ canvas_items not accessible:', error.message, error.code);
    if (error.code === 'PGRST205' || error.code === '42P01') {
      console.log('  → Table does not exist, need to create it');
    }
  } else {
    console.log('✓ canvas_items table exists and accessible');
  }
}

async function main() {
  console.log('🔍 VoxSilent — Database Audit & Fix\n');
  
  await testServiceRoleInsert();
  await checkTables();
  await checkCanvasItems();
  await setupRLSPolicies();
  
  console.log('\n=== Done ===');
}

main().catch(console.error);
