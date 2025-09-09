-- Ensure the withdrawal processing trigger is properly configured
CREATE OR REPLACE TRIGGER process_withdrawal_trigger
  BEFORE UPDATE ON public.withdraw_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.process_withdrawal();

-- Verify table structure
ALTER TABLE public.withdraw_requests 
  ALTER COLUMN user_id SET NOT NULL;