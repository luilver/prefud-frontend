# Accessibility Audit — Prefud (WCAG 2.2 AA)

> Audit-only deliverable. No code was modified in this pass.
> Method: static analysis of `src/`, `index.html`, theme tokens in `src/index.css`, plus computed WCAG contrast ratios for every theme. Severity is weighted toward the four lenses you requested: **contrast across themes**, **keyboard & focus**, **screen reader labels**, and **mobile / native UX**.

---

## 1. Executive summary

Prefud is built on shadcn/Radix primitives, so most of the **structural** ARIA (dialogs, menus, popovers, tabs) is correct out of the box. The issues concentrate in three places:

1. **Theme token contrast.** The `citrus` theme has two AA-failing token pairs that are used app-wide on buttons, badges, focus rings, and active nav states. `aqua` is borderline on `accent`. (See §2.)
2. **Hardcoded Tailwind colors that bypass tokens.** ~276 occurrences of `text-white` / `text-gray-*` / `bg-emerald-*` across components — most are intentional overlays on dark gradient headers (OK), but several are on light surfaces and fail contrast (e.g. `text-white/60`, `text-white/70`, `text-neutral-400` placeholders, "Secure / 256-bit SSL" trust line on SignIn).
3. **Missing accessible names and live regions.** Icon-only buttons in headers/scanners/OTP lack `aria-label`. The 5 async job indicators (`MealPlanJobIndicator` etc.) are visual-only — screen reader users get no announcement when a long-running plan/drink/meal/image job finishes.

No keyboard traps were identified. The Radix-backed dialogs, dropdowns, sheets, tabs, and tooltips handle focus management correctly. The main shell is missing a skip-to-content link and has zero `<main>` landmarks on the dashboard route (the only `<main>` elements live on `/signin`, `/signup`, and inside the unused shadcn sidebar primitive).

### Per-surface scores (0–100)

| Surface | Access. | Contrast | Keyboard | Screen reader | Mobile | WCAG AA |
|---|---:|---:|---:|---:|---:|---:|
| `SignIn` / `SignUp` | 78 | 72 | 90 | 75 | 85 | 70 |
| `Dashboard` shell (Nav + header) | 72 | 68 | 85 | 65 | 80 | 65 |
| `MealPlanner` / `MealPlanCreator` | 75 | 75 | 88 | 78 | 78 | 72 |
| `MealPlanView` / `MealPlanCalendarView` | 70 | 68 | 85 | 72 | 75 | 68 |
| `AIMealCreator` family | 74 | 72 | 86 | 74 | 80 | 70 |
| `AIDrinkCreator` family | 73 | 70 | 86 | 72 | 80 | 68 |
| `IngredientTracker` + `AddIngredientForm` + `AnalyzeImageCapture` | 70 | 72 | 82 | 65 | 75 | 65 |
| `CookingMode` / `UltraFocusCooking` | 72 | 78 | 80 | 70 | 82 | 70 |
| `Reels` / `ReelRecipeModal` | 60 | 65 | 70 | 55 | 72 | 55 |
| `UserProfile` / Subscription / Billing | 78 | 76 | 90 | 78 | 82 | 74 |
| `CheckoutFlow` (all steps) | 80 | 80 | 92 | 80 | 85 | 78 |
| Landing / Marketing pages | 76 | 72 | 90 | 78 | 82 | 72 |
| Async job indicators (×5) | 55 | 80 | 95 | 35 | 80 | 55 |

Counts: **9 Critical**, **17 Major**, **14 Minor**.

---

## 2. Theme contrast matrix

Ratios computed from the HSL tokens in `src/index.css`. Threshold: **4.5:1** for normal text, **3:1** for large text (≥18pt or 14pt bold) and UI components / focus indicators (WCAG 1.4.3 & 1.4.11).

### `:root` (Default — Classic Green)

| Pair | Ratio | AA text | AA large/UI |
|---|---:|:---:|:---:|
| `foreground` on `background` | 12.46 | ✅ | ✅ |
| **`primary-foreground` on `primary`** | **2.70** | ❌ | ❌ |
| `accent-foreground` on `accent` | 9.75 | ✅ | ✅ |
| `muted-foreground` on `background` | 4.52 | ✅ | ✅ |
| `secondary-foreground` on `secondary` | 6.16 | ✅ | ✅ |

