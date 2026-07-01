# Frontend Architecture

## Overview

`request-web` is a Next.js App Router application built with Bun, React,
TypeScript strict mode, MUI, Tailwind CSS, Zod, Vitest, and React Testing
Library.

The codebase uses layer ownership so migrated legacy UI can move in without
turning `app` or `shared` into business logic buckets.

## Layer Responsibility

- `src/app`: routing, layouts, provider composition, route-level loading,
  not-found, and error states only.
- `src/features`: business use cases with local UI, hooks, schemas, services,
  and types.
- `src/entities`: reusable domain entities such as user, request, department,
  approval, and attachment.
- `src/widgets`: composed UI blocks such as header, sidebar, summary panel,
  dashboard section, and filter bar.
- `src/processes`: multi-step business flows such as request submission and
  approval.
- `src/shared`: business-agnostic API, config, constants, hooks, lib, styles,
  theme, types, UI primitives, utils, and validation.

## Import Boundary

`shared` must not import from `app`, `features`, `entities`, `widgets`, or
`processes`.

Route files should stay thin. They compose providers and route states, then
delegate business UI to feature, widget, or process modules.

Avoid circular dependencies. If two modules need each other, extract the stable
contract into `entities` or `shared`.

## Naming Convention

- Components: `PascalCase.tsx`
- Hooks: `useThing.ts`
- Schemas: `thing.schema.ts`
- Services: `thing.service.ts`
- Types: `thing.types.ts`
- Tests: `*.test.ts` or `*.test.tsx`

## API Convention

Components do not call `fetch` directly. Feature services use
`src/shared/api/client`, which centralizes base URL handling, timeout, auth token
injection hooks, and normalized errors.

All production API paths are centralized in `src/shared/api/endpoints` and use
the new `/v1/...` contract. Legacy `/api/v1/...` values from existing backend
payloads are normalized at the shared API boundary before they reach UI anchors
or request calls. Components must not concatenate API URLs or accept absolute
API URLs from server payloads.

API responses use `ApiSuccess`, `ApiPaginatedSuccess`, `ApiErrorPayload`,
`ApiId`, `ApiNullable`, and pagination types from `src/shared/api/types`.

## Styling Convention

MUI is the component system. Tailwind is used for layout utilities, responsive
composition, and low-level spacing. Colors, typography, radius, and shadows are
centralized in `src/shared/theme`.

Do not hardcode scattered design tokens. Add tokens first, then consume them
through MUI theme, CSS variables, or Tailwind utilities.

## Testing Convention

Vitest runs unit and component tests. React Testing Library tests user-visible
behavior. Use `src/test/utils/render.tsx` so components are rendered with app
providers.

Future e2e and visual regression tests should live beside Playwright config and
replay route mappings from the legacy migration plan.

## Security Convention

Public environment variables are validated separately from server-only
environment variables. Never expose secrets with `NEXT_PUBLIC_`.

User-facing errors must not leak internal detail. Developer detail can appear
only in development mode.

`next.config.ts` owns browser security headers for the application shell:
Content Security Policy, frame denial, content-type sniffing protection,
referrer policy, and a least-privilege permissions policy. Redirect values from
API/auth flows must pass through `src/shared/navigation`.
