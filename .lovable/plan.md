## Two bugs found

### 1. Recharge codes not showing
`handleGenerateRechargeCode` in `SuperAdminDashboard.tsx` (and same in `AdminDashboard.tsx`) calls the `generate_recharge_code()` RPC, which only **returns** a unique code string — it does **not** insert a row. The follow-up `update` by that code therefore updates 0 rows, and nothing is saved. DB confirms: 0 rows with `status='unused'` exist.

**Fix:** After calling the RPC, `insert` a row `{ code, amount, status: 'unused', created_by: auth.user.id }` into `recharge_codes` instead of update. (Alternatively replace with a new SECURITY DEFINER RPC `admin_create_recharge_code(amount)` that does both atomically — preferred for consistency.)

I'll add a new RPC `public.admin_create_recharge_code(p_amount numeric)` that:
- checks `is_any_admin()`
- generates a unique code
- inserts row with `created_by = auth.uid()`, `status='unused'`
- returns the code

Then update both dashboards to call this single RPC.

### 2. Trades not auto-completing (3–5 min)
The `auto-lose-trades-scheduler` cron job calls the edge function with `Authorization: Bearer <anon key>`. The function `auto-lose-trades/index.ts` rejects everything except a valid `CRON_SECRET` header or a service-role bearer token, so every cron tick returns 401 → no trades processed. (`CRON_SECRET` is not set in project secrets; edge function logs show only boot/shutdown, no execution.)

**Fix:** Re-schedule the cron job to send `x-cron-secret` header and add a `CRON_SECRET` value. Concretely:
- Add `CRON_SECRET` secret (ask user for a value, or auto-generate).
- Reschedule `auto-lose-trades-scheduler` (`cron.unschedule` + `cron.schedule`) so the `net.http_post` includes `"x-cron-secret": "<value>"` instead of relying on the anon bearer.

Note: this cron schedule SQL contains the secret, so it's executed via the insert/SQL tool (not migration), per project rules.

### Files touched
- New migration: `admin_create_recharge_code` RPC + GRANT EXECUTE to authenticated.
- `src/pages/SuperAdminDashboard.tsx`, `src/pages/AdminDashboard.tsx`: switch generation handler to the new RPC.
- Cron job re-scheduled via SQL insert tool after `CRON_SECRET` is added.

### Out of scope
No changes to RLS or to Quick Deposit. Your existing trade logic is untouched — only the cron's auth header is fixed.

---

**One thing I need from you:** the `CRON_SECRET` value. Either give me a string to use, or say "generate one" and I'll create a random 32-char value when I implement.