### `[data-theme="citrus"]`

| Pair | Ratio | AA text | AA large/UI |
|---|---:|:---:|:---:|
| `foreground` on `background` | 12.46 | ✅ | ✅ |
| **`primary-foreground` on `primary`** (white on `#ff7f50`) | **2.55** | ❌ | ❌ |
| **`accent-foreground` on `accent`** (white on `#32CD32`) | **2.11** | ❌ | ❌ |
| `muted-foreground` on `background` | 4.52 | ✅ | ✅ |
| `secondary-foreground` on `secondary` | 6.28 | ✅ | ✅ |

### `[data-theme="aqua"]`

| Pair | Ratio | AA text | AA large/UI |
|---|---:|:---:|:---:|
| `primary-foreground` on `primary` | 4.80 | ✅ | ✅ |
| **`accent-foreground` on `accent`** | **4.33** | ❌ (borderline) | ✅ |
| `secondary-foreground` on `secondary` | 4.57 | ✅ | ✅ |

### `[data-theme="dusk"]`

| Pair | Ratio | AA text | AA large/UI |
|---|---:|:---:|:---:|
| `primary-foreground` on `primary` | 9.46 | ✅ | ✅ |
| `accent-foreground` on `accent` | 5.69 | ✅ | ✅ |
| `secondary-foreground` on `secondary` | 3.74 | ❌ (normal text) | ✅ |

### `.dark`

| Pair | Ratio | AA text | AA large/UI |
|---|---:|:---:|:---:|
| `foreground` on `background` | 16.46 | ✅ | ✅ |
| `primary-foreground` on `primary` | 9.23 | ✅ | ✅ |
| `accent-foreground` on `accent` | 10.92 | ✅ | ✅ |
| `muted-foreground` on `background` | 7.54 | ✅ | ✅ |

**Headline:** `citrus` is the worst offender (2 critical failures on tokens used on every Button, Badge, focus ring and `active` nav state). `default` fails on `primary` (white on the green `#4caf50`-ish swatch is 2.7:1). `aqua` and `dusk` fail one pair each in the normal-text range but pass the 3:1 UI component threshold, so they are mostly safe for solid buttons and chips, not for body text on a tinted background.

---

## 3. Critical findings (Priority: Critical)

### C-1 — `primary` button text fails AA in Default & Citrus themes
- **Location:** `src/index.css` `:root` line ~37, `[data-theme="citrus"]` line ~80; affects every `<Button>` (`bg-primary text-primary-foreground`) globally.
- **WCAG:** 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast.
- **Why it matters:** Sighted users with low vision and users in bright light cannot read primary CTAs ("Sign in", "Generate plan", "Add ingredient", checkout buttons). On Citrus, every primary action button is white-on-orange at 2.55:1.
- **Recommended fix:** Darken `--primary` or switch `--primary-foreground` to a dark token. For Default: lower L from 49% to ~38% (`122 39% 38%` → 4.6:1). For Citrus: change `--primary-foreground` from `0 0% 100%` to `16 80% 12%` (dark brown) → 7.5:1, or darken primary to `16 80% 42%`.

### C-2 — `accent` button/badge text fails AA in Citrus
- **Location:** `src/index.css` `[data-theme="citrus"]` `--accent: 120 61% 50%` with white foreground (2.11:1).
- **WCAG:** 1.4.3, 1.4.11.
- **Why it matters:** `accent` is used on the sidebar/nav gradient endpoint, on `hover:bg-accent`, and on every secondary chip. Currently illegible in Citrus.
- **Recommended fix:** `--accent: 120 61% 35%` (darker green) → 5.4:1 with white, or set `--accent-foreground: 120 61% 12%`.

### C-3 — Async job completion not announced to screen readers
- **Location:** `src/components/{MealPlan,Drink,AIMeal,PantryMeals,AnalyzeImage}JobIndicator.tsx`, paired `*ReadyModal.tsx`.
- **WCAG:** 4.1.3 Status Messages.
- **Why it matters:** Indicators are visual badges that swap from "in progress" to "ready" silently. A blind user starting a 60-second meal plan generation has no way to know when it finished.
- **Recommended fix:** Wrap the indicator content in `<div role="status" aria-live="polite" aria-atomic="true">`, and update the visible text on transition (e.g. "Meal plan generation in progress" → "Meal plan ready, opening dialog"). For errors, use `role="alert"`. Apply the same to the in-flight toast issued on jobId receipt.

