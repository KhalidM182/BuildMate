-- Enable pgcrypto extension for gen_random_bytes function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the generate_share_token function to ensure it works
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  token TEXT;
BEGIN
  token := encode(gen_random_bytes(12), 'base64');
  token := replace(token, '/', '_');
  token := replace(token, '+', '-');
  RETURN token;
END;
$$;