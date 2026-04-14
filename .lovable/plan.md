

## Fix: Supabase Resource Exhaustion (PostgREST Unhealthy)

### Problem
The `admin_profiles` table has 16.6 million sequential scans on just 3 rows. RLS policies that call `is_any_admin()` / `is_super_admin()` are triggered on every database query across the app, causing full table scans each time. This overloads the Nano-tier database, causing statement timeouts and PostgREST crashes.

### Solution

**1. Add missing indexes on `admin_profiles`** (database migration)
- Add index on `admin_profiles(user_id)` — this is the column used in every RLS check
- Add index on `admin_profiles(user_id, role, is_active)` — composite index for the exact queries in `is_super_admin()` and `is_any_admin()`

**2. Add missing indexes on other hot tables**
- Add index on `trades(user_id, status)` if not already present
- Add index on `invite_codes(created_by)` and `invite_codes(code)` if missing
- Add index on `profiles(user_id)` if missing

**3. Verify RLS policies are not overly broad**
- Check if any RLS policies on frequently-accessed tables (trades, profiles, user_balances) call admin check functions unnecessarily
- If so, restructure them to only call admin checks when needed

### Impact
Adding proper indexes should reduce the sequential scans from millions to near-zero, dramatically lowering CPU usage and fixing the PostgREST health issue. No code changes needed — only database migrations.

### Files
- New migration SQL file (indexes)

