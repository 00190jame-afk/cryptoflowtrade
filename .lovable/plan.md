
# Supabase Performance Optimization Plan

Goal: cut PostgREST/DB load, kill polling, paginate admin views, eliminate `select('*')`, and split trade decision from trade execution so admin clicks are instant and resolution happens out-of-band.

## 1. Realtime instead of polling — `src/pages/Futures.tsx`

Current: `setInterval(... 15000)` refetches `trades`, `positions_orders`, `closing_orders`, and `user_balances` every 15s for every logged-in trader (4 queries × N users / 15s).

Change:
- Remove the 15s `refreshInterval` block entirely.
- Add a single channel `trades:user:{user.id}` subscribing to `postgres_changes` on `trades`, `positions_orders`, `closing_orders` filtered by `user_id=eq.{user.id}`.
- On each event, patch local state from `payload.new` (no refetch round-trip). Only refetch balance on a `trades` UPDATE where status transitions to `completed`.
- Keep the existing `user_balances` channel; ensure it's the only balance subscription.
- Keep the Binance price `setInterval` (external API, not Supabase) but slow it to 5s and pause when the tab is hidden via `document.visibilityState`.

## 2. Paginate + lazy-load admin dashboards

`src/pages/AdminDashboard.tsx` and `src/pages/SuperAdminDashboard.tsx` currently load full tables on mount. Apply:

- **Initial page size: 20 rows** per section using `.range(0, 19)` and a "Load more" button that increments the range.
- **Tab-gated fetching**: only fetch a section's data when its tab becomes active (Super Admin currently eagerly fetches users + trades + withdrawals on mount — restrict to the active tab; keep a tiny `stats` RPC for the overview cards).
- **Replace `select('*')`** with the exact columns each table renders. Example for trades list: `id, user_id, trading_pair, direction, stake_amount, leverage, status, decision, created_at, ends_at`.
- **Server-side filter** trades to active statuses already done — keep it, but add `.limit(20)`.
- **Overview stats** (totalUsers, totalBalance, pendingWithdrawals) move into a single `admin_overview_stats()` SECURITY DEFINER RPC returning one row of counts/sums, instead of pulling every profile + balance into the browser to `reduce()`.
- **Cache static data** (`trade_rules`, `admin_profiles`, `admin_invite_codes`) in module-level refs with a 60s TTL so tab switches don't refetch.

## 3. One subscription per page, clean teardown

Audit: `Futures.tsx`, `Assets.tsx`, `Messages.tsx`, `UserMessages.tsx` each open channels. Standardize:

- Channel name includes `user.id` to avoid cross-user collisions: `assets:{user.id}`, `messages:{user.id}`.
- Each `useEffect` returns `() => supabase.removeChannel(channel)`.
- Guard against double-subscribe in React StrictMode by checking `channel.state !== 'joined'` before `.subscribe()`.
- Add a small `useRealtimeChannel(name, config)` hook in `src/hooks/` to centralize the pattern and prevent future duplicates.

## 4. Stop refetching after every UI interaction

- Admin balance edit, set-win/set-lose, generate code: currently call `fetchUsers()` / `fetchTrades()` after every action. Replace with **optimistic local state patch** — update the row in `users`/`trades` array immediately, roll back on error.
- Remove the post-action full refetch; rely on the realtime subscription (item 1) for confirmation.

## 5. Edge function trimming — `supabase/functions/auto-lose-trades/index.ts`

- Replace per-trade queries with a single bulk SQL via `supabase.rpc('resolve_expired_trades')` (new SECURITY DEFINER function) that does the join, balance credit, and status flip in one transaction.
- Drop redundant validation selects when the row was just locked in the same transaction.
- Move chained admin actions (e.g., create position + update balance + log transaction) into one RPC each.

## 6. Trade decision vs. execution split

New columns on `trades`:
- `decision text` (`win` | `lose` | null) — already present per code; ensure indexed.
- `execute_at timestamptz` — when resolution should fire (= `ends_at`).
- `decided_at timestamptz`, `decided_by uuid`.

Flow:
- Admin "Set Win/Lose" only writes `decision`, `decided_by`, `decided_at`. Instant, no balance math, no status change. Optimistic UI confirms immediately.
- A cron-driven edge function (`resolve-due-trades`, runs every 30s) selects `WHERE status='active' AND execute_at <= now()` with `LIMIT 100`, applies `decision` (or auto-loses if null), and updates balances in bulk via the RPC from item 5.
- Existing `auto-lose-trades` is replaced/renamed.

## 7. Query + index optimization

Migration (one call, schema-only):
```sql
CREATE INDEX IF NOT EXISTS idx_trades_user_id        ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status         ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at     ON public.trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_decision       ON public.trades(decision) WHERE decision IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trades_execute_at     ON public.trades(execute_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_trades_status_execute ON public.trades(status, execute_at);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS execute_at  timestamptz;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS decided_at  timestamptz;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS decided_by  uuid;
```
Plus: new `resolve_expired_trades()` and `admin_overview_stats()` SECURITY DEFINER functions.

Replace every `select('*')` flagged in the audit (Assets, Profile, UserMessages, Futures, both dashboards, `useAdminRole`) with explicit column lists.

## 8. Rerender hygiene

- Wrap admin table rows in `React.memo` keyed by `id + updated_at`.
- Memoize `users.map(u=>u.user_id)` (currently rebuilt on every render and used as a `useCallback` dep, causing fetch loops).
- Convert `stats` updates to functional setState batched once per fetch.
- Move heavy formatters (`toLocaleString`, currency format) to `useMemo`.

## 9. Optimistic admin UX

Win/Lose, balance edit, withdraw approve/reject, message send: patch local array → fire mutation → on error revert + toast. No refetch.

## 10. Full audit pass

Walk every page once these land and verify:
- no `setInterval` touching Supabase
- no duplicate channel subscriptions
- no `select('*')`
- no `useEffect` whose deps include an array rebuilt every render
- `useAdminRole` runs once per session (cache role in context, not per-page hook call)

## Technical details

Files touched:
- `src/pages/Futures.tsx` — remove poll, add realtime channel, slim selects
- `src/pages/AdminDashboard.tsx` — pagination, column lists, optimistic patches
- `src/pages/SuperAdminDashboard.tsx` — tab-gated fetch, stats RPC, pagination
- `src/pages/Assets.tsx`, `Profile.tsx`, `UserMessages.tsx`, `Messages.tsx` — column lists, channel naming
- `src/hooks/useAdminRole.ts` — drop `select('*')`, cache result in context
- `src/hooks/useRealtimeChannel.ts` — new shared hook
- `src/contexts/AuthContext.tsx` — expose cached admin role
- `supabase/functions/auto-lose-trades/index.ts` → rename `resolve-due-trades`, bulk RPC
- New migration: indexes + `execute_at`/`decided_*` columns + `resolve_expired_trades()` + `admin_overview_stats()` RPCs

Order of work:
1. Migration (indexes, columns, RPCs)
2. `useRealtimeChannel` hook + auth-context role cache
3. Futures realtime swap
4. Admin dashboards pagination + optimistic UI
5. Edge function rewrite + cron schedule
6. Audit pass and cleanup

Expected impact: PostgREST request volume drops ~80% (no 15s polls × concurrent traders, no full-table admin loads), DB CPU drops because admin queries hit indexed `LIMIT 20` paths, and admin clicks feel instant due to optimistic UI.
