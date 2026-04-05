# Review Findings

Front-end code review findings for token-based auto-login implementation.

## FU-2: AuthCallback.tsx (2026-04-05)

- `setAuthFromToken` always stores to `localStorage` (never `sessionStorage`) at `AuthContext.tsx:253`. By design for callback login — always creates persistent session. Acceptable.
- No cleanup for `setTimeout` in error path (`AuthCallback.tsx:28`). Low risk — component isn't conditionally rendered, but could trigger React warning if unmounted during the 2s delay. Not fixed.

## FU-3: App.tsx route (2026-04-05)

- Pre-existing: `_Dashboard` import on line 18 is unused (prefixed with `_`). Not related to this change. Not fixed.

## FIX-1: getContrastText() hex parsing (2026-04-05)

- No remaining issues. Fix was straightforward substring index correction.