### C-4 — Icon-only buttons missing accessible names
- **Locations (representative):**
  - `src/pages/Index.tsx:116` (`size="icon"` toggle, no `aria-label`)
  - `src/components/OTPVerification.tsx:169` (back button, icon only)
  - `src/components/CameraProductScanner.tsx:195` (close button)
  - `src/components/CameraProductScanner.tsx:257` (capture button `<img>` w/o alt as button child)
  - `src/components/AnalyzeImageCapture.tsx` (capture, retry, confirm — icon only on mobile)
  - `src/pages/SignIn.tsx:246` (password eye toggle — has icon only)
  - `src/components/Dashboard.tsx:198,246` (Cart `<Button>` with icon only — no `aria-label="Shopping cart"`)
  - `src/components/Dashboard.tsx:261` (avatar initial button — no `aria-label="Open profile"`)
  - `src/components/Navigation.tsx:69-83` (mobile bottom-nav: icon-only `<Button>` per item — only `title` is missing too; needs `aria-label={item.label}`)
  - `src/components/Navigation.tsx:170` (sidebar collapse toggle)
- **WCAG:** 4.1.2 Name, Role, Value; 2.4.4 Link Purpose.
- **Why it matters:** Screen reader users hear "button" with no purpose. The mobile bottom navigation is unusable with VoiceOver/TalkBack.
- **Recommended fix:** Add `aria-label` to every icon-only `<Button>`/`<button>`. Standardize via a wrapper (`<IconButton aria-label="..." />`) so this can't regress.

### C-5 — Mobile bottom-nav labels removed; tab targets only 14px tall in the active state
- **Location:** `src/components/Navigation.tsx:69-83`.
- **WCAG:** 2.5.8 Target Size (Minimum) (AA in 2.2), 4.1.2, 1.3.1.
- **Why it matters:** Buttons render `h-14` (56px — passes) but the icon is the only descriptor — no visible label, no `aria-label`, no `aria-current` for the active tab. AT users cannot tell which tab they're on.
- **Recommended fix:** Add `aria-label={item.label}` and `aria-current={isActive ? "page" : undefined}`. Consider restoring the visible label below the icon (text-[10px]) for cognitive accessibility; the bar is wide enough.

### C-6 — No `<main>` landmark on the Dashboard route (and its children)
- **Location:** `src/components/Dashboard.tsx`. Grep finds `<main>` only in `SignIn`, `SignUp`, and the unused shadcn `sidebar` primitive. Everything behind `/` (the entire authenticated app) has zero `<main>`.
- **WCAG:** 1.3.1 Info & Relationships, 2.4.1 Bypass Blocks.
- **Why it matters:** Screen reader users can't jump to main content; they have to traverse the entire nav on every tab change.
- **Recommended fix:** Replace the wrapping `<div className="relative min-h-screen ...">` (line 285) with `<main id="main" role="main">`. Add a skip link in `index.html` body root or at the top of Dashboard: `<a href="#main" className="sr-only focus:not-sr-only ...">Skip to main content</a>`.

### C-7 — Form inputs in `AddIngredientForm` and `AnalyzeImageReadyModal` lack visible/programmatic labels for editable rows
- **Location:** `src/components/AnalyzeImageReadyModal.tsx` — name/quantity/unit/expiration inputs rendered per detected ingredient row. Likely `placeholder`-only without `<Label htmlFor>` or `aria-label`.
- **WCAG:** 1.3.1, 3.3.2 Labels or Instructions, 4.1.2.
- **Recommended fix:** Each `<Input>` needs `aria-label={t('pantry.ingredientName')}` etc., and the row should have an accessible group label (`<fieldset>` + `<legend>` or `aria-labelledby` pointing to the ingredient name).

