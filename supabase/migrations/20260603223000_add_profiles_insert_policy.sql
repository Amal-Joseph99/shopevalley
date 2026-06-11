-- Add insert policy for profile creation during buyer signup

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND role = 'BUYER'
  );

CREATE POLICY IF NOT EXISTS "Users can select their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
