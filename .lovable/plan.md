## Problem

In `src/components/IngredientTracker.tsx`, the pantry groups items by `category`, but every ingredient ends up under a single "Pantry" accordion. The cause is `mapApiCategoryToUI` (lines 56–67): it only recognizes a few English keys (`dairy`, `protein`, `vegetable`, `fruit`, `grain`, `herb`, `other`) and returns `"Pantry"` for anything else. Since the backend stores `classification` in Spanish (e.g. `grano`, `fruta`, `verdura`, `carne`, `lácteo`, `hierba`, `ingrediente`), almost every ingredient falls through to the default and gets collapsed into one group.

## Fix

Update `mapApiCategoryToUI` in `src/components/IngredientTracker.tsx` so it groups ingredients by their real classification:

1. Expand the map to cover Spanish and Portuguese classification values used by the pantry API, in addition to the current English ones:
   - Dairy: `dairy`, `lacteo`, `lácteo`, `lacteos`, `laticinio`, `laticínio`
   - Meat / Protein: `protein`, `meat`, `carne`, `proteina`, `proteína`, `pescado`, `fish`, `seafood`, `marisco`, `peixe`
   - Vegetables: `vegetable`, `vegetables`, `verdura`, `verduras`, `vegetal`, `legume`, `hortaliça`
   - Fruits: `fruit`, `fruits`, `fruta`, `frutas`
   - Grains: `grain`, `grains`, `grano`, `granos`, `cereal`, `cereais`, `grão`
   - Legumes: `legume` (EN sense), `legumbre`, `legumbres`, `leguminosa`
   - Herbs & Spices: `herb`, `spice`, `hierba`, `especia`, `especias`, `erva`, `condimento`
   - Oils & Fats: `oil`, `fat`, `aceite`, `grasa`, `óleo`, `gordura`
   - Bakery: `bakery`, `bread`, `pan`, `pão`, `panaderia`, `panadería`
   - Beverages: `beverage`, `drink`, `bebida`, `bebidas`
   - Condiments / Sauces: `sauce`, `condiment`, `salsa`, `condimento`, `molho`
   - Pantry / Other fallbacks: `pantry`, `other`, `ingredient`, `ingrediente`, `otros`, `outro`, `outros`
2. When a classification isn't in the map, stop defaulting to `"Pantry"`. Title-case the incoming classification string and use it as the group name (e.g. `"embutido"` → `"Embutido"`), so any new/unknown category still gets its own accordion group instead of being merged.
3. Guard against empty/undefined classification: if both `classification` and `category` are missing, keep the current `"Pantry"` fallback.

No other files need to change — `categorizedIngredients` already groups by `category`, and the accordion sections in the mobile and desktop pantry views (lines ~400 and ~656) will automatically render one accordion per resulting group.

## Out of scope

- Translating group names via `LanguageContext` (current UI already uses fixed English labels for these categories).
- Changing how ingredients are added to the pantry (already fixed in prior turns).
- Icon mapping for new categories — `getCategoryIcon` already falls back to `📦` for unknown labels.