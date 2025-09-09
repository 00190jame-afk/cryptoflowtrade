-- Create positions_orders table for active trades
CREATE TABLE public.positions_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('LONG', 'SHORT')),
  entry_price NUMERIC NOT NULL,
  mark_price NUMERIC,
  quantity NUMERIC NOT NULL,
  leverage INTEGER NOT NULL,
  unrealized_pnl NUMERIC DEFAULT 0,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create closing_orders table for closed trades
CREATE TABLE public.closing_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('LONG', 'SHORT')),
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  leverage INTEGER NOT NULL,
  realized_pnl NUMERIC NOT NULL,
  original_trade_id UUID,
  closed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.positions_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closing_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for positions_orders
CREATE POLICY "Users can view their own positions"
ON public.positions_orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own positions"
ON public.positions_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions"
ON public.positions_orders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own positions"
ON public.positions_orders
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all positions"
ON public.positions_orders
FOR ALL
USING (is_admin());

-- Create RLS policies for closing_orders
CREATE POLICY "Users can view their own closed orders"
ON public.closing_orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own closed orders"
ON public.closing_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all closed orders"
ON public.closing_orders
FOR ALL
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_positions_orders_updated_at
BEFORE UPDATE ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();