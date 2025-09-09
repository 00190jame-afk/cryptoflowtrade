-- Create trade_rules table for profit rates based on stake
CREATE TABLE IF NOT EXISTS public.trade_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_stake NUMERIC NOT NULL,
  max_stake NUMERIC NOT NULL,
  profit_rate NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the exact profit rules based on stake amount only
INSERT INTO public.trade_rules (min_stake, max_stake, profit_rate) VALUES
(50, 99.99, 20),
(100, 249.99, 30),
(250, 999999999, 40)
ON CONFLICT DO NOTHING;

-- Enable RLS on trade_rules
ALTER TABLE public.trade_rules ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read trade rules (they're public configuration)
CREATE POLICY "Trade rules are viewable by everyone" 
ON public.trade_rules 
FOR SELECT 
USING (true);

-- Only admins can modify trade rules
CREATE POLICY "Admins can manage trade rules" 
ON public.trade_rules 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Update trades table to match the new structure with leverage support
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS trade_duration INTEGER,
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE;

-- Update trades table to ensure it has all required columns
ALTER TABLE public.trades 
ALTER COLUMN result SET DEFAULT 'win'::character varying,
ALTER COLUMN status SET DEFAULT 'active'::character varying;