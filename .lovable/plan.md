

# Unify Section Headers Across All Dashboard Tabs

## Problem
Each section has a different header design:
- **Meal Planner**: left-aligned h1 + description, no icon, `bg-black/30 backdrop-blur-sm` wrapper
- **AI Meal Creator**: centered icon (circle gradient) + h1 + description, `bg-black/30 backdrop-blur-sm` wrapper
- **AI Drink Creator**: uses `Card`/`CardHeader`/`CardTitle` with a large circle icon, `bg-black/30` card
- **User Profile**: centered icon (circle gradient) + h1 + description, same as AI Meals
- **Ingredient Tracker**: left-aligned h2 + description, `bg-black/30 backdrop-blur-sm` wrapper

On mobile with black background, some have contrast issues and inconsistent spacing.

## Unified Header Design
All sections will use the same compact header pattern:

- **Layout**: Left-aligned icon + title row, description below
- **Icon**: Small gradient circle (`p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg`)
- **Title**: `text-xl sm:text-2xl font-bold text-white`
- **Description**: `text-sm text-emerald-200/80`
- **Container**: `bg-emerald-900/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-emerald-500/20`
- **Mobile optimization**: tighter padding (`p-3`), smaller text (`text-lg`), single-line where possible

## Files to Modify

1. **`src/components/MealPlanner.tsx`** (lines 312-330) — Add icon, adjust container styling to unified pattern, keep the "Create Plan" button inline
2. **`src/components/AIMealCreator.tsx`** (lines 244-256) — Switch from centered to left-aligned, reduce icon size, use unified container
3. **`src/components/AIDrinkCreator.tsx`** (lines 218-238) — Replace `Card`/`CardHeader` with plain div, left-align, use unified container
4. **`src/components/UserProfile.tsx`** (lines 292-304) — Switch from centered to left-aligned, use unified container
5. **`src/components/IngredientTracker.tsx`** (lines 297-303) — Upgrade from h2 to match pattern, add icon, use unified container border

## Mobile-Specific
- On mobile: `p-3`, title `text-lg`, no description text (or single short line), icon `p-1.5` with smaller Lucide icon
- Container uses `bg-emerald-900/40 border border-emerald-500/20` for good contrast on solid black background
- Remove `drop-shadow-lg` (unnecessary on dark bg)

