## Quick Deposit Feature — Implementation Plan

A new end-to-end Quick Deposit flow added on top of the existing app. No existing routes, auth, admin structure, or backend logic are changed — only extended.

---

### 1. Database (new migration)

**Table `deposit_wallets`** — admin-managed wallet pool
- `id`, `coin` (text), `network` (text), `wallet_address` (text), `qr_code_url` (text, storage path), `is_active` (bool, default true), `created_by` (uuid), `created_at`, `updated_at`
- Unique index on `(coin, network)` where `is_active = true`
- RLS:
  - `SELECT` for authenticated users when `is_active = true` (so deposit pages can read)
  - Full `ALL` for `is_any_admin()` (admins manage)

**Table `deposit_requests`** — user submissions
- `id`, `user_id` (uuid), `coin`, `network`, `wallet_address`, `amount` (numeric, > 0), `screenshot_url` (text), `status` (text: `pending`/`approved`/`rejected`, default `pending`), `admin_note`, `processed_by`, `processed_at`, `created_at`, `updated_at`
- RLS:
  - User can `INSERT` own rows (`user_id = auth.uid()`)
  - User can `SELECT` own rows
  - Admins (`is_any_admin()` scoped via `get_admin_assigned_users` like trades/profiles) can `SELECT`/`UPDATE`
  - Super admins see all
- Trigger `on_deposit_request_approved`: when `status` transitions `pending → approved`, credit `user_balances.balance` via existing `admin_update_user_balance` pattern and insert a `transactions` row (`type='deposit'`, `payment_method='quick_deposit'`). Idempotent via check on `transactions.external_transaction_id = 'DEP-' || id`.
- Rate-limit trigger: reject INSERT if user has a `pending` deposit_request created in last 60 seconds (duplicate prevention).

**Storage**
- New public bucket `deposit-qr` (admin uploads QR images, public read)
- New private bucket `deposit-proofs` (user-uploaded screenshots; user can insert own folder `{user_id}/...`, admins can read all)
- RLS policies on `storage.objects` for both buckets.

---

### 2. Frontend — User flow

All pages use existing `Header`, design tokens from `index.css`, shadcn components, sonner toasts, and match the current dark theme.

**Homepage Quick Deposit card** (`src/components/QuickDepositCard.tsx`)
- Inserted into `src/pages/Index.tsx` between `Hero` and `Advantages`
- Left: gradient icon (Wallet/Zap lucide). Title "Quick Deposit". Subtitle "Support BTC, USDT, ETH, and more". Right: arrow.
- Hover lift + glow, fully responsive. Routes to `/deposit/channels`.

**Recharge channel list** — `src/pages/DepositChannels.tsx` at `/deposit/channels`
- Auth-guarded (redirect to `/login` if not signed in).
- Fetches distinct active coins from `deposit_wallets`, grouped by coin.
- Renders card list with coin icon (use `cryptocurrency-icons` CDN or inline SVG map), coin name, available networks badges, right arrow → `/deposit/:coin`.
- Skeleton loaders.

**Deposit details** — `src/pages/DepositDetails.tsx` at `/deposit/:coin`
- Header: back button, coin name, network selector (dropdown if multiple active networks).
- Loads active wallet for selected `(coin, network)` from `deposit_wallets`.
- QR image (from `qr_code_url`), wallet address with copy button (sonner toast "Address copied successfully"), network badge.
- Form: amount input (numeric, min validation via zod), screenshot upload (JPG/PNG/WEBP, max 5MB, with preview).
- On submit: upload file to `deposit-proofs/{user_id}/{uuid}.{ext}`, insert into `deposit_requests`, toast success, redirect to `/deposit/history`.
- Instructions panel at bottom (static text).

**Deposit history** — `src/pages/DepositHistory.tsx` at `/deposit/history`
- Table/cards of user's own deposit_requests, newest first.
- Status badges (pending=amber, approved=green, rejected=red), amount, coin/network, copy request ID button, screenshot thumbnail link, admin note when present.
- Realtime subscription on `deposit_requests` filtered by `user_id` for live status updates.

All four routes registered in `src/App.tsx` (lazy-loaded, above the `*` catch-all).

---

### 3. Admin extensions

Extend existing `src/pages/AdminDashboard.tsx` and `src/pages/SuperAdminDashboard.tsx` — add two new tabs to each (no rebuild of existing tabs).

**Tab "Deposit Wallets"**
- Table of `deposit_wallets`.
- "Add wallet" dialog: select coin, network, paste address, upload QR image to `deposit-qr` bucket, toggle active.
- Inline edit / delete / toggle active.

**Tab "Deposit Requests"**
- Table of `deposit_requests` (admins see assigned users via existing `get_admin_assigned_users`; super admin sees all).
- Filter dropdown: all / pending / approved / rejected.
- Row actions: view screenshot (opens signed URL from `deposit-proofs`), approve, reject. Both open a small dialog requiring an optional/required `admin_note`.
- Approving updates `status='approved'` → trigger credits balance + inserts transaction.
- Rejecting updates `status='rejected'` with required note.

A small edge function `get-deposit-proof-url` issues short-lived signed URLs from `deposit-proofs` to admins (verifies caller via `is_any_admin()` RPC).

---

### 4. Security

- All inserts validated with zod (amount > 0, file mime type whitelist, size cap).
- RLS prevents users seeing others' requests or wallet management.
- Screenshot bucket is private; admins access only via signed URLs from the edge function.
- Duplicate submission guard via DB trigger.
- Status transitions enforced in trigger (only `pending → approved/rejected` credits balance; further updates no-op).
- No service-role key exposed to frontend.

---

### 5. Files touched

**New**
- `supabase/migrations/<new>.sql` (tables, RLS, triggers, buckets, bucket policies)
- `supabase/functions/get-deposit-proof-url/index.ts`
- `src/components/QuickDepositCard.tsx`
- `src/components/deposit/CoinIcon.tsx`
- `src/components/deposit/WalletManagerTab.tsx` (shared by Admin + SuperAdmin)
- `src/components/deposit/DepositRequestsTab.tsx` (shared by Admin + SuperAdmin)
- `src/pages/DepositChannels.tsx`
- `src/pages/DepositDetails.tsx`
- `src/pages/DepositHistory.tsx`
- `src/hooks/useDepositWallets.ts`, `src/hooks/useDepositRequests.ts`

**Edited (minimal, additive only)**
- `src/App.tsx` — register 3 new routes
- `src/pages/Index.tsx` — insert `<QuickDepositCard />`
- `src/pages/AdminDashboard.tsx` — add 2 tabs
- `src/pages/SuperAdminDashboard.tsx` — add 2 tabs

No changes to auth, existing routes, existing tables, or existing admin tabs.
