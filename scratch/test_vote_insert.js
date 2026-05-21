const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://lumusermsvjgringtsmi.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMjA5MywiZXhwIjoyMDk0Nzk4MDkzfQ.Uo8igJz8qQ0LC37o7v_IbymII7AvKd5ZONgSEbcilr8';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  console.log('=== Test Votes Insert ===');
  
  // 1. Create a temporary room
  const code = 'VOT-' + crypto.randomUUID().slice(0,4).toUpperCase();
  const { data: room, error: roomErr } = await admin.from('rooms').insert({
    code,
    title: 'Vote Test Room',
    session_type: 'brainstorming',
    max_participants: 10,
    status: 'waiting'
  }).select().single();
  
  if (roomErr) {
    console.error('Room create failed:', roomErr.message);
    return;
  }
  console.log('✓ Room created:', room.id);
  
  // 2. Create a temporary participant
  const { data: participant, error: partErr } = await admin.from('participants').insert({
    room_id: room.id,
    avatar_seed: crypto.randomUUID(),
    is_muted: false
  }).select().single();
  
  if (partErr) {
    console.error('Participant create failed:', partErr.message);
    await admin.from('rooms').delete().eq('id', room.id);
    return;
  }
  console.log('✓ Participant created:', participant.id);

  // 3. Create a temporary question
  const { data: question, error: qErr } = await admin.from('questions').insert({
    room_id: room.id,
    content: 'Test question?',
    status: 'pending'
  }).select().single();
  
  if (qErr) {
    console.error('Question create failed:', qErr.message);
    await admin.from('rooms').delete().eq('id', room.id);
    return;
  }
  console.log('✓ Question created:', question.id);

  // 4. Test vote INSERT
  console.log('Testing INSERT into votes...');
  const { data: vote, error: voteErr } = await admin.from('votes').insert({
    question_id: question.id,
    participant_id: participant.id,
    group_id: crypto.randomUUID() // arbitrary UUID for testing
  }).select().single();
  
  if (voteErr) {
    console.error('✗ Vote INSERT failed:', voteErr.message, voteErr.code);
  } else {
    console.log('✓ Vote INSERT success! Vote details:', vote);
  }
  
  // 5. Cleanup
  await admin.from('rooms').delete().eq('id', room.id);
  console.log('✓ Cleanup completed');
}

main().catch(console.error);
