
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, TrendingUp, Target, Zap } from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

interface CalorieGoals {
  daily: number;
  protein: number;
  carbs: number;
  fat: number;
}

const CalorieTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [todaysFoods, setTodaysFoods] = useState<FoodItem[]>([
    {
      id: "1",
      name: "Grilled Chicken Breast",
      calories: 231,
      protein: 43.5,
      carbs: 0,
      fat: 5,
      quantity: 100,
      unit: "g"
    },
    {
      id: "2",
      name: "Brown Rice",
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      quantity: 1,
      unit: "cup"
    },
    {
      id: "3",
      name: "Avocado",
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      quantity: 0.5,
      unit: "medium"
    }
  ]);

  const [goals] = useState<CalorieGoals>({
    daily: 2000,
    protein: 150,
    carbs: 250,
    fat: 67
  });

  const [foodDatabase] = useState<FoodItem[]>([
    {
      id: "db1",
      name: "Banana",
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      quantity: 1,
      unit: "medium"
    },
    {
      id: "db2",
      name: "Greek Yogurt",
      calories: 130,
      protein: 20,
      carbs: 9,
      fat: 0,
      quantity: 1,
      unit: "cup"
    },
    {
      id: "db3",
      name: "Almonds",
      calories: 161,
      protein: 6,
      carbs: 6,
      fat: 14,
      quantity: 1,
      unit: "oz"
    },
    {
      id: "db4",
      name: "Salmon Fillet",
      calories: 206,
      protein: 22,
      carbs: 0,
      fat: 12,
      quantity: 100,
      unit: "g"
    }
  ]);

  const totalCalories = todaysFoods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = todaysFoods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = todaysFoods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFat = todaysFoods.reduce((sum, food) => sum + food.fat, 0);

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addFood = (food: FoodItem) => {
    const newFood = { ...food, id: Date.now().toString() };
    setTodaysFoods([...todaysFoods, newFood]);
  };

  const removeFood = (id: string) => {
    setTodaysFoods(todaysFoods.filter(food => food.id !== id));
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 80) return "bg-orange-500";
    if (percentage <= 100) return "bg-green-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">Calories</span>
              </div>
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{totalCalories}</span>
                <span className="text-gray-500">/ {goals.daily}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(totalCalories, goals.daily)}`}
                  style={{ width: `${getProgressPercentage(totalCalories, goals.daily)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {goals.daily - totalCalories} calories remaining
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="font-semibold">Protein</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{totalProtein.toFixed(1)}g</span>
                <span className="text-gray-500">/ {goals.protein}g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(totalProtein, goals.protein)}`}
                  style={{ width: `${getProgressPercentage(totalProtein, goals.protein)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="font-semibold">Carbs</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{totalCarbs.toFixed(1)}g</span>
                <span className="text-gray-500">/ {goals.carbs}g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(totalCarbs, goals.carbs)}`}
                  style={{ width: `${getProgressPercentage(totalCarbs, goals.carbs)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="font-semibold">Fat</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{totalFat.toFixed(1)}g</span>
                <span className="text-gray-500">/ {goals.fat}g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(totalFat, goals.fat)}`}
                  style={{ width: `${getProgressPercentage(totalFat, goals.fat)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Foods */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Today's Foods</span>
            </CardTitle>
            <CardDescription>
              Track your daily nutrition intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-green-100">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{food.name}</h4>
                    <p className="text-sm text-gray-600">
                      {food.quantity} {food.unit} • {food.calories} cal
                    </p>
                    <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                      <span>P: {food.protein}g</span>
                      <span>C: {food.carbs}g</span>
                      <span>F: {food.fat}g</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFood(food.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {todaysFoods.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No foods logged today</p>
                  <p className="text-sm">Start tracking by adding foods from the database</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Food Database */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-orange-600" />
              <span>Food Database</span>
            </CardTitle>
            <CardDescription>
              Search and add foods to your daily log
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredFoods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-orange-100 hover:bg-white/70 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{food.name}</h4>
                      <p className="text-sm text-gray-600">
                        {food.quantity} {food.unit} • {food.calories} cal
                      </p>
                      <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                        <span>P: {food.protein}g</span>
                        <span>C: {food.carbs}g</span>
                        <span>F: {food.fat}g</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addFood(food)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {filteredFoods.length === 0 && searchTerm && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No foods found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalorieTracker;
