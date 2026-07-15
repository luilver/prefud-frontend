## Goal
The drink detail screen shown after a healthy drink is generated (`AIDrinkView.tsx`, opened via the `open-drink` event) currently only offers "Add to Cart" for selected ingredients. Add a matching "Add to Pantry" action so users can send selected drink ingredients straight to the pantry, mirroring what already exists for meals and in `DrinkShoppingModal`.

## Scope
Frontend only. One file: `src/components/AIDrinkView.tsx`.

## Changes

1. In the Ingredients Selector tab (around the existing "Add to Cart" button, line ~372), render an "Add to Pantry" button next to it (stacked on mobile, side-by-side on desktop). Both buttons are disabled when `selectedIngredients.length === 0`.

2. Add an `addSelectedToPantry` handler that:
   - Uses `drink.apiData?.ingredientsList` when available (this is where the backend classification lives — `classification`, `daysToExpire`, `carbonFootPrintToWaste`) and falls back to `drink.ingredients` otherwise.
   - Builds pantry items with the correct fields, using `classification` as `category` (fix consistent with the earlier pantry-category fix). Fallback chain: `ingredient.classification || ingredient.category || "drink-ingredient"`.
   - Syncs to the backend via `updatePantry(user.id, [...existing, ...new])` (same pattern used in `DrinkShoppingModal.addSelectedToPantry`).
   - Updates local `pantryItems` state via `setPantryItems` with `Date` objects.
   - Shows a success toast using existing i18n keys (`drinkShoppingModal.addedToPantryTitle`, etc.).
   - Clears `selectedIngredients` on success.

3. Wire the required imports/hooks:
   - `useUser` (for `pantryItems`, `setPantryItems`, `user`)
   - `updatePantry` and `Ingredient` from `@/services/pantryService`
   - Reuse the existing `useToast` (already used indirectly via `useAddToCart`; import `useToast` directly here)
   - `Package` icon (already imported).

4. Styling uses semantic tokens (`bg-primary`, `variant="outline"`) to respect current theming — no hardcoded colors.

## Out of scope
- No changes to `DrinkDetailView.tsx` (already has pantry support via `DrinkShoppingModal`).
- No changes to backend, translations, or cart logic.
- No changes to the "Add to Cart" button behavior.

## Technical notes
- The pantry payload shape and `updatePantry` call mirror `DrinkShoppingModal.tsx` exactly, so category ("classification") flows through to `/add-ingredients` correctly — same fix applied recently for meal shopping list and meal plan view.
