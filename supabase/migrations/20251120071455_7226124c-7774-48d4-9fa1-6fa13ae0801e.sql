-- Drop and recreate the function using gen_random_uuid instead
DROP FUNCTION IF EXISTS public.generate_share_token();

CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Use gen_random_uuid which is built-in, convert to text and clean it up
  token := replace(gen_random_uuid()::text, '-', '');
  -- Take first 16 characters for a shorter token
  token := substring(token, 1, 16);
  RETURN token;
END;
$$;