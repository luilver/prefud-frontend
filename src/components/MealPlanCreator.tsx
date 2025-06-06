
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Clock, Users, Target, Calendar, Sparkles, ArrowRight } from "lucide-react";

interface MealPlanPreferences {
  duration: "2weeks" | "4weeks";
  people: number;
  mealsPerDay: number;
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  cookingTime: string;
  skillLevel: string;
  budget: string;
  allergies: string;
  healthGoals: string[];
}

interface MealPlanCreatorProps {
  onPlanCreated: (plan: any) => void;
  onBack: () => void;
}

const MealPlanCreator = ({ onPlanCreated, onBack }: MealPlanCreatorProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState<MealPlanPreferences>({
    duration: "2weeks",
    people: 2,
    mealsPerDay: 3,
    dietaryRestrictions: [],
    cuisinePreferences: [],
    cookingTime: "30min",
    skillLevel: "beginner",
    budget: "medium",
    allergies: "",
    healthGoals: []
  });

  const steps = [
    "Basic Info",
    "Dietary Preferences", 
    "Cooking Preferences",
    "Health Goals",
    "Review & Generate"
  ];

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", 
    "Low-carb", "Gluten-free", "Dairy-free", "Pescatarian"
  ];

  const cuisineOptions = [
    "Italian", "Mexican", "Asian", "Mediterranean", "American",
    "Indian", "Thai", "French", "Japanese", "Middle Eastern"
  ];

  const healthGoalOptions = [
    "Weight loss", "Muscle gain", "Heart health", "Energy boost",
    "Better digestion", "Lower cholesterol", "Balanced nutrition"
  ];

  const toggleArrayOption = (array: string[], option: string, setter: (value: string[]) => void) => {
    if (array.includes(option)) {
      setter(array.filter(item => item !== option));
    } else {
      setter([...array, option]);
    }
  };

  const generateMealPlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock generated plan
    const mockPlan = {
      id: Date.now().toString(),
      duration: preferences.duration,
      preferences,
      createdAt: new Date(),
      weeks: generateMockWeeks()
    };
    
    setIsGenerating(false);
    onPlanCreated(mockPlan);
  };

  const generateMockWeeks = () => {
    const weeks = [];
    const weekCount = preferences.duration === "2weeks" ? 2 : 4;
    
    for (let week = 1; week <= weekCount; week++) {
      const days = [];
      for (let day = 1; day <= 7; day++) {
        const meals = [];
        const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
        
        for (let i = 0; i < preferences.mealsPerDay; i++) {
          meals.push({
            id: `${week}-${day}-${i}`,
            type: mealTypes[i] || "snack",
            name: getMockMealName(mealTypes[i] || "snack"),
            calories: Math.floor(Math.random() * 400) + 200,
            prepTime: Math.floor(Math.random() * 45) + 15,
            difficulty: preferences.skillLevel,
            ingredients: getMockIngredients(),
            instructions: getMockInstructions(),
            videoUrl: "https://example.com/video.mp4"
          });
        }
        
        days.push({
          day: day,
          dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day - 1],
          meals
        });
      }
      weeks.push({ week, days });
    }
    
    return weeks;
  };

  const getMockMealName = (type: string) => {
    const meals = {
      breakfast: ["Avocado Toast", "Greek Yogurt Bowl", "Overnight Oats", "Scrambled Eggs"],
      lunch: ["Caesar Salad", "Quinoa Bowl", "Chicken Wrap", "Veggie Burger"],
      dinner: ["Grilled Salmon", "Pasta Primavera", "Stir-fry", "Roasted Chicken"],
      snack: ["Mixed Nuts", "Fruit Bowl", "Smoothie", "Protein Bar"]
    };
    const options = meals[type as keyof typeof meals] || meals.snack;
    return options[Math.floor(Math.random() * options.length)];
  };

  const getMockIngredients = () => [
    "2 slices whole grain bread",
    "1 avocado",
    "2 eggs",
    "Salt and pepper to taste",
    "1 tbsp olive oil"
  ];

  const getMockInstructions = () => [
    "Preheat your cooking surface",
    "Prepare all ingredients",
    "Cook according to recipe",
    "Season to taste",
    "Serve immediately"
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="duration" className="text-base font-medium">Plan Duration</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {["2weeks", "4weeks"].map((duration) => (
                  <Button
                    key={duration}
                    variant={preferences.duration === duration ? "default" : "outline"}
                    onClick={() => setPreferences({...preferences, duration: duration as "2weeks" | "4weeks"})}
                    className="h-12"
                  >
                    {duration === "2weeks" ? "2 Weeks" : "4 Weeks"}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="people" className="text-base font-medium">Number of People</Label>
              <Input
                id="people"
                type="number"
                min="1"
                max="10"
                value={preferences.people}
                onChange={(e) => setPreferences({...preferences, people: parseInt(e.target.value) || 2})}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="meals" className="text-base font-medium">Meals per Day</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[2, 3, 4, 5].map((count) => (
                  <Button
                    key={count}
                    variant={preferences.mealsPerDay === count ? "default" : "outline"}
                    onClick={() => setPreferences({...preferences, mealsPerDay: count})}
                    size="sm"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Dietary Restrictions</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {dietaryOptions.map((option) => (
                  <Button
                    key={option}
                    variant={preferences.dietaryRestrictions.includes(option) ? "default" : "outline"}
                    onClick={() => toggleArrayOption(
                      preferences.dietaryRestrictions, 
                      option, 
                      (value) => setPreferences({...preferences, dietaryRestrictions: value})
                    )}
                    size="sm"
                    className="text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Cuisine Preferences</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {cuisineOptions.map((option) => (
                  <Button
                    key={option}
                    variant={preferences.cuisinePreferences.includes(option) ? "default" : "outline"}
                    onClick={() => toggleArrayOption(
                      preferences.cuisinePreferences, 
                      option, 
                      (value) => setPreferences({...preferences, cuisinePreferences: value})
                    )}
                    size="sm"
                    className="text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="allergies" className="text-base font-medium">Allergies & Intolerances</Label>
              <Input
                id="allergies"
                placeholder="e.g., nuts, shellfish, lactose..."
                value={preferences.allergies}
                onChange={(e) => setPreferences({...preferences, allergies: e.target.value})}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Maximum Cooking Time</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {["15min", "30min", "45min", "60min+"].map((time) => (
                  <Button
                    key={time}
                    variant={preferences.cookingTime === time ? "default" : "outline"}
                    onClick={() => setPreferences({...preferences, cookingTime: time})}
                    size="sm"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Cooking Skill Level</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["beginner", "intermediate", "advanced"].map((skill) => (
                  <Button
                    key={skill}
                    variant={preferences.skillLevel === skill ? "default" : "outline"}
                    onClick={() => setPreferences({...preferences, skillLevel: skill})}
                    className="capitalize"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Budget Range</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["low", "medium", "high"].map((budget) => (
                  <Button
                    key={budget}
                    variant={preferences.budget === budget ? "default" : "outline"}
                    onClick={() => setPreferences({...preferences, budget: budget})}
                    className="capitalize"
                  >
                    {budget}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Health Goals</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {healthGoalOptions.map((goal) => (
                  <Button
                    key={goal}
                    variant={preferences.healthGoals.includes(goal) ? "default" : "outline"}
                    onClick={() => toggleArrayOption(
                      preferences.healthGoals, 
                      goal, 
                      (value) => setPreferences({...preferences, healthGoals: value})
                    )}
                    size="sm"
                    className="text-xs"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold mb-2">Ready to Generate Your Plan!</h3>
              <p className="text-gray-600">AI will create a personalized meal plan based on your preferences</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Duration</span>
                </div>
                <p className="text-sm text-gray-600">{preferences.duration === "2weeks" ? "2 Weeks" : "4 Weeks"}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">People</span>
                </div>
                <p className="text-sm text-gray-600">{preferences.people} people</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Meals/Day</span>
                </div>
                <p className="text-sm text-gray-600">{preferences.mealsPerDay} meals</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Max Time</span>
                </div>
                <p className="text-sm text-gray-600">{preferences.cookingTime}</p>
              </div>
            </div>

            {preferences.dietaryRestrictions.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Dietary Restrictions</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.dietaryRestrictions.map((restriction) => (
                    <span key={restriction} className="px-2 py-1 bg-white rounded-full text-xs border">
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Creating Your Meal Plan</h3>
          <p className="text-gray-600">AI is generating personalized recipes and schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Planner
        </Button>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create AI Meal Plan</h2>
        <p className="text-gray-600">Answer a few questions to get a personalized meal plan</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStep ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`mx-4 h-1 w-16 rounded ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5 text-orange-600" />
            <span>{steps[currentStep]}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={generateMealPlan}
            className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default MealPlanCreator;
