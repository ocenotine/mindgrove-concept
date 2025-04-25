
-- Create subscription features in profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;

-- Create subscription events table to track subscription history
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT, -- 'upgrade', 'downgrade', 'payment_failed'
  tier TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for subscription_events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own subscription events
CREATE POLICY "select_own_subscription_events" ON public.subscription_events
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for service role to manage subscription events
CREATE POLICY "service_manage_subscription_events" ON public.subscription_events
USING (true);
