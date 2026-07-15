import type { AssistantResponse } from "@/types/assistant";

const MEAL_PLAN: AssistantResponse = {
  response: "Su plan se creo con exito, revisalo y quedo atento a la respuesta",
  questions: [
    { ask: "Deseas que agregue los ingredientes al carrito de compras?" },
    { ask: "Quieres que lo genere otra vez?" },
  ],
  payload: {
    type: "mealPlan",
    data: {
      totalCarbonFootprint: 7.8,
      mealPlan: {
        mealPlan: [
          {
            day: 1, date: "2026-07-20", dayOfWeek: "Monday",
            meals: [
              { id: "a7b1", name: "Ecuadorian Shrimp Ceviche", description: "A refreshing shrimp ceviche with lime, tomatoes, and onions.",
                ingredients: [ { name: "shrimp", quantity: 600, unit: "grams" }, { name: "lime", quantity: 6, unit: "pieces" }, { name: "tomato", quantity: 3, unit: "pieces" }, { name: "onion", quantity: 2, unit: "pieces" }, { name: "cilantro", quantity: 30, unit: "grams" }, { name: "avocado", quantity: 2, unit: "pieces" } ],
                prepTip: "Chill the shrimp in ice water after cooking to stop the cooking process.", cookingTime: 30, carbonFootprint: 1.5,
                steps: [ "Boil shrimp for 3 minutes and then chill in ice water.", "Dice tomatoes, onions, and avocados.", "Mix shrimp with lime juice, tomatoes, onions, and cilantro.", "Let it marinate in the fridge for 15 minutes.", "Serve chilled with avocado slices." ],
                calories: 350, nutritionalInfo: { protein: 30, fat: 15, carbohydrates: 20, fiber: 8 }, mealType: "lunch" },
              { id: "b8c9", name: "American Paleo Breakfast Bowl", description: "A hearty breakfast bowl with eggs, bacon, and sweet potatoes.",
                ingredients: [ { name: "egg", quantity: 8, unit: "pieces" }, { name: "bacon", quantity: 300, unit: "grams" }, { name: "sweet potato", quantity: 3, unit: "pieces" }, { name: "spinach", quantity: 150, unit: "grams" }, { name: "olive oil", quantity: 3, unit: "tablespoons" } ],
                prepTip: "Pre-cook the sweet potatoes the night before to save time.", cookingTime: 40, carbonFootprint: 2,
                steps: [ "Roast sweet potatoes at 200C for 25 minutes.", "Cook bacon in a skillet until crispy.", "Saute spinach in olive oil for 3 minutes.", "Fry eggs sunny-side up.", "Assemble bowl with sweet potatoes, bacon, spinach, and eggs." ],
                calories: 450, nutritionalInfo: { protein: 25, fat: 30, carbohydrates: 35, fiber: 10 }, mealType: "breakfast" },
            ],
          },
          {
            day: 2, date: "2026-07-21", dayOfWeek: "Tuesday",
            meals: [
              { id: "c1d2", name: "Ecuadorian Grilled Chicken", description: "Grilled chicken marinated in lime and spices, served with a fresh salad.",
                ingredients: [ { name: "chicken breast", quantity: 800, unit: "grams" }, { name: "lime", quantity: 4, unit: "pieces" }, { name: "garlic", quantity: 4, unit: "cloves" }, { name: "cumin", quantity: 2, unit: "teaspoons" }, { name: "lettuce", quantity: 1, unit: "head" }, { name: "cucumber", quantity: 2, unit: "pieces" } ],
                prepTip: "Marinate the chicken overnight for deeper flavor.", cookingTime: 35, carbonFootprint: 2.5,
                steps: [ "Marinate chicken with lime juice, garlic, and cumin for at least 2 hours.", "Grill chicken on medium heat for 15 minutes each side.", "Slice cucumber and lettuce for salad.", "Serve grilled chicken with fresh salad." ],
                calories: 400, nutritionalInfo: { protein: 35, fat: 15, carbohydrates: 10, fiber: 5 }, mealType: "lunch" },
              { id: "d3e4", name: "American Paleo Omelette", description: "A fluffy omelette with mushrooms, bell peppers, and spinach.",
                ingredients: [ { name: "egg", quantity: 10, unit: "pieces" }, { name: "mushroom", quantity: 200, unit: "grams" }, { name: "bell pepper", quantity: 2, unit: "pieces" }, { name: "spinach", quantity: 100, unit: "grams" }, { name: "coconut oil", quantity: 2, unit: "tablespoons" } ],
                prepTip: "Beat the eggs well to make the omelette fluffy.", cookingTime: 20, carbonFootprint: 1.8,
                steps: [ "Saute mushrooms and bell peppers in coconut oil for 5 minutes.", "Add spinach and cook for another 2 minutes.", "Beat eggs and pour over the vegetables.", "Cook on low heat until set, then fold the omelette." ],
                calories: 380, nutritionalInfo: { protein: 28, fat: 25, carbohydrates: 12, fiber: 6 }, mealType: "breakfast" },
            ],
          },
        ],
      },
      ingredientsList: [
        { name: "shrimp", quantity: 600, unit: "grams", classification: "protein", carbonFootPrintToWaste: 2, daysToExpire: 2 },
        { name: "lime", quantity: 10, unit: "pieces", classification: "fruit", carbonFootPrintToWaste: 0.5, daysToExpire: 10 },
        { name: "tomato", quantity: 3, unit: "pieces", classification: "vegetable", carbonFootPrintToWaste: 0.3, daysToExpire: 5 },
        { name: "onion", quantity: 2, unit: "pieces", classification: "vegetable", carbonFootPrintToWaste: 0.2, daysToExpire: 10 },
        { name: "cilantro", quantity: 30, unit: "grams", classification: "herb", carbonFootPrintToWaste: 0.1, daysToExpire: 3 },
        { name: "avocado", quantity: 2, unit: "pieces", classification: "fruit", carbonFootPrintToWaste: 0.6, daysToExpire: 3 },
        { name: "egg", quantity: 18, unit: "pieces", classification: "protein", carbonFootPrintToWaste: 1, daysToExpire: 14 },
        { name: "bacon", quantity: 300, unit: "grams", classification: "protein", carbonFootPrintToWaste: 1.5, daysToExpire: 7 },
        { name: "sweet potato", quantity: 3, unit: "pieces", classification: "vegetable", carbonFootPrintToWaste: 0.8, daysToExpire: 10 },
        { name: "spinach", quantity: 250, unit: "grams", classification: "vegetable", carbonFootPrintToWaste: 0.4, daysToExpire: 5 },
        { name: "olive oil", quantity: 3, unit: "tablespoons", classification: "oil", carbonFootPrintToWaste: 0.2, daysToExpire: 365 },
        { name: "chicken breast", quantity: 800, unit: "grams", classification: "protein", carbonFootPrintToWaste: 2.2, daysToExpire: 3 },
        { name: "garlic", quantity: 4, unit: "cloves", classification: "vegetable", carbonFootPrintToWaste: 0.1, daysToExpire: 30 },
        { name: "cumin", quantity: 2, unit: "teaspoons", classification: "spice", carbonFootPrintToWaste: 0.05, daysToExpire: 365 },
        { name: "lettuce", quantity: 1, unit: "head", classification: "vegetable", carbonFootPrintToWaste: 0.3, daysToExpire: 5 },
        { name: "cucumber", quantity: 2, unit: "pieces", classification: "vegetable", carbonFootPrintToWaste: 0.2, daysToExpire: 7 },
        { name: "mushroom", quantity: 200, unit: "grams", classification: "vegetable", carbonFootPrintToWaste: 0.5, daysToExpire: 5 },
        { name: "bell pepper", quantity: 2, unit: "pieces", classification: "vegetable", carbonFootPrintToWaste: 0.3, daysToExpire: 7 },
        { name: "coconut oil", quantity: 2, unit: "tablespoons", classification: "oil", carbonFootPrintToWaste: 0.2, daysToExpire: 365 },
      ],
    },
  },
};

