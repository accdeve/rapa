const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lumusermsvjgringtsmi.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  console.log('=== Database Schema Inspection ===');
  
  const tables = ['rooms', 'participants', 'questions', 'votes', 'canvas_items'];
  for (const t of tables) {
    try {
      const { data: rows, error: selErr } = await admin.from(t).select('*').limit(1);
      if (selErr) {
        console.log(`✗ ${t} select error:`, selErr.message);
      } else {
        console.log(`✓ ${t} columns:`, rows.length > 0 ? Object.keys(rows[0]) : '(empty table, cannot inspect columns via select)');
      }
    } catch (e) {
      console.log(`✗ ${t} exception:`, e.message);
    }
  }
}

main().catch(console.error);
