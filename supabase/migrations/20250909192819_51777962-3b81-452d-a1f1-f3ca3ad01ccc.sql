-- Add visual indicator column for easier identification in Supabase dashboard
ALTER TABLE public.trades ADD COLUMN status_indicator TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN status = 'active' THEN '🔵 ACTIVE'
    WHEN status = 'completed' THEN '⚪️ COMPLETED'
    ELSE '⚫️ ' || UPPER(status)
  END
) STORED;