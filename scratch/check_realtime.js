const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lumusermsvjgringtsmi.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  console.log('=== Database Realtime Publication check ===');
  
  const query = `
    SELECT pubname, schemaname, tablename 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime';
  `;
  
  try {
    const { data, error } = await admin.rpc('exec_sql', { query });
    if (error) {
      const { data: data2, error: err2 } = await admin.rpc('pg_execute', { sql_query: query });
      if (err2) {
        console.log('Both exec_sql and pg_execute failed:', err2.message);
      } else {
        console.log('Publication tables from pg_execute:', data2);
      }
    } else {
      console.log('Publication tables from exec_sql:', data);
    }
  } catch (e) {
    console.log('Exception querying publication tables:', e.message);
  }
}

main().catch(console.error);
