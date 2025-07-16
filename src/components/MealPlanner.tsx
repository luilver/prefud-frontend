import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Users, ChefHat, Clock, Sparkles, Coffee, Utensils } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import MealPlanCreatorStepper from "./MealPlanCreatorStepper";
import MealPlanView from "./MealPlanView";
import DrinkCreator from "./DrinkCreator";
import SpecialMealCreator from "./SpecialMealCreator";

const MealPlanner = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [showDrinkCreator, setShowDrinkCreator] = useState(false);
  const [showSpecialMealCreator, setShowSpecialMealCreator] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user, mealPlans, drinks, specialMeals, addMealPlan, addDrink, addSpecialMeal, getMealPlanById } = useUser();

  const handlePlanCreated = (newPlan: any) => {
    console.log('New plan created:', newPlan);
    addMealPlan(newPlan);
    setShowCreator(false);
    setSelectedMealPlan(newPlan);
  };

  const handleEditPlan = () => {
    setIsEditing(true);
    setShowCreator(true);
  };

  const handleBackToPlanner = () => {
    setShowCreator(false);
    setShowDrinkCreator(false);
    setShowSpecialMealCreator(false);
    setSelectedMealPlan(null);
    setIsEditing(false);
  };

  const handlePlanSelect = (plan: any) => {
    // Get the most up-to-date version of the plan from context
    const updatedPlan = getMealPlanById(plan.id) || plan;
    console.log('Selecting plan:', updatedPlan);
    setSelectedMealPlan(updatedPlan);
  };

  const handleDrinkCreated = (drink: any) => {
    console.log('Drink created:', drink);
    addDrink(drink);
    setShowDrinkCreator(false);
  };

  const handleSpecialMealCreated = (meal: any) => {
    console.log('Special meal created:', meal);
    addSpecialMeal(meal);
    setShowSpecialMealCreator(false);
  };

  // Update selected meal plan when context changes
  useEffect(() => {
    if (selectedMealPlan) {
      const updatedPlan = getMealPlanById(selectedMealPlan.id);
      if (updatedPlan) {
        setSelectedMealPlan(updatedPlan);
      }
    }
  }, [mealPlans, selectedMealPlan?.id, getMealPlanById]);

  if (selectedMealPlan && !showCreator && !showDrinkCreator && !showSpecialMealCreator) {
    return (
      <MealPlanView 
        plan={selectedMealPlan} 
        onBack={handleBackToPlanner}
        onEdit={handleEditPlan}
      />
    );
  }

  if (showCreator) {
    return (
      <MealPlanCreatorStepper
        onPlanCreated={handlePlanCreated}
        onBack={handleBackToPlanner}
      />
    );
  }

  if (showDrinkCreator) {
    return (
      <DrinkCreator
        onDrinkCreated={handleDrinkCreated}
        onBack={handleBackToPlanner}
      />
    );
  }

  if (showSpecialMealCreator) {
    return (
      <SpecialMealCreator
        onMealCreated={handleSpecialMealCreated}
        onBack={handleBackToPlanner}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Meal Planner</h1>
          <p className="text-gray-600 mt-1">Create and manage your weekly meal plans, drinks, and special meals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setShowCreator(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create AI Meal Plan
          </Button>
          <Button 
            onClick={() => setShowDrinkCreator(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Create Healthy Drink
          </Button>
          <Button 
            onClick={() => setShowSpecialMealCreator(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Utensils className="h-4 w-4 mr-2" />
            Create Special Meal
          </Button>
        </div>
      </div>

      {/* Content based on what exists */}
      {(mealPlans.length > 0 || drinks.length > 0 || specialMeals.length > 0) ? (
        <div className="space-y-8">
          {/* Meal Plans Grid */}
          {mealPlans.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-purple-500" />
                Meal Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealPlans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-purple-500" />
                        {plan.name}
                      </CardTitle>
                      <CardDescription>
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{plan.duration || 'Custom duration'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>For {plan.preferences?.people || 'N/A'} people</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{plan.preferences?.mealsPerDay || '3'} meals per day</span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          {plan.meals?.length || 0} total meals planned
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Drinks Grid */}
          {drinks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Coffee className="h-5 w-5 text-blue-500" />
                Healthy Drinks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drinks.map((drink) => (
                  <Card key={drink.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <Coffee className="h-5 w-5" />
                        {drink.name}
                      </CardTitle>
                      <CardDescription>
                        {drink.goal} • {drink.calories} cal • {drink.prepTime} min • {drink.servings} serving(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Ingredients:</span>
                          <p className="text-gray-600">{drink.ingredients.slice(0, 3).join(', ')}{drink.ingredients.length > 3 ? '...' : ''}</p>
                        </div>
                        {drink.benefits && (
                          <div>
                            <span className="font-medium text-gray-700">Benefits:</span>
                            <p className="text-gray-600">{drink.benefits.slice(0, 2).join(', ')}</p>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          Created: {new Date(drink.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Special Meals Grid */}
          {specialMeals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-green-500" />
                Special Meals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialMeals.map((meal) => (
                  <Card key={meal.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <Utensils className="h-5 w-5" />
                        {meal.name}
                      </CardTitle>
                      <CardDescription>
                        {meal.occasion} • {meal.type} • {meal.calories} cal • {meal.prepTime} min • Serves {meal.servings}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Ingredients:</span>
                          <p className="text-gray-600">{meal.ingredients.slice(0, 3).join(', ')}{meal.ingredients.length > 3 ? '...' : ''}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Difficulty:</span>
                          <span className="text-gray-600 ml-1 capitalize">{meal.difficulty}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Created: {new Date(meal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to AI Meal Planning, {user?.name?.split(' ')[0] || 'Chef'}!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-4">
                  Create your first personalized meal plan with our AI assistant. 
                  Get customized recipes based on your preferences, dietary needs, and cooking skills.
                </p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  You can also create healthy drinks for specific goals or one-time special meals!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setShowCreator(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Your First AI Meal Plan
                </Button>
                <Button 
                  onClick={() => setShowDrinkCreator(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  size="lg"
                >
                  <Coffee className="h-5 w-5 mr-2" />
                  Create Healthy Drink
                </Button>
                <Button 
                  onClick={() => setShowSpecialMealCreator(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  size="lg"
                >
                  <Utensils className="h-5 w-5 mr-2" />
                  Create Special Meal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanner;
