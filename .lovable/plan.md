# Dashboard Redesign Plan

Two responsive treatments of the dashboard (`/dashboard`) driven by `useIsMobile()` (breakpoint 768px). Only presentation code is touched — no business logic, data, or route changes.

## Scope

Files to modify:
- `src/components/Dashboard.tsx` — layout shell, headers, backgrounds
- `src/components/Navigation.tsx` — sidebar (desktop) + bottom tab bar (mobile)
- `src/components/MealPlanner.tsx` — summary card, item cards, empty state, tag contrast, metadata grouping
- `src/translations/es.ts` (and `en.ts`, `pt.ts` if the "semamal" string is there) — fix "semamal" → "semanal" typo wherever it appears in copy shown on the summary card

## Global fixes

- **Typo**: replace "Comida semamal" → "Comida semanal" in the meal-plan summary card copy. If not found in translations, trace the card title in `MealPlanner.tsx` / `MealPlanView.tsx` and correct the literal.
- **A11y — tags**: raise contrast on chip/tag labels (e.g. country, difficulty). Use `bg-emerald-100 text-emerald-900` (or `text-foreground`) instead of light-on-light. Ensure ≥ 4.5:1 ratio.
- **A11y — metadata grouping**: wrap day/people/weight icons in a single flex row with consistent `gap-3` and `px-3 py-1.5` padding so the row reads as one group. Add `aria-label` summarizing the meta (e.g. "7 days, 2 people, 3.2 kg").

## Mobile (< 768px)

Dashboard shell:
- Content area background = solid `bg-neutral-950` (near-black). Remove the ingredients image on mobile (already conditional; keep and simplify).
- Remove the white/40 glass wrapper on mobile — cards sit directly on the dark canvas.

Top header (`Dashboard.tsx` mobile branch):
- Fixed, full-width, gradient `from-emerald-800 via-emerald-600 to-amber-400` (horizontal).
- Left: logo (invert white). Right: language selector, cart icon (hidden on native), circular avatar button — all vertically centered with `items-center gap-3`.

Bottom nav (`Navigation.tsx` mobile branch):
- Hide sidebar entirely on mobile (already the case). Keep fixed bottom bar.
- Same horizontal gradient as header.
- Four tabs only: Planificador, Comidas, Bebidas, Despensa. Drop the profile tab from mobile bottom nav (profile stays reachable via avatar in header).
- Active tab: solid `bg-emerald-800` pill with white icon+label, elevated with subtle inner shadow so it reads clearly against the gradient.
- Inactive: `text-white/75`.

Summary card (`MealPlanner.tsx` header card):
- Solid `bg-emerald-800` (no gradient, no glass).
- Title "Planificador de Comidas" in `text-white`, subtitle in `text-white/80`.
- CTA "+ Crear Plan de Comidas con IA" as full-width button (`w-full`), white background with emerald text, prominent.

Item cards (each existing meal plan card on mobile):
- Solid `bg-white` with `rounded-2xl` and soft shadow.
- Date in `text-neutral-900 font-semibold`.
- Metadata icons grouped in a single row (see A11y above), icons in `text-emerald-700`.
- Tags (country / difficulty): `bg-emerald-100 text-emerald-900 text-xs font-medium px-2.5 py-1 rounded-full`.

Empty state:
- Centered plain text `text-neutral-400 text-sm`: "No tienes más planes de comidas." No illustration, no card wrapper.

## Desktop (≥ 768px)

Dashboard shell:
- Keep full-viewport background image (`dashboardBg`) with `background-attachment: fixed`.
- Hide mobile header + bottom nav (already the case).

Sidebar (`Navigation.tsx` desktop branch):
- Replace the vertical `primary → accent` gradient with a **solid** dark emerald (`bg-emerald-900`) — no gradient, less visual noise against the busy background image.
- Keep collapse/expand toggle, active-state styling, and current items.

Desktop header (`Dashboard.tsx` desktop branch):
- Background: **transparent** (remove the gradient + backdrop-blur bar). Sits on top of the background image directly.
- One row, `items-center`, evenly aligned Y axis: welcome message ("Bienvenido {name}!") on left; language selector, cart, logout button on right.
- Text stays white with subtle `drop-shadow` for legibility over image.

Glass panels (main content wrapper + item cards):
- Increase blur to `backdrop-blur-xl` and raise white opacity to `bg-white/75` (from `/40`) so dark text remains legible over the ingredients image.
- Border: `border-white/60`. Shadow: `shadow-2xl`.
- Item cards: same glass treatment (`bg-white/80 backdrop-blur-lg`), rounded `rounded-2xl`.

Summary card CTA on desktop:
- "+ Crear Plan de Comidas con IA" uses **solid** `bg-emerald-600 hover:bg-emerald-700 text-white` (no transparency) so it pops against the translucent panels.

## Out of scope

- No changes to business logic, data fetching, meal-plan creation flow, translations beyond the typo, or non-dashboard pages.
- No new packages.

## Verification

After implementation:
- Toggle preview between mobile (375×812) and desktop (1280×800): confirm gradient header + dark canvas + bottom nav on mobile; solid emerald sidebar + glass panels + background image on desktop.
- Verify typo fixed on summary card.
- Tab through the header/nav with keyboard: focus rings visible, active tab announced via `aria-current`.
- Check tag contrast with a color-picker (≥ 4.5:1).
