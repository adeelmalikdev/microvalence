

## Problem

Two issues are causing the poor experience when navigating to Portfolio and Alumni:

1. **Navbar disappears on Alumni pages** -- The `AlumniConnect` and `AlumniGroups` pages render `<Navbar />` without passing `userRole="student"`, so the nav links (Dashboard, Opportunities, etc.) are hidden.

2. **Slow page transitions** -- There is no shared layout component. Every student page independently renders `<Navbar>`, `<main>`, etc. When you navigate, the entire component tree (including Navbar) unmounts and remounts, triggering fresh auth checks and data fetches. Combined with no React Query `staleTime`, every navigation refetches all data from scratch.

## Solution

### 1. Create a shared Student Layout with `<Outlet>`

Create a new `StudentLayout` component that renders the Navbar, Footer, and an `<Outlet />` for child routes. This keeps the Navbar mounted across all student pages, eliminating the remount flash.

```text
Before:                          After:
/student/dashboard -> full page  /student/* -> StudentLayout (stays mounted)
/student/portfolio -> full page     ├── Navbar (never remounts)
/student/alumni    -> full page     ├── <Outlet /> (only this swaps)
                                    └── Footer
```

### 2. Fix Navbar `userRole` prop on Alumni pages

The `AlumniConnect` and `AlumniGroups` pages currently call `<Navbar />` without `userRole`. With the shared layout, this is automatically fixed since the layout always passes `userRole="student"`.

### 3. Add React Query `staleTime` to prevent refetching on navigation

Configure the `QueryClient` with a default `staleTime` of 5 minutes so cached data is reused when navigating between pages.

---

## Technical Details

### File changes:

**New file: `src/layouts/StudentLayout.tsx`**
- Renders `<Navbar userRole="student" />` once
- Renders `<Outlet />` for child content
- Wraps content in the shared gradient background

**Modified: `src/App.tsx`**
- Wrap all `/student/*` routes inside a parent `<Route element={<StudentLayout />}>` using nested routes
- Update `QueryClient` to set `staleTime: 5 * 60 * 1000` (5 min) and `gcTime: 10 * 60 * 1000` (10 min)

**Modified: All student pages** (Dashboard, Portfolio, AlumniConnect, AlumniGroups, Opportunities, Applications, Tasks, Messages, Notifications, OpportunityDetails, AlumniGroupDetail, Profile, Search)
- Remove the individual `<Navbar>` from each page
- Remove the outer `<div className="min-h-screen ...">` wrapper (the layout handles it)
- Keep only the `<main>` content

This results in:
- Navbar stays visible and mounted on all student pages
- Navigation between pages is instant (no remount, cached data reused)
- Alumni pages show the full nav links
