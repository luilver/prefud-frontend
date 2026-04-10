

# Reorganize Pantry Page with Tab Navigation (Mobile)

## Overview
Add a tab bar below the "My Pantry" header section with two tabs: **Pantry** (ingredients list + Add Ingredient button) and **Expiring Soon** (expiring items, AI insight card, generate meals button). On desktop, keep both visible side-by-side as today.

## Changes — `src/components/IngredientTracker.tsx`

1. **Import** `Tabs, TabsList, TabsTrigger, TabsContent` from `@/components/ui/tabs` and `useIsMobile` from `@/hooks/use-mobile`
2. **Remove** the "Add Ingredient" button from the header section (lines 301-314)
3. **Remove** the stat filter cards row (lines 323-353) and the filter indicator (lines 355-370) — the tab navigation replaces this filtering
4. **Restructure the main content area** (lines 372-484):
   - Wrap in a mobile-conditional layout: if `isMobile`, render `<Tabs>` with two tabs; otherwise render the existing side-by-side grid
   - **"Pantry" tab**: Contains the search bar, "Add Ingredient" button (moved here), and the categorized ingredient accordion list
   - **"Expiring Soon" tab**: Contains the `<AIMealSuggestions>` component (moved from line 318-321), the expiring ingredients card with CO2 badge, and the expiring ingredient cards

5. **Desktop layout** remains unchanged — both sections visible in the existing grid

## Tab Design
- Tab bar uses the existing `Tabs` component with emerald styling: `bg-black/30 backdrop-blur-sm` list, active tab `bg-emerald-500 text-white`
- Pantry tab icon: `Package` + count badge
- Expiring tab icon: `AlertTriangle` + count badge (orange if items expiring)

## Translation Keys to Add (`en.ts`, `es.ts`, `pt.ts`)
- `ingredientTracker.pantryTab` — "Pantry" / "Despensa" / "Despensa"
- `ingredientTracker.expiringTab` — "Expiring Soon" / "Por Vencer" / "A Vencer"