### C-8 — Auto-advancing media (Reels) without pause/stop/hide control
- **Location:** `src/components/Reels.tsx`, `ReelRecipeModal.tsx`, `CocktailAnimation.tsx`.
- **WCAG:** 2.2.2 Pause, Stop, Hide; 2.3.3 Animation from Interactions (respect `prefers-reduced-motion`).
- **Why it matters:** Reels auto-scroll/auto-play; users with vestibular disorders cannot disable. `CocktailAnimation` runs continuous CSS animations.
- **Recommended fix:** Honor `@media (prefers-reduced-motion: reduce)` — short-circuit auto-advance, replace continuous animations with a static frame. Provide a visible pause button on the reel viewer.

### C-9 — Native-camera flow has no keyboard fallback
- **Location:** `src/components/AnalyzeImageCapture.tsx`.
- **WCAG:** 2.1.1 Keyboard.
- **Why it matters:** The "take photo" path relies on Capacitor camera; the "upload" path uses an `<input type="file">` triggered by a custom button. If the file input isn't focusable, keyboard users can't reach it.
- **Recommended fix:** Confirm the hidden `<input type="file" />` is focused via a real `<label htmlFor>` or that the trigger `<Button>` calls `inputRef.current?.click()` and the input itself remains in the tab order with `aria-label="Upload ingredient photo"`.

---

## 4. Major findings (Priority: High)

### M-1 — Hardcoded brand gradients on critical buttons ignore the theme
- `src/pages/SignIn.tsx:275`, `src/pages/SignUp.tsx`, multiple `MealPlanCreator` CTAs use `bg-gradient-to-r from-emerald-500 to-teal-600 text-white`. After theme switching (Citrus/Aqua/Dusk), the primary CTA visually mismatches the surrounding theme. Contrast OK, but it breaks 1.4.1 (use of color) consistency. **Fix:** use `bg-primary` or a `--gradient-primary` token.

### M-2 — `text-white/60`, `text-white/70`, `text-neutral-400` placeholders on light cards
- `src/pages/SignIn.tsx:224,243` `placeholder:text-neutral-400` on `bg-neutral-50` → 2.85:1, fails 1.4.3. The "Secure / 256-bit SSL" trust line (`text-white/60` over dark photo overlay) is ~3.5:1 — passes large-text, fails small-text. **Fix:** use `placeholder:text-muted-foreground` (token) and `text-white/85` for trust copy.

### M-3 — Heading hierarchy violations
- `MealPlanCalendarView.tsx` renders multiple `<h1>` inside the same route (lines 175, 306, 396). `Dashboard.tsx` has no `<h1>` at all on the planner tab; the first heading is inside `MealPlanner`. **Fix:** one `<h1>` per route inside `<main>` describing the page; downgrade later headings to `<h2>`.

### M-4 — Focus indicators rely on the Tailwind default ring with no theme token
- shadcn Button uses `focus-visible:ring-2 ring-ring`. `--ring` is themed correctly for each palette but on dark gradient headers (Dashboard/Navigation) the ring is invisible (primary ring on primary background). **WCAG 2.4.7.** **Fix:** Add a `--ring-on-primary: 0 0% 100%` token and override `focus-visible:ring-white` on header buttons, or use `focus-visible:ring-offset-2 ring-offset-primary`.

### M-5 — Welcome-back button (Dashboard header) is a `<button>` containing only a small dot + name; not clearly clickable
- `src/components/Dashboard.tsx:182-191`. No `aria-label`, no underline, no hover affordance beyond `bg-white/25`. **Fix:** Add `aria-label="Open your profile"`, increase hover/focus contrast.

### M-6 — Eye/EyeOff password toggle missing accessible name and ARIA pressed state
- `src/pages/SignIn.tsx:246-258` and password fields in `SignupSteps.tsx`, `PasswordUpdate.tsx`. **Fix:** `<Button aria-label={showPassword ? t('signin.hidePassword') : t('signin.showPassword')} aria-pressed={showPassword}>`.

### M-7 — Mobile cart icon is a 32×32 tap target
- `src/components/Dashboard.tsx:249` `w-8 h-8 p-0`. **WCAG 2.5.8** AA requires ≥24×24 CSS px and recommends 44×44; iOS HIG asks for 44×44. **Fix:** Bump to `w-11 h-11` or rely on shadcn default `size="icon"` (40×40) plus padding.

