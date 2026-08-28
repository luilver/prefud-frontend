export interface ApiSubscriptionType {
  _id: string;
  name: string;
  price: number;
  mealPlans: number;
  healthyDrinks: number;
  specialMeals: number;
  generatedMeals: number;
  processImages?: number;
  updatedAt?: string;
  description:string;
}

export interface Plan {
  id: string;
  name: string;
  originalName: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  popular: boolean;
  gradient: string;
}

export const mapApiToPlan = (apiPlan: ApiSubscriptionType[], t?: (key: string) => string): Plan[] => {
  const safeT = t || ((k: string) => k);
  
  const plan: Plan[] = [];
  apiPlan.forEach((received: ApiSubscriptionType) => {
    const planNameKey = `pricing.plans.${received.name.toLowerCase()}.name`;
    const planDescKey = `pricing.plans.${received.name.toLowerCase()}.description`;
    
    const translatedName = safeT(planNameKey) === planNameKey ? received.name : safeT(planNameKey);
    const translatedDesc = safeT(planDescKey) === planDescKey ? (received.description || "Subscription Plan") : safeT(planDescKey);

    const generatedMeals = received.generatedMeals || 0;

    const features: string[] = [
      `${received.mealPlans} ${safeT("pricing.features.meal-plans") || "Meal Plans per month"}`,
      `${generatedMeals} ${safeT("pricing.features.meal-creations") || "Meal Creations"}`,
      `${received.healthyDrinks} ${safeT("pricing.features.healthy-drinks") || "Healthy Drinks per month"}`,
      `${received.specialMeals} ${safeT("pricing.features.special-meals") || "Special Meals per month"}`,
      `${received.processImages ?? 0} ${safeT("pricing.features.process-images") || "Process Images per month"}`,
    ];

    if (received.name.toLowerCase() === "free") {
      features.push(
        safeT("pricing.features.basic-recipes") || "Basic Recipe Collection",
        safeT("pricing.features.shopping-list") || "Shopping List Generator",
        safeT("pricing.features.email-support") || "Email Support"
      );
    } else if (received.name.toLowerCase() === "family") {
      features.push(
        safeT("pricing.features.ai-recommendations") || "AI Meal Recommendations",
        safeT("pricing.features.advanced-recipes") || "Advanced Recipe Collection",
        safeT("pricing.features.nutritional-analysis") || "Nutritional Analysis",
        safeT("pricing.features.priority-support") || "Priority Support"
      );
    } else if (received.name.toLowerCase() === "professional") {
      features.push(
        `10 ${safeT("pricing.features.delivery-commissions") || "Free Delivery Commissions"}`,
        `3 ${safeT("pricing.features.home-deliveries") || "Free Home Deliveries"}`,
        safeT("pricing.features.advanced-ai") || "Advanced AI Recommendations",
        safeT("pricing.features.custom-dietary") || "Custom Dietary Plans",
        safeT("pricing.features.professional-analytics") || "Professional Analytics",
        safeT("pricing.features.phone-support") || "Phone Support"
      );
    }

    plan.push({
      id: received._id,
      name: translatedName,
      originalName: received.name,
      price: received.price,
      interval: safeT("pricing.interval.month") !== "pricing.interval.month" ? safeT("pricing.interval.month") : "month",
      description: translatedDesc,
      features,
      popular: received.name.toLowerCase() === "family",
      gradient:
        received.name.toLowerCase() === "professional"
          ? "from-green-400 to-blue-500"
          : "from-muted to-muted-foreground",
    });
  });

  return plan;
};
