

## Build Admin & Super Admin Panels Into This App

### Overview
When a user logs in, the app will check their role via the existing `admin_profiles` table. Based on the role, they'll be redirected to the appropriate dashboard:
- **Regular user** → Current user dashboard (no change)
- **Admin** → Admin dashboard (manage assigned users, trades, balances, invite codes, recharge codes)
- **Super Admin** → Super Admin dashboard (everything admin has + manage admins, see all users, system-wide controls)

### Database
No schema changes needed. All required tables and functions already exist: `admin_profiles`, `is_any_admin()`, `is_super_admin()`, `get_admin_assigned_users()`, `admin_update_user_balance()`, `generate_invite_code()`, `generate_recharge_code()`.

### Implementation

**1. Role Detection Hook** (`src/hooks/useAdminRole.ts`)
- Query `admin_profiles` for the current user
- Return `{ role: 'super_admin' | 'admin' | 'user', loading, adminProfile }`

**2. Admin Dashboard Page** (`src/pages/AdminDashboard.tsx`)
- Sidebar navigation with sections: Users, Active Trades, Invite Codes, Recharge Codes, Withdrawals, Messages
- **Users tab**: List users assigned to this admin (via `get_admin_assigned_users`), view/edit balances (`admin_update_user_balance`)
- **Active Trades tab**: View pending trades for assigned users, set decision to 'win'
- **Invite Codes tab**: Generate and manage invite codes
- **Recharge Codes tab**: Generate recharge codes with amounts
- **Withdrawals tab**: View/approve/reject withdrawal requests
- **Messages tab**: Send messages to users

**3. Super Admin Dashboard Page** (`src/pages/SuperAdminDashboard.tsx`)
- Everything from Admin Dashboard plus:
- **All Users tab**: See all users across all admins
- **Admin Management tab**: View all admins, create admin invite codes, activate/deactivate admins
- **Trade Rules tab**: Manage trade rules (min/max stake, profit rates)
- **System Overview**: Dashboard stats (total users, total trades, total balance)

**4. Login Redirect Logic** (modify `src/pages/Login.tsx` and `src/contexts/AuthContext.tsx`)
- After successful login, check `admin_profiles` for the user
- If `super_admin` → redirect to `/super-admin`
- If `admin` → redirect to `/admin`
- Otherwise → redirect to `/` (current behavior)

**5. Route Registration** (modify `src/App.tsx`)
- Add `/admin` route → `AdminDashboard`
- Add `/super-admin` route → `SuperAdminDashboard`
- Both routes check role on mount and redirect unauthorized users

**6. Route Protection Component** (`src/components/AdminRoute.tsx`)
- Wraps admin pages, checks role, redirects to `/` if unauthorized

### Technical Details
- Admin pages will use `supabase.rpc()` calls to existing functions for all privileged operations
- Trade management will query `trades` table filtered by assigned users
- Real-time subscriptions for trades and withdrawal requests
- Responsive design with sidebar on desktop, bottom tabs on mobile

### File Changes Summary
- **New files**: `useAdminRole.ts`, `AdminDashboard.tsx`, `SuperAdminDashboard.tsx`, `AdminRoute.tsx`, plus sub-components for each dashboard section
- **Modified files**: `App.tsx` (routes), `Login.tsx` (redirect logic), `AuthContext.tsx` (expose role)

