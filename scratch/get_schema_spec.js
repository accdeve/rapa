const SUPABASE_URL = 'https://lumusermsvjgringtsmi.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';

async function main() {
  console.log('=== Fetching Database Schema Spec (OpenAPI) ===');
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE,
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'Accept': 'application/openapi+json'
    }
  });
  
  if (!res.ok) {
    console.error('Failed to fetch spec:', res.status, res.statusText);
    const body = await res.text();
    console.error('Error body:', body);
    return;
  }
  
  const spec = await res.json();
  const schemas = spec.definitions || spec.components?.schemas || {};
  console.log('Tables described in spec:', Object.keys(schemas));
  
  const votesSchema = schemas.votes;
  if (votesSchema) {
    console.log('\n--- Columns for table "votes" ---');
    console.log(JSON.stringify(votesSchema.properties, null, 2));
  } else {
    console.log('\n"votes" table schema not found in definitions.');
  }
  
  const participantsSchema = schemas.participants;
  if (participantsSchema) {
    console.log('\n--- Columns for table "participants" ---');
    console.log(JSON.stringify(participantsSchema.properties, null, 2));
  }

  const questionsSchema = schemas.questions;
  if (questionsSchema) {
    console.log('\n--- Columns for table "questions" ---');
    console.log(JSON.stringify(questionsSchema.properties, null, 2));
  }
}

main().catch(console.error);
