-- Fix the RLS policy for builds table to be permissive
DROP POLICY IF EXISTS "Anyone can create builds" ON public.builds;

CREATE POLICY "Anyone can create builds"
ON public.builds
FOR INSERT
TO anon, authenticated
WITH CHECK (true);