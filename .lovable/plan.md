# Prefud AI Assistant — Chat Feature Plan

Build a text-only, media-agnostic AI chatbot feature integrated into the existing prefud app shell. All data is mocked from the five example JSON payloads. No backend calls.

## 1. App Shell Integration

**Mobile (bottom nav):**
- Modify `src/components/Navigation.tsx` to add a prominent central FAB-style tab with a Bot/Sparkles icon between the existing tabs.
- Tapping it opens the AI Assistant as a full-screen overlay (route `/assistant` pushed via `useNavigate`).

**Desktop:**
- Add `/assistant` route in `src/App.tsx`.
- Add a sidebar/top-nav link in the desktop navigation surface.
- On desktop, the page renders a 2-column split (35% chat / 65% workspace). On mobile the same route renders a full-screen chat with sheets/modals.

## 2. Routing & Files

New files:
```
src/pages/Assistant.tsx                     // route entry, responsive layout switcher
src/components/assistant/ChatPane.tsx       // chat transcript + composer (left col / full screen)
src/components/assistant/WorkspacePane.tsx  // right col renderer (desktop)
src/components/assistant/MessageBubble.tsx  // sage-green AI bubble + user bubble
src/components/assistant/ActionChips.tsx    // horizontal scroll bordered chips from questions[]
src/components/assistant/ChatComposer.tsx   // textarea + send button (16px min font)
src/components/assistant/widgets/MealPlanWidget.tsx
src/components/assistant/widgets/SpecialMealWidget.tsx
src/components/assistant/widgets/HealthyDrinkWidget.tsx
src/components/assistant/widgets/GeneratedMealsWidget.tsx
src/components/assistant/widgets/PantryListWidget.tsx
src/components/assistant/widgets/CartSummaryWidget.tsx
src/components/assistant/checkout/AssistantCheckoutFlow.tsx  // in-chat conversational checkout
src/components/assistant/DynamicWorkspace.tsx  // routes selected widget payload to detail view
src/contexts/AssistantContext.tsx           // messages, active workspace item, checkout state
src/services/assistantMockService.ts        // returns mocked JSON keyed by intent
src/types/assistant.ts                      // TS types for the 5 payload shapes
```

Modified files:
- `src/App.tsx` — add `/assistant` route + provider.
- `src/components/Navigation.tsx` — add central Bot tab (mobile) and sidebar link (desktop).
- `src/contexts/LanguageContext.tsx` — add `assistant.*` keys (EN/ES/PT).

## 3. State Management

`AssistantContext` holds:
- `messages: ChatMessage[]` where `ChatMessage = { id, role: 'user' | 'ai', text?, questions?, payload?: {type, data} }`
- `activeWorkspaceItem` (desktop right-pane selection: meal plan / meal / drink / pantry / cart / checkout)
- `checkoutState` (`idle | address | payment | confirm`) plus saved-address and saved-card mocks
- Actions: `sendUserMessage(text)`, `pickQuestion(ask)`, `openInWorkspace(payload)`, `startCheckout()`, `setCheckoutStep()`

`assistantMockService.sendMessage(text)` inspects keywords to pick one of five mock payloads: meal plan, special meal, healthy drink, generated meals, or regular conversation. Simulated latency with `setTimeout` and a typing indicator.

## 4. Payload → Widget Mapping

Detect payload type in order and render inside the AI bubble (mobile) / route to workspace (desktop):

| JSON key present | Widget |
|---|---|
| `mealPlan` | `MealPlanWidget` — day tabs, meal cards with name/calories/cookingTime, "Ver Receta" opens `SpecialMealWidget`-style detail. Bottom CTAs: "Añadir Ingredientes al Carrito", "Añadir a Despensa". |
| `specialMeal` (also handle `speacialMeal` typo) | `SpecialMealWidget` — name/description/benefits, accordion for ingredients (checkboxes with qty/unit) and steps (numbered), macros bar with nutritionalInfo + carbonFootprint. |
| `healthyDrink` | `HealthyDrinkWidget` — same structure as special meal with drinkType and valueFreshness. |
| `generatedMeals` | `GeneratedMealsWidget` — list of meal cards, each expandable to the special-meal detail view. |
| `ingredientsList` only (or shown from any of the above) | `PantryListWidget` — grouped by `classification`, shows quantity/unit/daysToExpire with color severity on expiry. |
| plain `response` + `questions` | text bubble + `ActionChips`. |

