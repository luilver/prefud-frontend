

# Unify Meal & Drink Cards to Match Meal Plan Card Design

## Problem
The AI Created Meals and Healthy Drinks cards use a different, bulkier design compared to the Meal Plan cards:
- **White background** (`bg-white/95`) instead of semantic tokens (`bg-card/95`)
- **Large CardHeader padding** creates excessive top spacing between the section title and cards
- Cards are too tall on mobile due to full description text, verbose metadata, and spacious padding
- No accent bar thickness match, no arrow hover cue, no compact metrics row

## Solution
Redesign both meal and drink cards to mirror the Meal Plan card pattern: compact, icon-driven, semantic-token-based, with the same visual structure.

### Card Design Pattern (matching MealPlanner cards)
- Container: `bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg` (replaces `bg-white/95 border-0 shadow-xl`)
- Top accent bar: `h-1.5` (currently `h-1`)
- CardHeader: `pb-2 pt-5` (compact, removes excess spacing)
- Title row: icon badge + truncated title + arrow hover cue
- Compact metrics row using pill badges (`bg-muted/60 rounded-full px-2.5 py-1`) with icons
- Tags as tiny pills (`text-[10px]`)
- Description: truncated to 1-2 lines on mobile (`line-clamp-2`)
- CardContent: `pt-2 pb-4`
- Bottom row with border-t separator for action buttons

### Files to Modify

**1. `src/components/AIMealCreator.tsx`** (lines 293-341 for local meals, 345-399 for API meals)
- Replace `bg-white/95 border-0 shadow-xl` with `bg-card/95 border border-border/50 shadow-lg`
- Change accent bar from `h-1` to `h-1.5`
- Reduce CardHeader padding: `className="pb-2 pt-5"`
- Add `ArrowRight` hover cue
- Truncate title: `truncate` class
- Convert cuisine/time/difficulty into compact pill badges with icons (Clock, Globe, Award)
- Truncate description with `line-clamp-2`
- Move tags to tiny `text-[10px]` pills
- Reduce CardContent padding: `className="pt-2 pb-4"`
- Remove the "Your AI Created Meals" h2 extra top spacing (`text-black drop-shadow-lg` to `text-foreground`)
- Reduce grid gap on mobile

**2. `src/components/AIDrinkCreator.tsx`** (lines 270-331)
- Same card container change to semantic tokens
- Same accent bar, header padding, and arrow cue
- Merge the duplicate metadata (cooking time appears in both CardDescription and the grid) into a single compact metrics row with pills
- Truncate description with `line-clamp-2`
- Vitamin tags to `text-[10px]` pills
- Fix "Your Created Drinks" h2 styling (`text-black drop-shadow-lg` to `text-foreground`)

**3. Both files — reduce spacing between title section and cards**
- Reduce `space-y-4` on the cards container to `space-y-3`
- Remove `mb-3` from description paragraphs, use `mb-2`

## Mobile-Specific Optimizations
- Grid gap: `gap-3` on mobile (currently `gap-4`)
- Description hidden or `line-clamp-1` on mobile via responsive classes
- Smaller icon badges: `p-2` to `p-1.5` on mobile
- Title text: `text-sm` on mobile instead of `text-lg`