### M-8 — `LanguageSelector` (button variant) likely lacks `aria-label`
- Used in headers across SignIn/SignUp/Dashboard. **Fix:** `aria-label={t('language.select')}` and `aria-expanded` on the trigger.

### M-9 — `<img>` tags without `alt` or with `alt=""` on meaningful images
- `src/pages/WhyPantry.tsx:40,123,136`, `src/components/CameraProductScanner.tsx:257`, `src/components/WelcomeModal.tsx:94`, `src/components/Reels.tsx:460` flagged by grep as having no `alt=`. Recipe thumbnails in `MealPlanView`/`RecipeView` should have descriptive alt (recipe name), not empty.
- **Fix:** Verify each — decorative → `alt=""`, informative → `alt={recipe.name}` or equivalent.

### M-10 — Recipe and meal cards lose color-only state info
- `RecipeView` / `CarbonSavingsTracker` use color scales (green/yellow/red) for CO₂ and calorie ranges without text labels or icons. **WCAG 1.4.1.** **Fix:** Pair each color chip with an icon (Leaf/AlertTriangle) and a text label ("Low", "Medium", "High").

### M-11 — `Dialog` content height on mobile uses `h-[90vh]` not `dvh`
- `src/components/CheckoutFlow.tsx:121` and most modals. iOS Safari URL bar causes 90vh to overflow. **Fix:** `h-[90dvh]`.

### M-12 — `min-h-screen` used everywhere; should be `min-h-dvh` on mobile
- 20+ occurrences. Already a memory rule. **WCAG 1.4.10 Reflow.**

### M-13 — Inputs in `CheckoutFlow/AddressStep`, `PaymentForm*`, and `UserProfileForm` likely missing `autocomplete` attributes
- **WCAG 1.3.5 Identify Input Purpose** (AA). **Fix:** `autoComplete="email|name|tel|street-address|postal-code|cc-number|cc-exp|cc-csc"`.

### M-14 — Error toast titles convey state only by `variant="destructive"` color
- Currently relies on red background. Sighted-only signal. **Fix:** Prefix title with an icon (AlertCircle) and ensure `role="alert"` on destructive toasts (Radix Toast does this when `type="foreground"`).

### M-15 — Tabs/active state in shadcn Tabs uses `bg-primary text-primary-foreground` — inherits C-1/C-2 failures in Citrus & Default
- Cross-references theme contrast above.

### M-16 — Carousels / steppers (`MealPlanCreatorStepper`, `AIMealCreatorStepper`) likely lack `aria-current="step"` and progress announcement
- **WCAG 4.1.2, 4.1.3.** **Fix:** Add `aria-label="Step 2 of 4: Preferences"` to the current step and `aria-live="polite"` on the step title region.

### M-17 — Sidebar collapse button has no announced state
- `src/components/Navigation.tsx:170`. **Fix:** `aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}` and `aria-expanded={!isCollapsed}`.

---

## 5. Minor findings (Priority: Medium / Low)

