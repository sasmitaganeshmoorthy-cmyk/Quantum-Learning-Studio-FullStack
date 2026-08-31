# Frontend Enhancement and QA Guide

## Scope

This frontend enhancement phase covers responsive layout, overflow control, accessible interaction targets, motion preferences, theme contrast, image policy, metadata, resilient UI states, build verification, and repeatable quality gates. The backend and MongoDB integration are intentionally out of scope until frontend approval.

## Responsive breakpoints

| Target | Width | Expected layout |
|---|---:|---|
| Small mobile | 320px | Single-column pages, compact header, bottom navigation, tabbed lab and challenge workspaces |
| Tablet | 768px | Two-column content where appropriate, sidebar shell, contained workspaces |
| Desktop | 1024px | Multi-column dashboards, expanded controls, responsive data tables |
| Large desktop | 1440px+ | Bounded content containers and full lab panels |

The layout is mobile-first. Flex and Grid children use `min-width: 0` in split workspaces so long labels, code, or controls cannot force page-level overflow. Code blocks, circuit timelines, and wide academic tables use explicit inner scrolling because collapsing their data would remove meaning.

## Accessibility implementation

- Minimum 44×44px pointer targets for buttons, inputs, selects, navigation items, tabs, and circuit-grid cells.
- Three-pixel `:focus-visible` indicator with forced-colors fallback.
- Skip-to-content navigation.
- Keyboard placement and deletion in the circuit builder.
- `aria-live` announcements for circuit operations, AI activity, and simulation status.
- Dialog semantics, Escape handling, background scroll locking, and focus restoration for navigation and lesson overlays.
- Semantic tabs with `aria-selected` in lab, challenge, and code workspaces.
- Semantic table caption, column headers, and row headers for instructor progress data.
- Text summaries and coordinate data accompany visual quantum output.
- `prefers-reduced-motion` disables non-essential transitions, automatic circuit animation, and confetti.
- Light and dark theme foreground overrides maintain readable button contrast.

## Image and media policy

The current interface uses CSS, inline SVG, and icon components; it does not ship raster content images. Therefore, there are no unoptimized `<img>` elements in the current bundle.

When course illustrations or user media are added:

1. Use `next/image`, not a raw `<img>` element.
2. Supply intrinsic `width` and `height`, or use `fill` inside a sized parent.
3. Provide a responsive `sizes` value so Next.js generates an appropriate `srcset`.
4. Keep below-the-fold images lazy loaded, which is the default for `next/image`.
5. Use `priority` only for the single confirmed LCP image.
6. Provide meaningful alternative text; use an empty alt value only for decorative images.
7. Restrict remote image patterns in `next.config.ts` before using third-party domains.

The Next.js image configuration prefers AVIF and WebP and includes device sizes from 320px through 1920px.

## Interaction and perceived performance

- Fast, standard, and slow motion tokens are defined centrally.
- Hover transitions are limited to devices that support hover and fine pointers.
- Active controls use a subtle one-pixel press response.
- Route-level loading UI uses dimensionally stable skeletons.
- Global error and not-found pages offer clear recovery actions.
- System fonts eliminate render-blocking font downloads and build-time external font dependencies.
- Complex workspaces use route-level code splitting supplied by the Next.js App Router.

## Required automated checks

Run from the project root:

```bash
npm ci
npm run lint
npm test
npm run build
```

Expected baseline:

- ESLint: zero errors and zero warnings.
- Vitest: all tests passing.
- Next.js: optimized production build succeeds.

## Lighthouse quality gate

`lighthouserc.json` defines the required minimum category scores:

| Category | Minimum |
|---|---:|
| Performance | 90 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 90 |

It also enforces:

- LCP ≤ 2.5 seconds.
- CLS ≤ 0.1.
- Total Blocking Time ≤ 300ms as a laboratory proxy for interaction responsiveness.

Run Lighthouse against a production build in an incognito or clean browser profile. Perform at least three runs and use the median result. Final scores must be measured again after deployment because hosting, caching, API latency, and compression affect the result.

## Cross-browser matrix

Validate the latest two stable releases where available:

| Browser | Desktop | Mobile/device coverage |
|---|---|---|
| Chrome | Windows/macOS | Android Chrome and DevTools emulation |
| Safari | macOS | Real iPhone/iPad Safari |
| Firefox | Windows/macOS | Responsive Design Mode |
| Edge | Windows | Device emulation |

For every browser and breakpoint, verify:

1. No document-level horizontal scrolling.
2. Navigation drawer opens, closes with Escape, and restores focus.
3. Bottom navigation does not overlap content or device safe areas.
4. Circuit grid can be operated using keyboard and pointer input.
5. Lab and challenge tabs reveal the correct panels.
6. Select controls, forms, and dialogs remain usable at 200% zoom.
7. Light, dark, and system themes render without a flash of the wrong theme.
8. Reduced-motion mode removes non-essential movement.
9. Tables and code blocks scroll only within their labelled containers.
10. No runtime or hydration errors appear in the browser console.

## Real-device approval checklist

Before approval, test at minimum:

- One Android phone near 360px width.
- One iPhone near 390px width.
- One tablet in portrait and landscape.
- One Windows laptop at 100% and 200% browser zoom.
- One large desktop at 1440px or wider.

Record the browser version, device, route, result, and any screenshot reference. Backend work should start only after the frontend owner approves this checklist.

## Quantum Companion acceptance checks

1. Open a lesson, lab, course, challenge, catalog or progress route and confirm the floating “Ask Qubit” control appears.
2. Confirm the companion does not appear on the dashboard or settings pages.
3. Open, minimize and reopen the companion without losing messages.
4. Press `Ctrl + /` on Windows/Linux or `Cmd + /` on macOS to toggle it.
5. Enter Focus Mode and use the shortcut to restore the companion.
6. Change explanation level and verify beginner and advanced answers differ.
7. Ask for a challenge hint and confirm a complete solution is withheld until explicitly requested.
8. Navigate between learning pages and confirm session history persists.
9. At 320px width, confirm the panel stays above mobile navigation and all controls remain reachable.
10. Leave the page idle for five minutes and confirm the companion hides until activity resumes.
11. Verify session storage contains history and no network request is made when sending a message.
