import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ChefHat, Plus, Eye, Edit, Trash2, Sparkles } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import MealPlanCreatorStepper from "./MealPlanCreatorStepper";
import MealPlanView from "./MealPlanView";

interface Meal {
  id: string;
  name: string;
  type: string;
  calories: number;
  prepTime: number;
  servings: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  week: number;
  day: number;
  date: string;
}

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfWeeks: number;
  numberOfPersons: number;
  mealsPerDay: number;
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  allergiesIntolerances: string[];
  additionalAllergies: string;
  maxCookTime: number;
  cookingSkillLevel: string;
  budgetRange: string;
  dislikes: string[];
  healthGoals: string[];
  meals: Meal[];
}

type View = "list" | "create" | "view" | "edit";

const MealPlanner = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleCreateNew = () => {
    setCurrentView("create");
  };

  const handlePlanCreated = (newPlan: MealPlan) => {
    setMealPlans([...mealPlans, newPlan]);
    setCurrentView("list");
  };

  const handleViewPlan = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setCurrentView("view");
  };

  const handleEditPlan = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setCurrentView("edit");
  };

  const handleDeletePlan = (planId: string) => {
    setMealPlans(mealPlans.filter(plan => plan.id !== planId));
    toast({
      title: "Plan Deleted",
      description: "Meal plan has been successfully deleted.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-orange-100 text-orange-700";
      case "expert":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (currentView === "create") {
    return (
      <MealPlanCreatorStepper
        onPlanCreated={handlePlanCreated}
        onBack={() => setCurrentView("list")}
      />
    );
  }

  if (currentView === "view" && selectedPlan) {
    return (
      <MealPlanView
        plan={selectedPlan}
        onBack={() => setCurrentView("list")}
        onEdit={() => handleEditPlan(selectedPlan)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Meal Plans</h2>
          <p className="text-gray-600 mt-1">
            Manage and create AI-powered meal plans
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {/* Plans List - Horizontal Scroll */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Recent Plans</h3>
        
        {mealPlans.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ChefHat className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">No meal plans yet</h3>
              <p className="text-gray-400 text-center mb-4 max-w-md">
                Create your first AI-powered meal plan to get personalized recipes and shopping lists.
              </p>
              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex space-x-4 pb-4">
              {mealPlans.map((plan) => (
                <Card key={plan.id} className="bg-white/70 backdrop-blur-sm border-green-200 flex-shrink-0 w-80">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-green-700 truncate">{plan.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {plan.numberOfWeeks}w
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {plan.numberOfPersons}p
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {plan.maxCookTime}min
                      </Badge>
                    </div>

                    {plan.dietaryRestrictions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {plan.dietaryRestrictions.slice(0, 3).map((diet) => (
                          <Badge key={diet} variant="secondary" className="text-xs">
                            {diet}
                          </Badge>
                        ))}
                        {plan.dietaryRestrictions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.dietaryRestrictions.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {plan.meals.length} meals planned
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPlan(plan)}
                        className="flex-1 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
