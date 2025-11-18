-- Create builds table for saving PC configurations
CREATE TABLE public.builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  budget INTEGER NOT NULL,
  use_case TEXT NOT NULL,
  custom_requirements TEXT,
  build_data JSONB NOT NULL,
  selected_tier TEXT NOT NULL,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view builds that have a share token (public shares)
CREATE POLICY "Public builds are viewable by anyone with share token"
ON public.builds
FOR SELECT
USING (share_token IS NOT NULL);

-- Policy: Anyone can insert builds (no auth required for saving)
CREATE POLICY "Anyone can create builds"
ON public.builds
FOR INSERT
WITH CHECK (true);

-- Create function to generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_builds_updated_at
BEFORE UPDATE ON public.builds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster share token lookups
CREATE INDEX idx_builds_share_token ON public.builds(share_token) WHERE share_token IS NOT NULL;

-- Create peripherals table for recommendations
CREATE TABLE public.peripherals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- monitor, keyboard, mouse, headset
  model TEXT NOT NULL,
  price INTEGER NOT NULL,
  reason TEXT NOT NULL,
  specs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for peripherals
ALTER TABLE public.peripherals ENABLE ROW LEVEL SECURITY;

-- Policy: Peripherals are viewable if their parent build is viewable
CREATE POLICY "Peripherals viewable with build"
ON public.peripherals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.builds
    WHERE builds.id = peripherals.build_id
    AND builds.share_token IS NOT NULL
  )
);

-- Policy: Anyone can insert peripherals
CREATE POLICY "Anyone can create peripherals"
ON public.peripherals
FOR INSERT
WITH CHECK (true);