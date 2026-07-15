## Problem
In `src/components/AIDrinkView.tsx`, the recently added "Add to Pantry" button calls `updatePantry(userId, ingredients)` which hits `PUT /meal-plan/pantry/:userId` and **replaces the entire pantry** — wiping out all existing items. It should call the additive `/add-ingredients` endpoint, like `MealShoppingModal.tsx` does.

Additionally, the i18n key `drinkShoppingModal.addToCart` (and related pantry keys the new button uses) are missing and need to be added in `LanguageContext.tsx` for EN / ES / PT.

## Fix

### 1. `src/components/AIDrinkView.tsx` — use the additive endpoint
- Swap the `updatePantry` import for `addIngredientsToPantry` and `PantryIngredient` from `@/services/pantryService`.
- Rewrite `addSelectedToPantry` to mirror `MealShoppingModal.addSelectedToPantry`:
  - Build `PantryIngredient[]` with the exact shape the backend expects:
    ```
    { id, name, quantity, unit, category, purchased: true,
      purchaseDate (ISO), carbonFootPrintToWaste,
      daysToExpire, expiryDate (ISO), notes }
    ```
  - `category` = `ingredient.classification || ingredient.category || "drink-ingredient"`.
  - Call `await addIngredientsToPantry(user.id, newPantryItems)` — NOT `updatePantry`.
  - Do NOT spread existing pantry into the payload; this endpoint is additive.
  - Merge results into local `pantryItems` state with `Date` objects for `purchaseDate` / `expiryDate` (same pattern as `MealShoppingModal`).
- Keep the success toast + clear-selection behavior; wrap the network call in try/catch and show an error toast on failure.

### 2. Missing translations — add in `src/contexts/LanguageContext.tsx`
Audit the i18n keys used by the new pantry button and its toasts in `AIDrinkView.tsx`. For each key missing from `LanguageContext.tsx`, add entries in EN / ES / PT using flat dot-notation, at minimum:

- `drinkShoppingModal.addToCart` — "Add to Cart" / "Añadir al carrito" / "Adicionar ao carrinho"
- `drinkShoppingModal.addToPantry` — "Add to Pantry" / "Añadir a la despensa" / "Adicionar à despensa"
- `drinkShoppingModal.addedToPantryTitle` — "Added to Pantry!" / "¡Añadido a la despensa!" / "Adicionado à despensa!"
- `drinkShoppingModal.addedToPantryDescription` — matching the format the component reads (static or with count), consistent with sibling modals.

No changes to `src/translations/*.ts`.

## Out of scope
- No changes to `DrinkShoppingModal.tsx`, `MealShoppingModal.tsx`, or `pantryService.ts`.
- No changes to the "Add to Cart" behavior or backend.

## Why this is correct
`addIngredientsToPantry` performs `PATCH /meal-plan/pantry/:userId/add-ingredients` with an array body — the exact endpoint/payload the user showed. `updatePantry` performs a full `PUT` replace, which is what wiped the pantry.
