# Legacy UI Migration Plan

## Current Legacy Scan

The legacy `request` folder was inspected read-only.

- Frontend: Vite, React 19, React Router 7, Tailwind CSS 4, lucide-react,
  SweetAlert2, and Kanit typography.
- Backend in monolith: Express, cookie sessions, CSRF middleware, PostgreSQL,
  SSO/OpenID client, upload handling, and zod.
- Routes: `/`, `/student`, `/student-request`, `/student/request/:id`,
  `/lecturer`, `/lecturer-request`, `/lecturer/request/:id`, `/staff`, staff
  status list routes, and `/staff/request/:id`.
- Layout: shared `DashboardLayout` with role-specific sidebar/topbar menus,
  responsive drawer, focus trap, logout action, KMUTT/department imagery, and
  orange brand tokens.
- Styling: global Tailwind import, Kanit font, `#f7f7fb` page background,
  `#111827` foreground, and `--brand-50` through `--brand-700` orange scale.
- API pattern: centralized `src/api/client.js`, `/api/v1` prefix normalization,
  `credentials: "include"`, `cache: "no-store"`, JSON error normalization, CSRF
  token fetch before mutations, and FormData uploads.
- Auth/session: `/auth/me`, `useAuthGuard`, sanitized `meStore` in
  sessionStorage/localStorage with TTL, role checks for student/lecturer/staff,
  and staff-like detection from role fields.
- Forms/state: local React state, multi-step request submission, drag-and-drop
  file upload, PDF/JPEG/PNG/WebP validation, per-file and total upload limits,
  SweetAlert2 confirmations/errors, AbortController on list loading, loading,
  empty, retry, and error states.

## Migration Method

1. Inventory every legacy route, page, layout, view, component, asset, API call,
   auth/session behavior, form, state store, and validation rule.
2. Create a route mapping table from legacy URL to new App Router segment.
3. Move reusable domain language into `entities`.
4. Move business use cases into `features`.
5. Move composed layout blocks into `widgets`.
6. Move multi-step flows into `processes`.
7. Keep route files thin and delegate migrated UI to the owning layer.

## Pixel-Consistent UI Rules

- Do not redesign during migration.
- Preserve text, density, spacing, behavior, empty states, loading states, and
  validation messages unless a product owner approves a change.
- Recreate legacy assets under `public/assets` with stable names.
- Centralize equivalent design tokens in `src/shared/theme` before replacing
  repeated legacy CSS values.

## Route Comparison

Create a table with:

- Legacy route
- New route
- Owning feature/process
- Required API calls
- Auth/session requirement
- Visual regression baseline
- Migration status

## Component Extraction

Start from leaf UI components and move upward:

- Pure display pieces become `shared/ui` only if business-agnostic.
- Domain-specific pieces become `entities`.
- Use-case pieces become `features`.
- Composed page regions become `widgets`.

## Visual Regression

When legacy screens are available:

- Capture desktop and mobile baselines before migration.
- Replay the same seed data against the new route.
- Compare layout, typography, colors, spacing, states, and overflow.
- Gate route migration on visual diff review plus accessibility smoke checks.

## Prohibited During Migration

- Do not change legacy UX/UI as part of mechanical migration.
- Do not call APIs directly from components.
- Do not scatter API URLs, color tokens, secrets, or business constants.
- Do not import feature code into `shared`.
