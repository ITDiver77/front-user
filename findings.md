# Review Findings

Front-end code review findings for token-based auto-login implementation.

## FU-2: AuthCallback.tsx (2026-04-05)

- `setAuthFromToken` always stores to `localStorage` (never `sessionStorage`) at `AuthContext.tsx:253`. By design for callback login — always creates persistent session. Acceptable.
- No cleanup for `setTimeout` in error path (`AuthCallback.tsx:28`). Low risk — component isn't conditionally rendered, but could trigger React warning if unmounted during the 2s delay. Not fixed.

## FU-3: App.tsx route (2026-04-05)

- Pre-existing: `_Dashboard` import on line 18 is unused (prefixed with `_`). Not related to this change. Not fixed.

## FIX-1: getContrastText() hex parsing (2026-04-05)

- No remaining issues. Fix was straightforward substring index correction.

## FIX-2: Hardcoded colors in Support.tsx (2026-04-05)

- Send button uses hardcoded `#fff` for active state text color. This is fine since the button bg is `primary.main` which is always colored enough for white text. Not fixed.
- Telegram chat background now uses `grey.100` instead of the original `#e8f0fe` (light blue tint). The blue tint is lost but theme consistency is gained. Acceptable tradeoff.

## FIX-3: Save credentials on Login.tsx (2026-04-05)

- Passwords stored as base64 in localStorage, NOT encrypted. Base64 is encoding, not encryption. Anyone with browser DevTools access can decode. Acceptable for convenience in a VPN manager context, but worth noting.
- `autoFocus` remains on username field even when credentials are pre-filled. User sees cursor in username field but both fields are populated. Could consider moving focus to password field when credentials are restored, but not critical.
