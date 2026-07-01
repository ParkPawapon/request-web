# Legacy Frontend Inventory

## Read-Only Sources

- `../request/src/main.jsx`
- `../request/src/routes/AppRoutes.jsx`
- `../request/src/api/client.js`
- `../request/src/hooks/useAuthGuard.js`
- `../request/src/lib/auth.js`
- `../request/src/lib/meStore.js`
- `../request/src/components/layout/DashboardLayout.jsx`
- `../request/src/components/ui/*`
- `../request/src/pages/student/*`
- `../request/src/pages/lecturer/*`
- `../request/src/pages/staff/*`
- `../request/backend/src/routes/*`
- `../request/backend/src/config/api.js`
- `../request/backend/src/services/petitionService.js`

## Route Inventory

| Legacy route | Legacy responsibility | New route | Status |
| --- | --- | --- | --- |
| `/` | Login and SSO/dev login entry | `/` | Migrated |
| `/student` | Student petition list | `/student` | Migrated |
| `/student-request` | Student request submission | `/student-request` | Migrated |
| `/student/request/:id` | Student request detail | `/student/request/[id]` | Migrated |
| `/lecturer` | Lecturer request list | `/lecturer` | Migrated |
| `/lecturer-request` | Lecturer request submission | `/lecturer-request` | Migrated |
| `/lecturer/request/:id` | Lecturer request detail | `/lecturer/request/[id]` | Migrated |
| `/staff` | Staff dashboard | `/staff` | Migrated |
| `/staff-request-submitted` | Staff submitted list | `/staff-request-submitted` | Migrated |
| `/staff-request-pending` | Staff pending list | `/staff-request-pending` | Migrated |
| `/staff-request-approved` | Staff approved list | `/staff-request-approved` | Migrated |
| `/staff-request-rejected` | Staff rejected list | `/staff-request-rejected` | Migrated |
| `/staff/request/:id` | Staff detail | `/staff/request/[id]` | Migrated |
| `*` | Redirect to `/` | App Router not-found/login fallback | Needs e2e verification |

## Component Inventory

- Layout: role-specific dashboard shell, sidebar navigation, top bar, responsive drawer.
- Login: SSO button, optional local dev account selector, SweetAlert2 error/success states.
- Lists: student/lecturer petition tables and staff dashboard/status lists.
- Details: summary cards, status pill, attachment sections, cancel action.
- Forms: student/lecturer request submission, attachment validation, CSRF protected submit.
- Shared UI: status pill, searchable select, full page loader, skeleton states.

## API Usage Inventory

Legacy frontend uses a centralized client with `/api/v1` prefix, cookie
credentials, `cache: "no-store"`, CSRF token calls, FormData uploads, and JSON
error normalization. New frontend maps the frontend contract to `/v1/...` and
keeps legacy `/api/v1/...` download payloads normalized at the shared API
boundary only.

## Auth And Session Inventory

- Legacy route guard loads `/auth/me`, validates role, redirects unauthorized
  users to `/`, and clears stale session data on logout.
- Session snapshots are stored with TTL in browser storage.
- Staff-like detection is role based.
- New frontend keeps the role guard in `src/processes/auth-guard`, session state
  in `src/entities/session`, and avoids bypassing permission checks.

## Style And Asset Inventory

- Brand: orange/amber KMUTT department palette with light page background.
- Typography: Kanit-like Thai-first visual density from legacy.
- Assets migrated: `dpit.png`, `dpitx65yrs.png`.
- SweetAlert2 remains for legacy-like confirmation/error modals.

## Risks

- Legacy runtime could not be captured during this hardening pass because the
  legacy `request` dev script starts Vite and Express together and depends on
  local backend environment files.
- Exact pixel parity should be verified with seeded backend data once legacy can
  be run safely in an isolated environment.
- Backend `/v1` implementation is expected but not yet verified by live e2e.

## Migration Priority

1. Auth/login and protected dashboard routes.
2. Request list/detail routes for student and lecturer.
3. Staff dashboard/status views.
4. Attachment download and upload flows.
5. Visual regression capture once backend runtime is isolated.

## Unknowns And Blockers

- No safe read-only legacy runtime screenshot was captured in this pass.
- Required GitHub status check names can be finalized only after the new CI
  workflow has run on GitHub at least once.
