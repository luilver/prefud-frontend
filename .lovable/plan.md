

# Fix Pantry Mobile Tab Issues

## Changes to `src/components/IngredientTracker.tsx`

### 1. Accordions closed by default in Pantry tab
Line 386: Change `defaultValue={Object.keys(categorizedIngredients)}` to `defaultValue={[]}` so all category dropdowns start collapsed.

### 2. Remove duplicate generate button in Expiring Soon tab
The `AIMealSuggestions` component (line 433-436) already contains both an AI Insight card (clickable, opens servings modal) AND a separate "Generate Meals" button. Remove the standalone button inside `AIMealSuggestions` and keep only the AI Insight card with a helper text explaining the feature.

In `src/components/AIMealSuggestions.tsx`, lines 276-351: Remove the `CardHeader` section that contains the duplicate title, description, and generate button. Keep only the AI Insight card (the clickable gradient banner) as the single entry point. Update the insight card text to better explain it generates meals from expiring ingredients.

### 3. Categorize expiring ingredients with accordion dropdowns
Lines 469-473: Instead of a flat list of `expiringIngredients`, group them by category (same logic as pantry tab) and render inside an `Accordion` with category headers, icons, and count badges. All categories closed by default.

Add a `categorizedExpiringIngredients` memo:
```tsx
const categorizedExpiringIngredients = expiringIngredients.reduce((acc, ing) => {
  if (!acc[ing.category]) acc[ing.category] = [];
  acc[ing.category].push(ing);
  return acc;
}, {} as Record<string, any[]>);
```

Replace the flat list with an Accordion identical in style to the pantry tab but with orange/red theming.

## Files modified
- `src/components/IngredientTracker.tsx` — accordion default closed, categorized expiring items
- `src/components/AIMealSuggestions.tsx` — remove duplicate button, keep only the insight card with helper text

