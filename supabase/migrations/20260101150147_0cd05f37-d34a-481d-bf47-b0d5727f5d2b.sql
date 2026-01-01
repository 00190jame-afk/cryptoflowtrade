-- Fix existing stuck trades that show ACTIVE but are actually completed wins
UPDATE trades 
SET status_indicator = '🟢 WIN'
WHERE status = 'win' 
  AND completed_at IS NOT NULL 
  AND status_indicator = '🔵 ACTIVE';