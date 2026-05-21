const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lumusermsvjgringtsmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bXVzZXJtc3ZqZ3Jpbmd0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjIwOTMsImV4cCI6MjA5NDc5ODA5M30.OE7eG19TCyUgVMd-Qgn69KXSZVCkqacuzAetrSsCLgA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Querying rooms...");
  const { data: rooms, error } = await supabase.from('rooms').select('*');
  if (error) {
    console.error("Error fetching rooms:", error);
    return;
  }
  console.log("Rooms currently in DB:", rooms);

  if (rooms.length === 0) {
    console.log("No rooms found. Creating a brainstorming room...");
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: newRoom, error: createError } = await supabase.from('rooms').insert({
      code,
      title: 'Brainstorming Session Realtime',
      session_type: 'brainstorming',
      status: 'active'
    }).select().single();

    if (createError) {
      console.error("Error creating room:", createError);
      return;
    }
    console.log("Created room:", newRoom);
  }
}

run();
