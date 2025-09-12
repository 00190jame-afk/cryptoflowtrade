-- Add scale column to closing_orders table
ALTER TABLE public.closing_orders 
ADD COLUMN scale text;