All widgets are pure presentational; they take the raw JSON slice + optional `onOpenDetail` and `onAction` callbacks.

## 5. Responsive Behavior

`useIsMobile()` (already present) drives layout in `Assistant.tsx`:
- **Mobile:** single column. Widgets render inline in the chat. Tapping "Ver Receta" / meal card opens a full-screen `Sheet` with the detail view. Cart & checkout also open as sheets.
- **Desktop:** grid `grid-cols-[35%_65%]`. `ChatPane` left, `WorkspacePane` right. Clicking a widget/meal card calls `openInWorkspace(payload)` and renders the same detail component in the right pane instead of a sheet. Empty workspace shows a placeholder ("Selecciona un elemento del chat").

## 6. Conversational Checkout (in-chat)

Sequence driven by AI-authored messages injected into the transcript when user taps a checkout action chip:
1. AI posts `CartSummaryWidget` (aggregated from last `ingredientsList`, mocked prices).
2. AI text bubble asks for shipping → chips: "Usar dirección guardada", "Nueva dirección".
3. AI text bubble asks for payment → chips: "Apple Pay", "Tarjeta terminada en 4242".
4. Confirmation bubble + a full-width high-contrast Oxblood Red button (`bg-destructive` or dedicated token) at the bottom of the chat: **"Confirmar y Pagar $X.XX"**. On tap → success bubble.

Checkout is scoped to `AssistantCheckoutFlow` and does not touch the existing `CheckoutFlow.tsx` or `CartContext`.

## 7. Styling

- Reuse existing semantic tokens (`bg-card`, `text-foreground`, `bg-primary`, emerald/sage gradient utilities already in `index.css`).
- AI bubbles: sage/emerald tinted surface (`bg-primary/10 text-foreground` or existing sage token).
- User bubbles: `bg-primary text-primary-foreground`.
- Action chips: `rounded-full border border-border px-3 py-1.5 text-sm` in a `overflow-x-auto` row with `snap-x`.
- Oxblood confirm button: add a scoped utility class using `hsl` value in `index.css` if `destructive` is not oxblood-red enough (design token check during build).
- No images, no photography — icons from `lucide-react` only for structural cues.
- Textareas/inputs: `text-base` (16px) to prevent iOS zoom, safe-area utilities on the composer.

## 8. i18n Keys (EN/ES/PT) added to `LanguageContext.tsx`

```
assistant.title, assistant.placeholder, assistant.emptyWorkspace,
assistant.addToCart, assistant.addToPantry, assistant.viewRecipe,
assistant.day, assistant.calories, assistant.cookingTime, assistant.carbonFootprint,
assistant.ingredients, assistant.steps, assistant.benefits, assistant.macros,
assistant.expiresInDays,
assistant.checkout.summary, assistant.checkout.askAddress, assistant.checkout.savedAddress,
assistant.checkout.newAddress, assistant.checkout.askPayment, assistant.checkout.applePay,
assistant.checkout.card4242, assistant.checkout.confirmPay, assistant.checkout.success
```

## 9. Out of Scope

- Real backend/streaming (mocked only).
- Real cart/pantry mutations — checkout is UI-only, does not call `CartContext` or `addIngredientsToPantry`.
- Native platform gating (cart is hidden natively; the assistant checkout is web-only UI, but we will still guard the confirm button with `isNativePlatform()` to hide it on native per the existing memory rule).
- Any recipe/pantry existing screens.

## 10. Technical Notes

- Types file mirrors the five JSON shapes exactly (including tolerating the `speacialMeal` typo via `specialMeal | speacialMeal`).
- Typing indicator = three-dot bubble while mock service resolves.
- Auto-scroll to bottom on new message via `useRef` + `scrollIntoView`.
- Provider order in `App.tsx`: `AssistantProvider` placed inside `LanguageProvider` and `UserProvider`.
