## Problem

Navigating to `/super-admin` immediately bounces back to `/`, even when logged in as a super admin (`feng20280@gmail.com`, confirmed in `admin_profiles`).

## Root cause

`src/hooks/useAdminRole.ts` initializes its loading state from the *first* render:

```ts
const [loading, setLoading] = useState(!cached && !!user);
```

On the first render after a fresh page load, `useAuth().user` is still `null` (AuthContext is hydrating), so `loading` is initialized to `false`. When `user` becomes available a tick later, the `useEffect` fires `loadRole()` but never flips `loading` back to `true` before awaiting the query.

Meanwhile `AdminRoute` reads `{ role, loading }`, sees `loading === false` and `role === 'user'` (the default), and immediately `<Navigate to="/" replace />` — before the admin_profiles query resolves.

## Fix

In `src/hooks/useAdminRole.ts`, inside the `useEffect`, set `loading` to `true` before calling `loadRole(user.id)` whenever there is no cache hit for the current user. Specifically:

- When `user` is set and `roleCache` has no entry for `user.id`, call `setLoading(true)` before the async load.
- Keep the existing `setLoading(false)` in `.finally()`.
- When `user` is set and the cache *does* have an entry, sync `role`/`adminProfile` from the cache and keep `loading` false.

This guarantees `AdminRoute` shows `<PageLoader />` until the real role lookup completes, eliminating the false redirect.

No other files need to change.
