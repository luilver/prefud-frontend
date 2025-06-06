
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, ChefHat, Play, BookOpen, ShoppingCart } from "lucide-react";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onSelectMeal: (meal: any) => void;
}

const MealPlanView = ({ plan, onBack, onSelectMeal }: MealPlanViewProps) => {
  const [selectedWeek, setSelectedWeek] = useState(1);

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'lunch': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'dinner': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'snack': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const currentWeek = plan.weeks.find((w: any) => w.week === selectedWeek);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4">
            ← Back to Planner
          </Button>
          <h2 className="text-3xl font-bold text-gray-800">Your AI Meal Plan</h2>
          <p className="text-gray-600">
            {plan.duration === "2weeks" ? "2-week" : "4-week"} personalized plan for {plan.preferences.people} people
          </p>
        </div>
        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Generate Shopping List
        </Button>
      </div>

      {/* Week Selector */}
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardContent className="p-6">
          <div className="flex space-x-2">
            {plan.weeks.map((week: any) => (
              <Button
                key={week.week}
                variant={selectedWeek === week.week ? "default" : "outline"}
                onClick={() => setSelectedWeek(week.week)}
                className={selectedWeek === week.week ? "bg-gradient-to-r from-green-500 to-orange-500" : ""}
              >
                Week {week.week}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Week View */}
      {currentWeek && (
        <div className="grid gap-6">
          {currentWeek.days.map((day: any) => (
            <Card key={day.day} className="bg-white/70 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span>{day.dayName}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {day.meals.reduce((total: number, meal: any) => total + meal.calories, 0)} cal total
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {day.meals.map((meal: any) => (
                    <div
                      key={meal.id}
                      className="p-4 bg-white/50 rounded-lg border border-green-100 hover:bg-white/70 transition-colors cursor-pointer"
                      onClick={() => onSelectMeal(meal)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getMealTypeColor(meal.type)}`}>
                          {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">{meal.calories} cal</span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-2">{meal.name}</h4>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{meal.prepTime}min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChefHat className="h-3 w-3" />
                          <span className="capitalize">{meal.difficulty}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-green-100">
                        <div className="flex items-center justify-between">
                          <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 p-0">
                            <BookOpen className="h-4 w-4 mr-1" />
                            Recipe
                          </Button>
                          <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 p-0">
                            <Play className="h-4 w-4 mr-1" />
                            Video
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlanView;
