-- =========================================================================
-- VoxSilent: Supabase SQL Setup Migration & Realtime Sync Fix
-- Target Tables: public.rooms, public.canvas_items, public.questions, public.participants, public.votes
-- Purpose: 
--   1. Configure Google OAuth foreign key mappings.
--   2. Enable RLS and define fully inclusive read/write policies for BOTH GMs (authenticated) and Participants (anon).
--   3. Grant SQL privileges to both roles.
--   4. Enable Supabase Realtime for instant, refresh-free collaboration.
-- Run this in: https://supabase.com/dashboard/project/<your-project-id>/sql
-- =========================================================================

-- ─── STEP 1: ROOMS TABLE AUTHENTICATION INTEGRATION ──────────────────────

-- Ensure the rooms table has the correct column and references auth.users(id)
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_gm_id_fkey;

-- Ensures the gm_id column is properly cast to UUID type
ALTER TABLE public.rooms ALTER COLUMN gm_id TYPE UUID USING gm_id::UUID;

-- Adds the foreign key pointing to Supabase Auth's user database
ALTER TABLE public.rooms ADD CONSTRAINT rooms_gm_id_fkey FOREIGN KEY (gm_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Ensures that rooms can still be created anonymously (gm_id can be NULL)
ALTER TABLE public.rooms ALTER COLUMN gm_id DROP NOT NULL;


-- ─── STEP 2: INCLUSIVE ROW LEVEL SECURITY (RLS) POLICIES ──────────────────
-- We update policies to target 'public' or both 'anon' and 'authenticated' roles.
-- This ensures that when a GM logs in via Google (authenticated), they can still
-- read and write room data, canvas items, questions, and votes.

-- A. Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- B. Clean up old restrictive policies
DROP POLICY IF EXISTS "allow_anon_all_rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public read access to rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow room creation" ON public.rooms;
DROP POLICY IF EXISTS "Allow room updates" ON public.rooms;
DROP POLICY IF EXISTS "Allow room deletes" ON public.rooms;

DROP POLICY IF EXISTS "allow_anon_all_canvas" ON public.canvas_items;
DROP POLICY IF EXISTS "Allow public canvas access" ON public.canvas_items;

DROP POLICY IF EXISTS "allow_anon_all_participants" ON public.participants;
DROP POLICY IF EXISTS "Allow public participant access" ON public.participants;

DROP POLICY IF EXISTS "allow_anon_all_questions" ON public.questions;
DROP POLICY IF EXISTS "Allow public questions access" ON public.questions;

DROP POLICY IF EXISTS "allow_anon_all_votes" ON public.votes;
DROP POLICY IF EXISTS "Allow public votes access" ON public.votes;

-- C. Create Inclusive Policies (Targeting public so both anon and authenticated users match)

-- Rooms Policies
CREATE POLICY "Allow public read access to rooms" ON public.rooms FOR SELECT TO public USING (true);
CREATE POLICY "Allow room creation" ON public.rooms FOR INSERT TO public WITH CHECK (
  (auth.uid() IS NOT NULL AND gm_id = auth.uid()) OR (auth.uid() IS NULL AND gm_id IS NULL)
);
CREATE POLICY "Allow room updates" ON public.rooms FOR UPDATE TO public USING (
  (gm_id = auth.uid()) OR (gm_id IS NULL)
) WITH CHECK (
  (gm_id = auth.uid()) OR (gm_id IS NULL)
);
CREATE POLICY "Allow room deletes" ON public.rooms FOR DELETE TO public USING (
  (gm_id = auth.uid()) OR (gm_id IS NULL)
);

-- Canvas Items Policies (Allow both GMs and participants to read/write stickers)
CREATE POLICY "Allow public canvas access" ON public.canvas_items FOR ALL TO public USING (true) WITH CHECK (true);

-- Participants Policies (Allow reading, writing, and updating participant list)
CREATE POLICY "Allow public participant access" ON public.participants FOR ALL TO public USING (true) WITH CHECK (true);

-- Questions Policies (Allow reading and writing brainstorming questions/options)
CREATE POLICY "Allow public questions access" ON public.questions FOR ALL TO public USING (true) WITH CHECK (true);

-- Votes Policies (Allow reading and writing votes)
CREATE POLICY "Allow public votes access" ON public.votes FOR ALL TO public USING (true) WITH CHECK (true);


-- ─── STEP 3: GRANT PRIVILEGES TO BOTH ANONYMOUS AND AUTHENTICATED ROLES ───
-- Grants ensure postgres permissions don't block authenticated GM calls.
GRANT ALL ON public.rooms TO anon, authenticated;
GRANT ALL ON public.canvas_items TO anon, authenticated;
GRANT ALL ON public.questions TO anon, authenticated;
GRANT ALL ON public.participants TO anon, authenticated;
GRANT ALL ON public.votes TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


-- ─── STEP 4: SUPABASE REALTIME ENABLEMENT ─────────────────────────────────
-- This is critical! By adding tables to the supabase_realtime publication,
-- Supabase will broadcast all database modifications (Insert, Update, Delete)
-- in real-time to active frontend listeners without needing page refreshes.

BEGIN;
  -- Safe Re-Creation of Realtime Publication Bindings
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.rooms;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.canvas_items;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.questions;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.participants;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.votes;

  ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.canvas_items;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
COMMIT;

SELECT 'Migration and Realtime sync setup completed successfully!' AS status;
