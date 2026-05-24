## What's actually broken

The admin queries reference columns that don't exist in the database, so Supabase silently returns no rows. Mapping vs. real schema:

| Tab | Wrong column referenced | Real column |
|---|---|---|
| Invite codes | `is_used` | `is_active`, `current_uses`, `max_uses` |
| Recharge codes | `is_used`, `expires_at`, `used_by`, `created_by` | `status`, `user_id`, `redeemed_at`, `created_by` (no expiry) |
| Withdrawals | `currency`, `wallet_address` | (don't exist) — also need `withdraw_code`, `admin_notes`, `email` |
| Admin invite codes | `is_used` | `is_active`, `used_by`, `used_at` |
| Trades | filter `status IN ('pending','active')` | `active` is not a real status (only `pending`/`win`/`lose`) — hides everything except pending |
| Users | hard `.limit(20)` with no pagination | "I don't see all users" |

Same issues mirror in `AdminDashboard.tsx`.

## Plan

1. **Fix all column lists** in `SuperAdminDashboard.tsx` and `AdminDashboard.tsx` to match the real schema, and update the table cells that render them.
2. **Trades tab**: drop the `active` status filter so all trades show (pending + completed), keep `limit(50)` with newest first.
3. **Users tab**: add simple pagination (Prev/Next, page size 50) so super admin can browse every user instead of only the first 20.
4. **Invite / Recharge / Withdrawals tabs**: re-render using correct fields (status badge, used_at, withdraw_code, admin_notes, etc.).
5. **Verify** by loading `/super-admin` after the fix and checking each tab shows rows.

## About the password columns

I can't add a "show password" column. Supabase stores passwords as one-way bcrypt hashes in `auth.users.encrypted_password`. Nobody — not even the database owner — can read the original password. This is by design and is what protects accounts if the DB is ever leaked. Displaying plaintext passwords would also be a critical security violation and would fail every security scan.

What I will add instead, on both the Users tab and Admins tab:

- **Reset password** button → sends Supabase's official password-reset email to that user (`auth.resetPasswordForEmail`). They click the link and set a new password themselves.
- **Set new password** button (super admin only) → opens a small dialog where the super admin types a new password; we call a `set_user_password` edge function that uses the service role key to update the user via `supabase.auth.admin.updateUserById`. The new password is shown once in the dialog so the super admin can pass it to the user, then never stored or shown again.

This gives you the operational power you wanted (recover/change any account's password) without ever exposing existing passwords.

## Technical details

- Files: `src/pages/SuperAdminDashboard.tsx`, `src/pages/AdminDashboard.tsx`.
- New edge function: `supabase/functions/admin-set-password/index.ts` — verifies caller is `super_admin` via `admin_profiles`, then calls `supabase.auth.admin.updateUserById(userId, { password })`. Uses `SUPABASE_SERVICE_ROLE_KEY`.
- No schema migration needed — only query/column fixes plus one new edge function.
- The "Reset password" action uses client-side `supabase.auth.resetPasswordForEmail(email, { redirectTo: <site>/reset-password })`.

Confirm and I'll implement. If you'd rather skip the "Set new password" dialog and only keep the email-reset button, say so.