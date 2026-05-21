## Fix: Supabase Resource Exhaustion — RLS evaluation storm

### Diagnosis (from `pg_stat_user_tables`)

| Table | Rows | Seq scans | Tuples read |
|---|---|---|---|
| `admin_profiles` | 3 | **16,612,289** | 16.7M |
| `trades` | 127 | 277,769 | **24.9M** |
| `profiles` | 34 | 111,238 | 1.87M |
| `invite_codes` | 4 | 91,616 | 365K |
| `messages` | 5 | 21,700 | 22K |

Indexes don't help: Postgres always seq-scans tables with <100 rows. The real problem is that **`is_any_admin()` / `is_super_admin()` are called per-row, per-query**, and several hot tables have 2–3 overlapping permissive RLS policies that each invoke these functions.

### Solution — two changes, no app code touched

**1. Wrap auth/admin calls in `(SELECT …)` in every RLS policy**

This is the Supabase-recommended optimization: Postgres treats `(SELECT auth.uid())` as an InitPlan and evaluates it **once per query** instead of once per row. Same for `(SELECT public.is_any_admin())`.

Apply to all policies on: `profiles`, `trades`, `user_balances`, `transactions`, `positions_orders`, `closing_orders`, `messages`, `withdraw_requests`, `invite_codes`, `recharge_codes`, `admin_profiles`, `admin_invite_codes`, `contact_messages`, `verification_codes`, `trade_rules`.

**2. Consolidate duplicate overlapping policies**

Each `permissive` SELECT policy is OR'd together — but Postgres still **evaluates every one**. Examples to merge:

- `profiles` has 3 SELECT policies (`Users can view their own profile`, `admin_all_profiles_select`, `Admins can view their assigned users`) → merge into one.
- `trades` has 3 SELECT policies → merge into one.
- `user_balances` has 3 SELECT policies → merge into one.
- `messages` has 2 SELECT policies → merge into one.
- `withdraw_requests` has 2 SELECT policies → merge into one.
- `contact_messages` has 2 overlapping admin policies → keep only the `is_any_admin()` one.

Merged pattern example for `profiles` SELECT:
```sql
USING (
  (SELECT auth.uid()) = user_id
  OR (SELECT public.is_any_admin())
)
```

(Admin-assigned-users scoping moves into the function or stays as one branch.)

### Expected impact

- `admin_profiles` seq scans drop from ~16M to roughly **1 per query** (was once per row × per policy × per query).
- `trades` tuple reads drop by ~10× (currently 196,000 tuples per scan because RLS re-evaluates admin checks per row).
- CPU on the Nano tier should fall from sustained-high to near-idle, fixing PostgREST timeouts.

### Files

- One new migration SQL file rewriting all hot-table RLS policies.
- **No application/TypeScript changes.**

### Out of scope

- Compute upgrade (user can do this separately if they still want headroom).
- The previously-added indexes stay; they don't hurt and help once tables grow.
