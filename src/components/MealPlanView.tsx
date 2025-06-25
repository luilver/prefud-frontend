
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ChefHat, ArrowLeft } from "lucide-react";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onSelectMeal: (meal: any) => void;
}

const MealPlanView = ({ plan, onBack, onSelectMeal }: MealPlanViewProps) => {
  if (!plan) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No meal plan selected</p>
      </div>
    );
  }

  const meals = plan.meals || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Meal Planner
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">{plan.name}</h2>
        <div></div>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Plan Overview
          </CardTitle>
          <CardDescription>
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{plan.numberOfWeeks}</div>
              <div className="text-sm text-gray-600">Weeks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{plan.numberOfPersons}</div>
              <div className="text-sm text-gray-600">Persons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{plan.mealsPerDay}</div>
              <div className="text-sm text-gray-600">Meals/Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{meals.length}</div>
              <div className="text-sm text-gray-600">Total Meals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Planned Meals</CardTitle>
          <CardDescription>
            Click on any meal to view the recipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {meals.map((meal: any) => (
              <div
                key={meal.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectMeal(meal)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{meal.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {meal.type?.charAt(0).toUpperCase() + meal.type?.slice(1)} • {meal.calories} cal
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meal.prepTime}min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {meal.servings} serving{meal.servings > 1 ? 's' : ''}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {meal.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <ChefHat className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
            {meals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No meals planned yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanView;