const SPECIAL_MEAL: AssistantResponse = {
  response: "Su plan se creo con exito, revisalo y quedo atento a la respuesta",
  questions: [ { ask: "Deseas que agregue los ingredientes al carrito de compras?" }, { ask: "Quieres que lo genere otra vez?" } ],
  payload: { type: "specialMeal", data: {
    totalCarbonFootprint: 2.5,
    specialMeal: { specialMeal: {
      name: "Greek Lemon Herb Chicken",
      description: "A flavorful Greek-inspired chicken dish with a zesty lemon and herb marinade, served with a side of roasted vegetables.",
      benefits: "Rich in antioxidants and anti-inflammatory properties, supports the immune system.",
      instructions: "Marinate the chicken with lemon juice, olive oil, and herbs for at least 30 minutes before cooking.",
      ingredients: [ { name: "chicken breast", quantity: 4, unit: "pieces" }, { name: "lemon", quantity: 2, unit: "pieces" }, { name: "olive oil", quantity: 4, unit: "tablespoons" }, { name: "garlic", quantity: 4, unit: "cloves" }, { name: "oregano", quantity: 2, unit: "teaspoons" }, { name: "thyme", quantity: 1, unit: "teaspoon" }, { name: "zucchini", quantity: 2, unit: "pieces" }, { name: "bell pepper", quantity: 2, unit: "pieces" }, { name: "red onion", quantity: 1, unit: "piece" } ],
      prepTip: "Use fresh herbs for a more vibrant flavor.",
      cookingTime: 35, carbonFootprint: 2.5,
      steps: [ "Marinate the chicken with lemon juice, olive oil, minced garlic, oregano, and thyme for 30 minutes.", "Preheat the oven to 400F (200C).", "Chop the zucchini, bell peppers, and red onion into bite-sized pieces.", "Place the marinated chicken and vegetables on a baking sheet.", "Roast in the oven for 25-30 minutes until the chicken is cooked through and vegetables are tender.", "Serve hot with a sprinkle of fresh herbs." ],
      calories: 450, nutritionalInfo: { protein: 40, fat: 20, carbohydrates: 15, fiber: 5, vitamins: ["Vitamin C","Vitamin A","Vitamin K"] }, mealType: "lunch",
    } },
    ingredientsList: [
      { name: "chicken breast", quantity: 4, unit: "pieces", classification: "protein", carbonFootPrintToWaste: 1, daysToExpire: 3 },
      { name: "lemon", quantity: 2, unit: "pieces", classification: "fruit", carbonFootPrintToWaste: 0.2, daysToExpire: 10 },
      { name: "olive oil", quantity: 4, unit: "tablespoons", classification: "oil", carbonFootPrintToWaste: 0.1, daysToExpire: 180 },
      { name: "garlic", quantity: 4, unit: "cloves", classification: "vegetable", carbonFootPrintToWaste: 0.05, daysToExpire: 30 },
      { name: "oregano", quantity: 2, unit: "teaspoons", classification: "herb", carbonFootPrintToWaste: 0.01, daysToExpire: 365 },
      { name: "thyme", quantity: 1, unit: "teaspoon", classification: "herb", carbonFootPrintToWaste: 0.01, daysToExpire: 365 },
      { name: "zucchini", quantity: 2, unit: "pieces", classification: "vegetable", carbonFootPrintToWaste: 0.3, daysToExpire: 7 },
      { name: "bell pepper", quantity: 2, unit: "pieces", classification: "vegetable", carbonFootPrintToWaste: 0.3, daysToExpire: 7 },
      { name: "red onion", quantity: 1, unit: "piece", classification: "vegetable", carbonFootPrintToWaste: 0.15, daysToExpire: 14 },
    ],
  } },
};

