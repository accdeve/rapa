const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lumusermsvjgringtsmi.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  console.log('=== Database Columns SQL Query ===');
  
  const query = `
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('rooms', 'participants', 'questions', 'votes', 'canvas_items')
    ORDER BY table_name, ordinal_position;
  `;
  
  try {
    const { data, error } = await admin.rpc('exec_sql', { query });
    if (error) {
      console.log('RPC exec_sql failed:', error.message);
      
      // Let's try executing via pg_execute
      const { data: data2, error: err2 } = await admin.rpc('pg_execute', { sql_query: query });
      if (err2) {
        console.log('RPC pg_execute failed:', err2.message);
      } else {
        console.log('Columns from pg_execute:');
        console.log(data2);
      }
    } else {
      console.log('Columns from exec_sql:');
      console.log(data);
    }
  } catch (e) {
    console.log('Exception querying columns:', e.message);
  }
}

main().catch(console.error);
