## Goal
Let the user edit detected ingredients (name + quantity, plus unit) in the "Ingredients Detected" modal before adding them to the pantry.

## Scope
Single file change: `src/components/AnalyzeImageReadyModal.tsx`. No backend, socket, or service changes — the modal already receives the normalized list and calls `addIngredientsToPantry` on confirm.

## Changes

### `src/components/AnalyzeImageReadyModal.tsx`
1. Replace the read-only `readyIngredients` rendering with a local editable state:
   - On mount / when `readyIngredients` changes, copy the array into local state `items: PantryIngredient[]` (alongside the existing `selected` set).
2. For each row, render editable inputs instead of static text:
   - `Input` for `name` (text)
   - `Input` for `quantity` (number, min 0, step 0.1)
   - `Input` (or compact `Select`) for `unit` (free text, short width)
   - Keep `category` and expiry shown as read-only metadata (out of scope to edit).
   - Keep the `Checkbox` for include/exclude.
3. Add an `updateItem(id, patch)` helper that updates the local `items` array immutably.
4. On "Add Selected to Pantry":
   - Filter `items` by `selected`.
   - Validate: non-empty `name`, `quantity > 0`. If invalid, show a destructive toast and abort.
   - Pass the edited objects to `addIngredientsToPantry` (same call signature as today).
5. Preserve current UX: emerald gradient button, cancel, selected counter, scroll container, loading state, dismiss-on-success.

## Out of scope
- Editing category, expiry date, notes, carbon footprint.
- Adding new rows manually (user already has the standard "Add Ingredient" form for that).
- Any change to the socket flow, normalization, or services.

## Technical notes
- Inputs use existing `@/components/ui/input` to stay on the design system; min font-size already 16px per project rules to avoid iOS zoom.
- Keep strings behind `t(...)` with English fallbacks consistent with current file; add fallback labels only (no new translation keys required for plan approval — can be added inline).
