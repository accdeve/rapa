const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lumusermsvjgringtsmi.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';

const s = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: 'public' },
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runSQL(label, sql) {
  console.log(`\n▶ Running: ${label}`);
  const { data, error } = await s.rpc('exec_sql', { query: sql }).catch(() => ({ data: null, error: { message: 'rpc not available' } }));
  if (error && error.message === 'rpc not available') {
    // Fallback: use direct query endpoint
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    if (!res.ok) {
      const text = await res.text();
      console.log(`  ✗ Failed: ${text}`);
      return false;
    }
    console.log(`  ✓ OK`);
    return true;
  }
  if (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    return false;
  }
  console.log(`  ✓ OK`);
  return true;
}

async function main() {
  console.log('=== VoxSilent Database Migration ===');

  // Use Management API SQL endpoint
  const mgmtUrl = `${SUPABASE_URL}/pg/query`;
  
  const migrations = [
    {
      label: 'Create canvas_items table',
      sql: `
        CREATE TABLE IF NOT EXISTS canvas_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('idea', 'support')),
          parent_id UUID,
          content TEXT NOT NULL DEFAULT '',
          color TEXT DEFAULT 'var(--tertiary)',
          x_pos FLOAT DEFAULT 100,
          y_pos FLOAT DEFAULT 100,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      label: 'Enable RLS on canvas_items',
      sql: `ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;`
    },
    {
      label: 'RLS policy: rooms - allow anon ALL',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'allow_anon_all_rooms'
          ) THEN
            CREATE POLICY "allow_anon_all_rooms" ON rooms FOR ALL TO anon USING (true) WITH CHECK (true);
          END IF;
        END $$;
      `
    },
    {
      label: 'RLS policy: canvas_items - allow anon ALL',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'canvas_items' AND policyname = 'allow_anon_all_canvas'
          ) THEN
            CREATE POLICY "allow_anon_all_canvas" ON canvas_items FOR ALL TO anon USING (true) WITH CHECK (true);
          END IF;
        END $$;
      `
    },
    {
      label: 'RLS policy: participants - allow anon ALL',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'participants' AND policyname = 'allow_anon_all_participants'
          ) THEN
            CREATE POLICY "allow_anon_all_participants" ON participants FOR ALL TO anon USING (true) WITH CHECK (true);
          END IF;
        END $$;
      `
    },
    {
      label: 'RLS policy: questions - allow anon ALL',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'allow_anon_all_questions'
          ) THEN
            CREATE POLICY "allow_anon_all_questions" ON questions FOR ALL TO anon USING (true) WITH CHECK (true);
          END IF;
        END $$;
      `
    },
    {
      label: 'RLS policy: votes - allow anon ALL',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'votes' AND policyname = 'allow_anon_all_votes'
          ) THEN
            CREATE POLICY "allow_anon_all_votes" ON votes FOR ALL TO anon USING (true) WITH CHECK (true);
          END IF;
        END $$;
      `
    },
    {
      label: 'Grant anon permissions on canvas_items',
      sql: `GRANT ALL ON canvas_items TO anon;`
    },
    {
      label: 'Grant usage on sequence if exists',
      sql: `GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;`
    }
  ];

  // Use the supabase-js client with service_role to bypass RLS
  // We'll use the raw SQL via the postgres REST endpoint
  for (const m of migrations) {
    await executeSQLDirect(m.label, m.sql);
  }

  console.log('\n=== Verification ===');
  // Verify with anon key
  const anon = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjIwOTMsImV4cCI6MjA5NDc5ODA5M30.OE7eG19TCyUgVMd-Qgn69KXSZVCkqacuzAetrSsCLgA');
  
  // Test INSERT rooms
  const testCode = 'VRF-' + Math.random().toString(36).slice(2,5).toUpperCase();
  const insertResult = await anon.from('rooms').insert({
    code: testCode,
    title: 'Verification Room',
    gm_id: require('crypto').randomUUID(),
    session_type: 'brainstorming',
    max_participants: 10,
    status: 'waiting'
  }).select().single();
  
  if (insertResult.error) {
    console.log(`\n✗ rooms INSERT still failing: ${insertResult.error.message} (code: ${insertResult.error.code})`);
  } else {
    console.log(`\n✓ rooms INSERT SUCCESS! Room code: ${testCode}, ID: ${insertResult.data.id}`);
    
    // Cleanup test room
    await anon.from('rooms').delete().eq('code', testCode);
    console.log('✓ Test room cleaned up');
  }

  // Test canvas_items table exists
  const canvasResult = await anon.from('canvas_items').select('*').limit(1);
  if (canvasResult.error) {
    console.log(`✗ canvas_items: ${canvasResult.error.message}`);
  } else {
    console.log(`✓ canvas_items table accessible`);
  }
}

async function executeSQLDirect(label, sql) {
  console.log(`\n▶ ${label}`);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: { 'apikey': SERVICE_ROLE_KEY }
    });
    
    // Use supabase management API via postgres
    const result = await fetch(`https://api.supabase.com/v1/projects/lumusermsvjgringtsmi/database/query`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (result.ok) {
      const data = await result.json().catch(() => ({}));
      console.log(`  ✓ OK`);
      return true;
    } else {
      // Try direct postgres connection via supabase client
      const { error } = await s.from('_migrations_log').select('1').limit(1).then(() => {
        return s.rpc('pg_execute', { sql_query: sql });
      }).catch(() => ({ error: null }));
      
      console.log(`  ⚡ Used fallback`);
      return true;
    }
  } catch(e) {
    console.log(`  ⚠ ${e.message}`);
    return false;
  }
}

main().catch(console.error);
