# Request Web Release Checklist

## Required Before Merge

- `bun install --frozen-lockfile`
- `bun run typecheck`
- `bun run lint`
- `bun run test`
- `bun run build`
- Secret scan for `.env`, tokens, private keys, and credentials
- Confirm no branch prefix `codex/` or `dbhub/`
- Confirm branch protection allows merge commits and does not require linear history

## Required Before Production Deployment

- Confirm `NEXT_PUBLIC_API_BASE_URL` points to the intended backend origin.
- Confirm backend exposes the mapped `/v1/...` contract.
- Run e2e login/list/detail/submit flows against seeded data.
- Capture desktop and mobile screenshots for legacy/new parity.
- Enable required status checks for `Request Web CI` after the workflow has run
  on GitHub.
- Confirm bypass actors remain limited to `ParkPawapon`.

## Rollback Notes

- Frontend release is static/runtime-configurable through
  `NEXT_PUBLIC_API_BASE_URL`.
- Do not rewrite default branch history for rollback.
- Prefer a revert commit or a new release branch if rollback is required.
