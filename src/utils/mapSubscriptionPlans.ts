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
  price: number;
  interval: string;
  description: string;
  features: string[];
  popular: boolean;
  gradient: string;
}

export const mapApiToPlan = (apiPlan: ApiSubscriptionType[]): Plan[] => {
  // Aquí defines la descripción y características según el plan

  const plan: Plan[] = [];
  apiPlan.map((received: ApiSubscriptionType) => {
    plan.push({
      id: received._id,
      name: received.name,
      price: received.price,
      interval: "month",
      description: received.description || "Subscription Plan",
      features: [ `Meal plans: ${received.mealPlans} `,`Healthy drinks: ${received.healthyDrinks} `,`Special Meals: ${received.specialMeals}`, `Generated meals: ${received.generatedMeals}`, `Process Images: ${received.processImages ?? 0}`],
      popular: received.name === "Professional", // por ejemplo
      gradient:
        received.name === "Professional"
          ? "from-green-400 to-blue-500"
          : "from-muted to-muted-foreground",
    });
  });

  return plan;
};
