-- Create trades table for futures trading platform
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trading_pair VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  stake_amount NUMERIC NOT NULL CHECK (stake_amount >= 50),
  leverage INTEGER NOT NULL CHECK (leverage IN (5, 10, 20, 50)),
  entry_price NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  result VARCHAR(10) NOT NULL DEFAULT 'win' CHECK (result IN ('win', 'loss')),
  profit_rate NUMERIC NOT NULL, -- 20, 30, or 40 based on stake
  required_price_change NUMERIC NOT NULL, -- profit_rate/leverage
  profit_loss_amount NUMERIC, -- stake_amount * (profit_rate/100)
  modified_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  trade_duration INTEGER, -- duration in seconds (60-300)
  current_price NUMERIC, -- current market price during trade
  target_price NUMERIC -- target price to hit for win
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own trades" 
ON public.trades 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades" 
ON public.trades 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can manage all trades" 
ON public.trades 
FOR ALL 
USING (is_admin());

-- Create index for better performance
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_created_at ON public.trades(created_at DESC);