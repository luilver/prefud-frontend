
# Accessibility Audit Plan (Audit-Only)

Goal: produce `ACCESSIBILITY_AUDIT.md` at the repo root with a complete WCAG 2.2 AA findings report. **No code changes in this pass.** You decide what to fix next from the backlog.

## Scope

Every page, primary component, modal, and form in the app — not a sampled subset. The four priority lenses guide *severity weighting*, not coverage:

1. Color contrast across all themes (Default, Citrus, Aqua, Dusk) + dark mode
2. Keyboard & focus (tab order, focus-visible, modal trapping, skip link)
3. Screen reader labels (icon buttons, form labels, landmarks, live regions for async jobs)
4. Mobile / native UX (44×44 tap targets, safe areas, iOS zoom, `prefers-reduced-motion`)

## Surfaces audited

- **Auth**: `SignIn`, `SignUp` (`SignupSteps`, OTP, password recovery/update), `DeleteAccountModal`
- **Marketing**: `Index`, `Landing`, `WhyPantry`, `Pricing`, `TermsAndConditions`, `PrivacyPolicy`, `NotFound`
- **Shell**: `Navigation` (desktop sidebar + mobile bottom nav), `Dashboard` headers, `WelcomeModal`, `LanguageSelector`, `ui/Header`
- **Planner**: `MealPlanner`, `MealPlanCreator(Stepper)`, `MealPlanView`, `MealPlanCalendarView`, `MealPlanSuccessModal`, `MealPlanTimeoutModal`, `MealShoppingModal`
- **Meals**: `AIMealCreator(Stepper)`, `AIMealIngredients/Preferences/Generation/Suggestions/View`, `RecipeView`, `ReelRecipeModal`, `CookingMode`, `UltraFocusCooking`, `Reels`
- **Drinks**: `AIDrinkCreator(Stepper)`, `AIDrink*` family, `DrinkDetailView`, `DrinkShoppingModal`, `CocktailAnimation`
- **Pantry**: `IngredientTracker`, `AddIngredientForm`, `AnalyzeImageCapture`, `CameraProductScanner`, `ShoppingList`
- **Profile / Subscription**: `UserProfile` (incl. Settings/theme picker), `UserProfileForm`, `BillingManagement`, `SubscriptionManager`, `SubscriptionPurchase`, `SubscriptionUpgradeModal`, `SubscriptionCancelModal`, `SubscriptionSuccessModal`, `FreeSubscriptionConfirmModal`, `PaymentForm`/`PaymentForm2`, `PaymentMethodModal`
- **Cart / Checkout**: `Cart`, `CheckoutFlow` + every step, `AddToCartButton`, `OrderOnlineModal`
- **Tracking & misc**: `CalorieTracker`, `CarbonSavingsTracker`, `Environment`, `Highlights`, `Favorites`, `PageSizeSelector`
- **Async job UX**: 5 job indicators + 5 ready modals (MealPlan, Drink, AIMeal, PantryMeals, AnalyzeImage) — checked specifically for live-region announcements
- **Global**: `index.css` tokens for all 5 theme variants, `index.html` `lang`, viewport, `<main>` landmark count

## Method

Static code analysis only (audit-only — no Playwright runs, no edits):

- **Contrast**: compute WCAG ratios for each `--foreground/--background`, `--primary/--primary-foreground`, `--accent/--accent-foreground`, `--muted-foreground/--background`, destructive, sidebar tokens — across `:root`, `[data-theme="citrus"]`, `[data-theme="aqua"]`, `[data-theme="dusk"]`, `.dark`. Flag every pair below 4.5:1 (text) / 3:1 (large text, UI components, focus rings). Also flag hard-coded `text-white`, `text-gray-*`, `bg-emerald-*`, `bg-white/15` overlays where they bypass tokens.
- **Keyboard / focus**: grep for `onClick` on `div`/`span` without `role`+`onKeyDown`, missing `focus-visible` styles, `tabIndex` > 0, `autoFocus` outside dialogs, custom dropdowns/menus that don't use Radix/shadcn primitives, missing skip link, `aria-hidden` wrapping focusables.
- **Screen reader**: every `<Button size="icon">` / bare `<button>` with only an icon child must have `aria-label`; every `<Input>` needs an associated `<Label htmlFor>` or `aria-label`; check `<main>` count per route, landmark usage, `aria-live` on job indicators and toast announcements, alt text on `<img>` (logos, recipe images, isotipo).
- **Mobile/native**: tap target ≥ 44×44 (flag `size="icon"` defaults of 36×36 used as primary actions, bottom-nav items), `h-screen` vs `h-dvh`, inputs with `font-size` < 16px, safe-area utilities on fixed bars, `prefers-reduced-motion` respect in `CocktailAnimation`, reels auto-play, loading spinners.
- **Semantic HTML & ARIA**: heading hierarchy per page (single H1, no skipped levels), correct landmarks, redundant/invalid ARIA.
- **Forms**: required indicators, error association via `aria-describedby`, error announcements, autocomplete attributes on auth/payment forms.
- **Motion/error prevention**: destructive actions (delete account, cancel subscription, remove cart item) confirmed; flashing/auto-advancing carousels.

## Report structure (`ACCESSIBILITY_AUDIT.md`)

1. Executive summary + per-surface scores (0–100) for Accessibility, Contrast, Keyboard, Screen Reader, Mobile, WCAG compliance.
2. Theme contrast matrix — one table per theme listing every token pair, computed ratio, AA pass/fail.
3. Findings grouped by severity: **Critical → Major → Minor**. Each finding includes:
   - Title, location (`file.tsx:line` where identifiable), affected component
   - WCAG 2.2 criterion (e.g., 1.4.3, 2.1.1, 2.4.7, 4.1.2)
   - Severity + priority (Critical/High/Medium/Low)
   - Why it matters (which users break)
   - Recommended fix (code-level guidance, not applied)
4. Cross-cutting recommendations (focus-ring token, icon-button wrapper enforcing `aria-label`, live-region helper for job indicators, theme-token cleanup of hardcoded Tailwind colors).
5. Summary table: Issue | Location | WCAG | Severity | Fix.
6. Suggested fix order (what I'd tackle first if you approve a follow-up build pass).

## Out of scope (this pass)

- No file edits, no dependency changes, no Playwright/automated tool runs.
- Backend, copy/translations correctness, and SEO are not part of this audit.
- Lighthouse/axe scores are *equivalent checks performed manually from code*; not actual tool runs.

## Deliverable

Single new file: `ACCESSIBILITY_AUDIT.md` at repo root. After you review it, you can ask me to implement fixes in priority order.
