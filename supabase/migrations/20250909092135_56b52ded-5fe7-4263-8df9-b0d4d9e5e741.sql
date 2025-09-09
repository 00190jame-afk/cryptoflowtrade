-- Enable real-time for withdraw_requests table
ALTER TABLE public.withdraw_requests REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER publication supabase_realtime ADD TABLE public.withdraw_requests;