const HEALTHY_DRINK: AssistantResponse = {
  response: "Su bebida se creo con exito, revisala y quedo atento a la respuesta",
  questions: [ { ask: "Deseas que agregue los ingredientes al carrito de compras?" }, { ask: "Quieres que lo genere otra vez?" } ],
  payload: { type: "healthyDrink", data: {
    totalCarbonFootprint: 0.2,
    healthyDrink: { healthyDrink: {
      name: "Korean Detox Green Tea",
      description: "A refreshing detox tea with Korean influences, designed to promote skin health and detoxification.",
      benefits: "Supports detoxification, improves skin health, and boosts metabolism.",
      instructions: "Drink once daily, preferably in the morning.",
      ingredients: [ { name: "green tea leaves", quantity: 10, unit: "grams" }, { name: "ginger", quantity: 5, unit: "grams" }, { name: "lemon", quantity: 1, unit: "piece" }, { name: "honey", quantity: 10, unit: "grams" }, { name: "water", quantity: 500, unit: "milliliters" } ],
      prepTip: "Use fresh ginger and organic green tea leaves for the best flavor and health benefits.",
      cookingTime: 7, carbonFootprint: 0.2,
      steps: [ "Boil water in a pot.", "Add green tea leaves and ginger to the boiling water.", "Let it steep for 5 minutes.", "Strain the tea into a cup.", "Add honey and a squeeze of lemon.", "Stir well and serve hot." ],
      calories: 30, nutritionalInfo: { protein: 0, fat: 0, carbohydrates: 8, fiber: 0, vitamins: ["Vitamin C","Vitamin B6"] },
      drinkType: "detox", valueFreshness: 1,
    } },
    ingredientsList: [
      { name: "green tea leaves", quantity: 10, unit: "grams", classification: "herb", carbonFootPrintToWaste: 0.05, daysToExpire: 365 },
      { name: "ginger", quantity: 5, unit: "grams", classification: "spice", carbonFootPrintToWaste: 0.02, daysToExpire: 30 },
      { name: "lemon", quantity: 1, unit: "piece", classification: "fruit", carbonFootPrintToWaste: 0.03, daysToExpire: 14 },
      { name: "honey", quantity: 10, unit: "grams", classification: "other", carbonFootPrintToWaste: 0.01, daysToExpire: 730 },
      { name: "water", quantity: 500, unit: "milliliters", classification: "other", carbonFootPrintToWaste: 0, daysToExpire: 0 },
    ],
  } },
};

