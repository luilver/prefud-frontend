export interface SourceLink { url: string; source: string; description: string; }
export interface IngredientRef { name: string; quantity: number; unit: string; }
export interface IngredientListItem extends IngredientRef { classification: string; carbonFootPrintToWaste: number; daysToExpire: number; }
export interface NutritionalInfo { protein: number; fat: number; carbohydrates: number; fiber: number; vitamins?: string[]; }
export interface MealBase { id?: string; name: string; description: string; ingredients?: IngredientRef[]; ingredientsList?: IngredientListItem[]; prepTip?: string; cookingTime: number; carbonFootprint: number; steps: string[]; calories: number; nutritionalInfo: NutritionalInfo; mealType?: string; benefits?: string; instructions?: string; }
export interface DayPlan { day: number; date: string; dayOfWeek: string; meals: MealBase[]; }
export interface MealPlanPayload { mealPlan: { mealPlan: DayPlan[] }; totalCarbonFootprint: number; ingredientsList: IngredientListItem[]; }
export interface SpecialMealPayload { specialMeal: { specialMeal: MealBase }; totalCarbonFootprint: number; ingredientsList: IngredientListItem[]; }
export interface HealthyDrinkPayload { healthyDrink: { healthyDrink: MealBase & { drinkType?: string; valueFreshness?: number } }; totalCarbonFootprint: number; ingredientsList: IngredientListItem[]; }
export interface GeneratedMealsPayload { generatedMeals: { generatedMeals: MealBase[] }; totalCarbonFootprint: number; }
export type AssistantPayload =
  | { type: "mealPlan"; data: MealPlanPayload }
  | { type: "specialMeal"; data: SpecialMealPayload }
  | { type: "healthyDrink"; data: HealthyDrinkPayload }
  | { type: "generatedMeals"; data: GeneratedMealsPayload }
  | { type: "pantry"; data: { ingredientsList: IngredientListItem[] } }
  | { type: "cart"; data: { ingredientsList: IngredientListItem[] } };
export interface QuestionChip { ask: string; }
export interface AssistantResponse { response: string; questions?: QuestionChip[]; payload?: AssistantPayload; links?: SourceLink[]; }
export interface OrderCartItem { productTitle: string; imageUrl?: string; lineTotalCents: number; }
export interface OrderCart { quoteId: string; items: OrderCartItem[]; totalAmountCents: number; }
export interface OrderStep { title: string; status: string; description?: string; }
export interface ChatOrder { status: string; orderId?: string; cart?: OrderCart; errorCode?: string; steps?: OrderStep[]; }

export interface ChatMessage { id: string; role: "user" | "ai"; text?: string; questions?: QuestionChip[]; payload?: AssistantPayload; typing?: boolean; links?: SourceLink[]; order?: ChatOrder; }
export type CheckoutStep = "idle" | "summary" | "address" | "payment" | "confirm" | "success";