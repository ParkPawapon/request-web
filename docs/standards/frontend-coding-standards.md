# Frontend Coding Standards

## TypeScript

- Strict mode is required.
- Do not use `any`.
- Prefer `unknown` at unsafe boundaries, then narrow.
- Use branded IDs and nullable types from `src/shared/types`.
- Keep API types in `src/shared/api/types` or feature-local contracts.

## React

- Keep components focused and named by responsibility.
- Avoid business side effects in render paths.
- Do not fetch directly in components.
- Prefer composition over large conditional components.
- Use accessible names for interactive elements.

## Next.js App Router

- Server Components are the default.
- Add `"use client"` only where browser APIs, state, effects, or event handlers
  are required.
- Keep `src/app` limited to route files, layouts, provider composition, and
  route-level states.
- Validate authorization in server-side route boundaries when auth is added.

## MUI and Tailwind

- Use MUI for enterprise component primitives.
- Use Tailwind for layout utilities and responsive composition.
- Add or update centralized tokens before introducing new colors, radius,
  shadow, spacing, or typography values.
- Do not nest cards inside cards.

## Error, Loading, and Empty States

- Route segments must have loading and error states where latency or failures
  are expected.
- User-facing errors should be clear and safe.
- Developer-only details must be guarded by development mode.
- Empty states should name the missing data and the next meaningful action.

## Security

- Do not commit `.env`, tokens, credentials, or private keys.
- Use only `NEXT_PUBLIC_*` for browser-readable configuration.
- Keep API endpoint constants in `src/shared/api/endpoints`.
- Use `normalizeApiPath` or shared API helpers for payload-provided download
  paths.
- Use `normalizeInternalRedirect` for redirects that originate from API,
  query string, or storage values.
- Do not use `dangerouslySetInnerHTML` unless the value is sanitized and the
  decision is documented.
- Do not show raw backend stack traces or internal exception messages to users.

## Testing

- Add tests for user-visible behavior, not implementation details.
- Use `renderWithProviders` for component tests.
- Add integration or e2e coverage when a feature crosses routing, API, auth, or
  form boundaries.
