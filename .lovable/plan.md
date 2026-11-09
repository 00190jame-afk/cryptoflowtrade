# Restore sign-in and Supabase health

## What we know
- Supabase's sign-in service logs (13:07–13:15 UTC today) show it cannot reach the database: "failed to connect ... dial error" and 10–24 second timeouts on `/token` and `/user`.
- So sign-in itself isn't broken. The database isn't answering, so every login times out.
- During the last check, the database connection pooler was also unreachable. The exact cause (paused project, CPU/memory exhaustion, or too many connections) is **not confirmed yet**.

## Step 1 — You, in the Supabase dashboard (needed first)
1. Open Project Settings > General. If the project shows **Paused**, click **Restore/Resume**.
2. If it isn't paused, click **Restart project** (Settings > General, or the Database Health page).
3. Under Reports > Database, check CPU, memory and connections. If they stay near 100% on the Nano plan, upgrade compute to Micro or higher. The Nano plan is too small for minute-by-minute jobs plus live updates.

## Step 2 — Me, once the database answers again
1. Run read-only checks: active connections, the longest-running queries, slow-query stats, and table scan counts. These tell us the real cause.
2. Check the every-minute trade job (`auto-lose-trades-scheduler`) and the daily cleanup job. Make sure runs aren't piling up or overlapping. If needed, add a guard so a new run is skipped while one is still going.
3. Count open live-update connections. Make sure each page opens only one, and closes it when you leave.
4. Fix any hot query we find with an index or a policy change, based only on what the checks show.
5. Sign in end-to-end with a real account and confirm the Super Admin panel loads.

## What will not change
- Sign-in method, page addresses, and admin structure stay as they are.
