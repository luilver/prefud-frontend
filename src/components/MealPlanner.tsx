
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Users, ChefHat, Clock, Sparkles } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import MealPlanCreatorStepper from "./MealPlanCreatorStepper";
import MealPlanView from "./MealPlanView";

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfWeeks: number;
  numberOfPersons: number;
  mealsPerDay: number;
  meals: any[];
}

const MealPlanner = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const { user } = useUser();

  // Load meal plans from localStorage on component mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('mealPlans');
    if (savedPlans) {
      setMealPlans(JSON.parse(savedPlans));
    }
  }, []);

  // Save meal plans to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  const handlePlanCreated = (newPlan: MealPlan) => {
    setMealPlans(prev => [...prev, newPlan]);
    setShowCreator(false);
    setSelectedMealPlan(newPlan); // Automatically show the newly created plan
  };

  const handleEditPlan = () => {
    setIsEditing(true);
    setShowCreator(true);
  };

  const handleBackToPlanner = () => {
    setShowCreator(false);
    setSelectedMealPlan(null);
    setIsEditing(false);
  };

  if (selectedMealPlan && !showCreator) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Meal Planner</h1>
          <p className="text-gray-600 mt-1">Create and manage your weekly meal plans</p>
        </div>
        <Button 
          onClick={() => setShowCreator(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create AI Meal Plan
        </Button>
      </div>

      {/* Meal Plans Grid */}
      {mealPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMealPlan(plan)}
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
                    <span>{plan.numberOfWeeks} week{plan.numberOfWeeks > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{plan.numberOfPersons} person{plan.numberOfPersons > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{plan.mealsPerDay} meals per day</span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {plan.meals.length} total meals planned
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Empty State
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
                <p className="text-gray-600 max-w-md mx-auto">
                  Create your first personalized meal plan with our AI assistant. 
                  Get customized recipes based on your preferences, dietary needs, and cooking skills.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white mt-4"
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Create Your First AI Meal Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanner;
