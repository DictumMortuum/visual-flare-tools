-- Create eurovision_nominations table
CREATE TABLE public.eurovision_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('partyGame', 'midWeight', 'heavyWeight')),
  game_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  game_year INTEGER,
  game_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE public.eurovision_nominations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all nominations except their own
CREATE POLICY "Users can view others' nominations"
ON public.eurovision_nominations
FOR SELECT
USING (auth.uid() != user_id);

-- Policy: Users can insert their own nominations
CREATE POLICY "Users can insert own nominations"
ON public.eurovision_nominations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own nominations
CREATE POLICY "Users can update own nominations"
ON public.eurovision_nominations
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own nominations
CREATE POLICY "Users can delete own nominations"
ON public.eurovision_nominations
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_eurovision_nominations_updated_at
BEFORE UPDATE ON public.eurovision_nominations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();