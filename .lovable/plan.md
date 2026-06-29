## Goal

Make the Planner, Plan Details, AI Meals, AI Drinks, Pantry, and Profile screens follow the active theme (Default / Citrus / Aqua / Dusk) on both desktop and mobile. Today these screens render with hardcoded `emerald` and `teal` Tailwind classes, so they stay green even after switching theme.

## Approach

Replace hardcoded color utilities with the semantic design tokens already defined in `index.css` and overridden per theme in `[data-theme="..."]`:

- Solid backgrounds / buttons / icons → `bg-primary`, `text-primary`, `text-primary-foreground`, `bg-accent`, `text-accent`, `border-primary`, `ring-primary`
- Gradients (headers, CTAs, tab actives) → `bg-gradient-to-r from-primary to-accent`
- Soft/tinted surfaces (cards, chips, hover) → `bg-primary/10`, `bg-accent/10`, `border-primary/20`, `text-primary` (token-driven, opacity-tinted)
- Dark hero panels (e.g. Profile / Pantry top banner) → `from-primary/80 via-primary/70 to-accent/80` over the dark backdrop instead of `from-emerald-900/80 ...`
- Status colors that are semantically non-brand stay as-is: `destructive` red for errors, `orange/red` for "expiring soon", green check for "fresh" status.

## Files to update

Sweep these components and replace every `emerald-*` / `teal-*` brand color with the semantic tokens above. Keep typography, spacing, sizes, and structure exactly as they are.

1. **Planner**
   - `src/components/MealPlanner.tsx`
   - `src/components/MealPlanCreator.tsx`
   - `src/components/MealPlanCreatorStepper.tsx`
   - `src/components/MealPlanCalendarView.tsx`
2. **Plan details**
   - `src/components/MealPlanView.tsx`
   - `src/components/MealPlanReadyModal.tsx`
3. **AI Meals**
   - `src/components/AIMealCreator.tsx`
   - `src/components/AIMealCreatorStepper.tsx`
   - `src/components/AIMealSuggestions.tsx`
   - `src/components/AIMealGeneration.tsx`
   - `src/components/AIMealReadyModal.tsx`
   - `src/components/AIMealJobIndicator.tsx`
4. **AI Drinks**
   - `src/components/AIDrinkCreator.tsx`
   - `src/components/AIDrinkCreatorStepper.tsx`
   - `src/components/AIDrinkGoals.tsx`
   - `src/components/DrinkReadyModal.tsx`
   - `src/components/DrinkJobIndicator.tsx`
5. **Pantry**
   - `src/components/IngredientTracker.tsx`
   - `src/components/AddIngredientForm.tsx`
   - `src/components/AnalyzeImageCapture.tsx`
   - `src/components/AnalyzeImageReadyModal.tsx`
   - `src/components/AnalyzeImageJobIndicator.tsx`
   - `src/components/PantryMealsJobIndicator.tsx`
   - `src/components/PantryMealsReadyModal.tsx`
6. **Profile**
   - `src/components/UserProfile.tsx` (including the 5 subscription usage cards — replace the per-card `emerald/teal/blue/purple/orange` palette map with `primary`, `accent`, and neutral chips so all cards adapt to the theme; keep the orange "Calories" and emerald "Environment" semantic accents only where they represent meaning, not branding)
7. **Shared job indicator** (used inside these flows)
   - `src/components/MealPlanJobIndicator.tsx`

## Mobile parity

- These pages are the same components on desktop and mobile, so the same token substitutions fix both viewports.
- Audit each file's mobile-only branches (`isMobile && ...`, `sm:` toggles, sticky bottom CTA bars) to ensure they also use `bg-primary` / gradient-to-accent, not `emerald`.

## Out of scope

- `Landing.tsx`, `SignIn.tsx`, `SignUp.tsx`, pricing cards, marketing pages — not in the user's list.
- Logic, data, endpoints, translations — untouched.
- Semantic non-brand colors (destructive red, expiring-soon orange, fresh green check, info blue) — kept as-is.

## Verification

- Build passes.
- Manually switch each theme in Settings, reload, and confirm Planner, Plan details, Meals, Drinks, Pantry, and Profile recolor primary surfaces, buttons, active tabs, gradients, and chips. Check the mobile viewport for the same screens.
