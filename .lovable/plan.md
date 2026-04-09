

# Pantry View Overhaul — AI-Powered Assistant Feel

## Overview
Transform the static pantry inventory into a proactive, AI-driven assistant with smart insights, visual expiration indicators, interactive metric filters, CO2 gamification, and improved typography/layout.

## Changes

### 1. AI Insight Card (replace passive AIMealSuggestions header)
**File: `src/components/AIMealSuggestions.tsx`**
- Before the generate button, add a dynamic "Insight Card" that scans `ingredients` for items expiring in <=3 days
- Display a glassmorphism card with a suggested recipe teaser: *"You have **Shrimp** and **Herbs** expiring soon. How about a Garlic Shrimp Pasta?"*
- Use `Sparkles` + `AlertTriangle` icons, emerald gradient accent bar
- If no expiring items, show a positive message: *"Your pantry is looking fresh! Generate meals anytime."*
- The insight card is clickable and triggers the servings modal directly

### 2. Typography Hierarchy in Ingredient Cards
**File: `src/components/IngredientTracker.tsx` (lines 431-477)**
- Ingredient name: `font-bold text-gray-900` (currently `font-medium text-gray-800`)
- Quantity/unit: `text-xs text-gray-400` (currently `text-sm text-gray-600`)
- Location text stays `text-xs text-gray-500`

### 3. Expiration Progress Bar + Relative Dates
**File: `src/components/IngredientTracker.tsx` (ingredient cards in both expiring section and main list)**
- Add a thin horizontal `Progress`-style bar below each ingredient card content:
  - Green (`bg-emerald-500`) if >7 days
  - Yellow (`bg-amber-400`) if 3-7 days
  - Red (`bg-red-500`) if <3 days (including expired)
- Progress value = percentage of shelf life remaining (use `daysToExpire` from original data as total, current days left as remaining)
- Replace absolute date text with relative format: "Expires in 2 days", "Expires today", "Expired 1 day ago"
- Keep the color-coded text already in place

### 4. Interactive Metric Cards (click-to-filter)
**File: `src/components/IngredientTracker.tsx` (lines 286-308)**
- Add `activeFilter` state: `'all' | 'expiring' | 'lowStock' | 'categories'`
- Each stat card gets `cursor-pointer`, `ring-2 ring-emerald-500` when active, and an `onClick` handler
- Clicking "Expiring Soon" filters the main list to only show items with <=7 days
- Clicking "Low Stock" filters to quantity <=1
- Clicking "Total Items" or "Categories" resets to show all
- Update `filteredIngredients` logic to combine search + active filter
- Add a small "Clear filter" badge/button when a filter is active

### 5. CO2 Savings Badge for Expiring Items
**File: `src/components/IngredientTracker.tsx` (expiring section, lines 312-375)**
- Calculate total CO2 that would be saved by consuming expiring items: sum `carbonFootPrintToWaste` from items expiring in <=7 days
- Display a small badge/pill in the expiring section header: `🌱 Save X.X kg CO₂`
- Use `Leaf` icon with emerald styling
- Add a tooltip or subtitle: "Consume these items to prevent this carbon waste"

### 6. Layout Optimization
**File: `src/components/IngredientTracker.tsx` (lines 310-501)**
- Change grid from `lg:grid-cols-3` (1 col expiring + 2 col pantry) to a responsive layout:
  - If `expiringIngredients.length === 0`: main pantry list takes full width (`lg:col-span-3`)
  - If few expiring items (<3): use `lg:grid-cols-4` with expiring=1 col, pantry=3 cols
  - Otherwise keep current 1+2 split
- This prevents the expiring column from being disproportionately empty

### Files Modified
- `src/components/IngredientTracker.tsx` — metric filters, typography, progress bars, relative dates, CO2 badge, layout
- `src/components/AIMealSuggestions.tsx` — AI insight card with expiring ingredient suggestions

### Design Consistency
- All new elements use glassmorphism: `bg-white/10 backdrop-blur-sm border border-white/20` for dark backgrounds, `bg-white/95 backdrop-blur-sm` for light cards
- Gradients: `from-emerald-500 to-teal-500` for accents
- Progress bars use the existing `Progress` component with custom indicator colors
- Accessible contrast maintained on all expiration color indicators