const GENERATED_MEALS: AssistantResponse = {
  response: "Generé algunas ideas con lo que tienes en la despensa",
  questions: [ { ask: "Deseas que agregue los ingredientes al carrito de compras?" }, { ask: "Quieres que lo genere otra vez?" } ],
  payload: { type: "generatedMeals", data: {
    totalCarbonFootprint: 560,
    generatedMeals: { generatedMeals: [
      { name: "Banana Acai Smoothie Bowl",
        description: "A nutritious and energizing smoothie bowl made with banana, acai pulp, and almond milk, topped with chia seeds and a drizzle of honey.",
        benefits: "Rich in antioxidants, vitamins, and healthy fats, this smoothie bowl boosts energy and supports digestion.",
        instructions: "Blend the ingredients and serve in a bowl topped with chia seeds and honey.",
        ingredientsList: [
          { name: "Banana", quantity: 2, unit: "unit", classification: "fruit", carbonFootPrintToWaste: 80, daysToExpire: 5 },
          { name: "Acai pulp", quantity: 200, unit: "grams", classification: "fruit", carbonFootPrintToWaste: 150, daysToExpire: 7 },
          { name: "Almond milk", quantity: 250, unit: "milliliters", classification: "dairy", carbonFootPrintToWaste: 100, daysToExpire: 10 },
          { name: "Whey protein powder", quantity: 30, unit: "grams", classification: "protein", carbonFootPrintToWaste: 120, daysToExpire: 30 },
          { name: "Chia seeds", quantity: 15, unit: "grams", classification: "grain", carbonFootPrintToWaste: 60, daysToExpire: 365 },
          { name: "Honey", quantity: 10, unit: "grams", classification: "other", carbonFootPrintToWaste: 50, daysToExpire: 180 },
        ],
        prepTip: "For a creamier texture, freeze the banana slices before blending.",
        cookingTime: 10, carbonFootprint: 560,
        steps: [ "Peel and slice the bananas.", "In a blender, combine banana slices, acai pulp, almond milk, and whey protein powder.", "Blend until smooth and creamy.", "Pour the mixture into bowls.", "Top with chia seeds and drizzle honey over each serving." ],
        calories: 320, nutritionalInfo: { protein: 15, fat: 10, carbohydrates: 45, fiber: 8, vitamins: ["Vitamin C","Vitamin E","Vitamin B6"] }, mealType: "breakfast",
      },
    ] },
  } },
};

const REGULAR: AssistantResponse = {
  response: "Comer pizza de desayuno no es saludable",
  questions: [
    { ask: "Has pensado en comer brocoli?" },
    { ask: "Quieres que revise que tienes en despensa para sugerir algo mejor?" },
  ],
};

export function mockAssistantResponse(text: string): Promise<AssistantResponse> {
  const t = text.toLowerCase();
  let out: AssistantResponse = REGULAR;
  if (/plan|semana|meal plan|dias|d\u00edas/.test(t)) out = MEAL_PLAN;
  else if (/bebida|drink|tea|te|jugo|smoothie/.test(t)) out = HEALTHY_DRINK;
  else if (/pantry|despensa|con lo que tengo|ingredientes disponibles/.test(t)) out = GENERATED_MEALS;
  else if (/receta|meal|comida|plato|almuerzo|cena|especial/.test(t)) out = SPECIAL_MEAL;
  return new Promise((resolve) => setTimeout(() => resolve(out), 900));
}