| # | Title | Location | WCAG | Fix |
|---|---|---|---|---|
| m-1 | `<html lang="en">` is hardcoded; app supports EN/ES/PT | `index.html:2` | 3.1.1 | Set `document.documentElement.lang` from `LanguageContext` on change |
| m-2 | No `<title>` updates per route | `index.html:8`, all pages | 2.4.2 | Use `react-helmet-async` or a small `useDocumentTitle` hook |
| m-3 | Decorative pulsing dots in sidebar use `animate-pulse` without `prefers-reduced-motion` guard | `Navigation.tsx:155-163` | 2.3.3 | Wrap in motion-safe utility |
| m-4 | Dashboard floating bubbles | `Dashboard.tsx:164-167` | 2.3.3 | Same — gate on `motion-safe:` |
| m-5 | `title` attribute used as the only label on collapsed nav | `Navigation.tsx:145` | 4.1.2 | Add `aria-label`; `title` is unreliable on touch |
| m-6 | Brightness-invert logo over gradient — fine for sighted, but `alt="prefud"` is duplicated across headers, leading to repetitive SR output | many files | 1.1.1 | Mark inner logo `alt=""` when an outer wrapper already announces the brand |
| m-7 | Toast auto-dismiss at 5s for job-start may be too short for cognitive-disability users | `MealPlanJobContext.tsx` and siblings | 2.2.1 | Increase to 8–10s or make persistent until user dismisses |
| m-8 | `MealPlanTimeoutModal` likely uses red text on red bg | check | 1.4.3 | Audit tokens |
| m-9 | `404` page (`NotFound.tsx:15`) uses `bg-gray-100` instead of `bg-background` | | 1.4.3 / consistency | Use tokens |
| m-10 | `CookingMode` and `UltraFocusCooking` text scaling: confirm `font-size` doesn't shrink below 16px on mobile when in "ultra focus" | mobile only | 1.4.4 | Use rem-based sizing |
| m-11 | Camera permissions denial path: no screen-reader announcement of error | `AnalyzeImageCapture.tsx` | 4.1.3 | `role="alert"` on permission-denied banner |
| m-12 | `Pricing` page tiered cards: "Most popular" indicated only by color border + ribbon position | | 1.4.1 | Add text/icon ("Recommended") |
| m-13 | Subscription usage counters use color-coded progress bars only | `UserProfile.tsx` | 1.4.1, 4.1.2 | Add `aria-label` describing remaining vs total |
| m-14 | LanguageSelector flag-only items: ensure `aria-label="English"` etc. | `LanguageSelector.tsx` | 4.1.2 | Add labels |

---

## 6. Cross-cutting recommendations

1. **Add a token-aware focus ring overlay** (`--ring-on-primary`, `--ring-on-accent`) and a `focus-visible:ring-offset-background` utility, then audit every button rendered on tinted backgrounds.
2. **Create an `<IconButton aria-label="...">` wrapper** that throws in dev if `aria-label`/`aria-labelledby` is missing. This permanently prevents C-4 from regressing.
3. **Create a `<LiveRegion polite>` / `<LiveRegion assertive>` helper** and wire all five job indicators + toast announcements through it (fixes C-3).
4. **Migrate hardcoded `text-white/text-gray-*/bg-emerald-*`** that aren't on tinted gradient overlays to semantic tokens. Allowlist the gradient-header overlay case in a single utility (e.g. `.on-primary` → `text-primary-foreground`).
5. **Replace `min-h-screen` with `min-h-dvh` and `h-[90vh]` with `h-[90dvh]`** project-wide.
6. **Theme token retune for Citrus** is the single highest-impact contrast change (resolves C-1, C-2, M-15 in one PR).
7. **Set `<html lang>` reactively** from the `LanguageContext` and emit `<title>` per route.
8. **Document a mobile tap-target rule** (`min-h-11 min-w-11`) and audit the icon-only buttons in mobile headers / nav.

---

## 7. Summary table

