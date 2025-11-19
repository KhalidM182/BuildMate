-- Drop existing insert policy and recreate with proper permissions
DROP POLICY IF EXISTS "Anyone can create builds" ON public.builds;

-- Create a more permissive insert policy
CREATE POLICY "Enable insert for all users"
ON public.builds
FOR INSERT
TO public
WITH CHECK (true);

-- Also update the select policy to be more permissive
DROP POLICY IF EXISTS "Public builds are viewable by anyone with share token" ON public.builds;

CREATE POLICY "Enable read access for all users"
ON public.builds
FOR SELECT
TO public
USING (true);
