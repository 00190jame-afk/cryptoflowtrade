

## Problem

Two issues prevent you from reaching the Super Admin dashboard:

1. **Race condition in Login.tsx**: After signing in, `onAuthStateChange` sets the `user` state, which triggers a `useEffect` that immediately redirects to `/`. This happens before the `handleSignIn` function can check the admin role and redirect to `/super-admin`.

2. **No navigation link**: The Header has no link to `/super-admin` or `/admin` for admin users, so even if you manually navigate there, there's no way to get back to it from the UI.

## Fix

### 1. Fix Login redirect race condition (`src/pages/Login.tsx`)

- Change the `useEffect` that checks `if (user)` to also check the admin role before redirecting. Instead of always going to `/`, it should check `admin_profiles` and redirect accordingly.
- Better approach: Add a `redirecting` state flag. When `handleSignIn` is called, set it to prevent the `useEffect` from redirecting. Let `handleSignIn` handle the redirect after checking the role.

### 2. Add admin dashboard links to Header (`src/components/Header.tsx`)

- Import and use the `useAdminRole` hook
- When the user's role is `super_admin`, show a "Super Admin" link pointing to `/super-admin`
- When the user's role is `admin`, show an "Admin" link pointing to `/admin`
- Add these in the user dropdown menu (next to Profile/Sign Out)

### Files to modify
- `src/pages/Login.tsx` — Fix the redirect logic
- `src/components/Header.tsx` — Add admin panel links for admin users