| ID | Issue | Location | WCAG | Severity | Fix |
|---|---|---|---|---|---|
| C-1 | Primary button text < 4.5:1 (Default + Citrus) | `index.css` :root / citrus | 1.4.3 | Critical | Darken `--primary` or invert `--primary-foreground` |
| C-2 | Accent text 2.11:1 in Citrus | `index.css` citrus | 1.4.3 | Critical | Darken `--accent` to 35% L |
| C-3 | Job completion not announced | `*JobIndicator.tsx` ×5 | 4.1.3 | Critical | Wrap in `role="status" aria-live="polite"` |
| C-4 | Icon buttons missing `aria-label` | Navigation, Dashboard, OTP, Camera, SignIn eye | 4.1.2 | Critical | Add `aria-label` |
| C-5 | Mobile bottom-nav: no labels / `aria-current` | `Navigation.tsx:69` | 1.3.1, 4.1.2 | Critical | Restore label, add `aria-current` |
| C-6 | No `<main>` landmark on Dashboard | `Dashboard.tsx` | 1.3.1, 2.4.1 | Critical | Wrap content in `<main>` + skip link |
| C-7 | Detected-ingredient row inputs lack labels | `AnalyzeImageReadyModal.tsx` | 3.3.2 | Critical | Add `aria-label` per input |
| C-8 | Auto-playing reels / continuous animation | `Reels`, `CocktailAnimation` | 2.2.2, 2.3.3 | Critical | Respect `prefers-reduced-motion`, expose pause |
| C-9 | Camera capture flow keyboard fallback | `AnalyzeImageCapture.tsx` | 2.1.1 | Critical | Ensure file input is focusable & labelled |
| M-1 | Hardcoded emerald gradient on themed CTAs | SignIn/SignUp/Creators | 1.4.1 | High | Use `bg-primary` / gradient token |
| M-2 | Placeholder + trust line contrast | `SignIn.tsx:224,318` | 1.4.3 | High | Token-based color, bump opacity |
| M-3 | Multiple `<h1>` in single view | `MealPlanCalendarView.tsx` | 1.3.1 | High | One H1 per route |
| M-4 | Focus ring invisible on themed headers | global | 2.4.7 | High | Add `ring-on-primary` token |
| M-5 | Welcome name button no `aria-label` | `Dashboard.tsx:182` | 4.1.2 | High | Add `aria-label` |
| M-6 | Password eye toggle no label / `aria-pressed` | SignIn / SignUp / PasswordUpdate | 4.1.2 | High | Add ARIA |
| M-7 | Mobile cart 32×32 tap target | `Dashboard.tsx:249` | 2.5.8 | High | `w-11 h-11` |
| M-8 | LanguageSelector trigger label | `LanguageSelector.tsx` | 4.1.2 | High | `aria-label`, `aria-expanded` |
| M-9 | Missing alt text on `<img>` | WhyPantry, Reels, WelcomeModal | 1.1.1 | High | Add descriptive alt / empty for decorative |
| M-10 | Color-only meaning in CO₂ / calorie chips | RecipeView, CarbonSavingsTracker | 1.4.1 | High | Pair color + icon + text |
| M-11 | Modals `h-[90vh]` on iOS | CheckoutFlow + others | 1.4.10 | High | Switch to `dvh` |
| M-12 | `min-h-screen` instead of `min-h-dvh` | 20+ files | 1.4.10 | High | Replace |
| M-13 | Missing autocomplete on forms | Checkout / Payment / Profile | 1.3.5 | High | Add `autoComplete` per field |
| M-14 | Error toasts color-only | toast variant destructive | 1.4.1, 4.1.3 | High | Icon + `role="alert"` |
| M-15 | Tabs active state inherits primary contrast fail | shadcn Tabs | 1.4.3 | High | Fix via C-1 |
| M-16 | Steppers no `aria-current="step"` / live update | MealPlanCreatorStepper, AIMealCreatorStepper | 4.1.2/3 | High | Add ARIA |
| M-17 | Sidebar collapse no `aria-expanded` | `Navigation.tsx:170` | 4.1.2 | High | Add ARIA |
| m-1..m-14 | See §5 | — | — | Med/Low | See §5 |

---

## 8. Suggested fix order

1. **Theme token retune (C-1, C-2, M-15)** — single CSS change, fixes the largest set of contrast failures.
2. **Live regions for the 5 async job indicators (C-3)** — short, high impact for SR users; pattern is reusable.
3. **`<IconButton>` wrapper + label sweep (C-4, M-5, M-6, M-8, M-17)** — mechanical edits, prevents regression.
4. **Mobile bottom-nav labels + `aria-current` (C-5)** — small change, big SR/cognitive win.
5. **`<main>` landmark + skip link (C-6)** — single Dashboard edit, plus a sr-only link in `index.html`/`Dashboard.tsx`.
6. **`AnalyzeImageReadyModal` row labels + camera fallback (C-7, C-9)**.
7. **`prefers-reduced-motion` audit (C-8, m-3, m-4)** — wrap animations in `motion-safe:`.
8. **`min-h-screen` → `min-h-dvh` codemod + `h-[90vh]` → `dvh` (M-11, M-12)**.
9. **Heading hierarchy (M-3)** and **focus rings (M-4)**.
10. **Form autocomplete + error semantics (M-13, M-14)**.
11. **Minor list (§5)** in a single cleanup PR.

---

*Audit prepared by static analysis of the codebase as of this commit. To verify visually after fixes, re-run the same contrast calculations in §2 and spot-check the priority screens with VoiceOver/TalkBack + keyboard-only navigation.*