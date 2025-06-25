
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Sparkles, X, Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface MealPlanCreatorProps {
  onPlanCreated: (plan: any) => void;
  onBack: () => void;
}

const MealPlanCreator = ({ onPlanCreated, onBack }: MealPlanCreatorProps) => {
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [newDislike, setNewDislike] = useState("");
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { ingredients } = useUser();
  const { toast } = useToast();

  const availableDiets = [
    "vegetarian", "vegan", "keto", "paleo", "mediterranean", 
    "low-carb", "gluten-free", "dairy-free", "pescatarian"
  ];

  const availableGoals = [
    "weight-loss", "muscle-gain", "maintain-weight", "heart-health", 
    "diabetes-friendly", "high-protein", "low-sodium"
  ];

  const addDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim().toLowerCase())) {
      setDislikes([...dislikes, newDislike.trim().toLowerCase()]);
      setNewDislike("");
    }
  };

  const removeDislike = (dislike: string) => {
    setDislikes(dislikes.filter(d => d !== dislike));
  };

  const toggleDiet = (diet: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(diet) 
        ? prev.filter(d => d !== diet)
        : [...prev, diet]
    );
  };

  const toggleGoal = (goal: string) => {
    setHealthGoals(prev =>
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const generateMealPlan = async () => {
    if (!planName || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Mock AI generation process
      console.log('Generating meal plan with preferences:', {
        dietaryRestrictions,
        dislikes,
        healthGoals,
        availableIngredients: ingredients
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockMealPlan = {
        id: Date.now().toString(),
        name: planName,
        startDate,
        endDate,
        dietaryRestrictions,
        dislikes,
        healthGoals,
        meals: [
          {
            id: "1",
            name: "Mediterranean Quinoa Bowl",
            type: "lunch",
            calories: 450,
            prepTime: 20,
            servings: 2,
            difficulty: "easy",
            ingredients: ["quinoa", "chickpeas", "cucumber", "tomatoes", "feta cheese", "olive oil"],
            instructions: [
              "Cook quinoa according to package directions",
              "Drain and rinse chickpeas",
              "Dice cucumber and tomatoes",
              "Combine all ingredients and drizzle with olive oil"
            ]
          },
          {
            id: "2",
            name: "Grilled Salmon with Asparagus",
            type: "dinner",
            calories: 380,
            prepTime: 25,
            servings: 2,
            difficulty: "medium",
            ingredients: ["salmon fillets", "asparagus", "lemon", "garlic", "olive oil"],
            instructions: [
              "Season salmon with salt and pepper",
              "Grill salmon for 4-5 minutes per side",
              "Sauté asparagus with garlic",
              "Serve with lemon wedges"
            ]
          }
        ]
      };

      onPlanCreated(mockMealPlan);
      
      toast({
        title: "Meal Plan Generated!",
        description: `Your personalized meal plan "${planName}" is ready.`,
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back to Meal Planner
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Create AI Meal Plan</h2>
        <div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan Details */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700">Plan Details</CardTitle>
            <CardDescription>
              Set up your meal planning preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                placeholder="e.g., Weekly Healthy Meals"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Dietary Preferences</CardTitle>
            <CardDescription>
              Tell us about your dietary needs and restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableDiets.map((diet) => (
                  <Badge
                    key={diet}
                    variant={dietaryRestrictions.includes(diet) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      dietaryRestrictions.includes(diet)
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => toggleDiet(diet)}
                  >
                    {diet.charAt(0).toUpperCase() + diet.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Health Goals</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableGoals.map((goal) => (
                  <Badge
                    key={goal}
                    variant={healthGoals.includes(goal) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      healthGoals.includes(goal)
                        ? 'bg-blue-500 text-white'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Food Dislikes */}
        <Card className="bg-white/70 backdrop-blur-sm border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Food Dislikes</CardTitle>
            <CardDescription>
              Add foods you want to avoid in your meal plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., mushrooms, cilantro, spicy food..."
                value={newDislike}
                onChange={(e) => setNewDislike(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDislike()}
                className="border-red-200 focus:border-red-400"
              />
              <Button
                onClick={addDislike}
                size="sm"
                className="bg-red-500 hover:bg-red-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {dislikes.length > 0 && (
              <div>
                <Label className="text-sm text-gray-600">Your dislikes:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dislikes.map((dislike) => (
                    <Badge
                      key={dislike}
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => removeDislike(dislike)}
                    >
                      {dislike}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click on any item to remove it
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Generate Your Plan</CardTitle>
            <CardDescription>
              Create a personalized meal plan with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateMealPlan}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isGenerating ? "Generating Your Plan..." : "Generate AI Meal Plan"}
            </Button>
            
            {isGenerating && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                  <span>Analyzing your preferences...</span>
                </div>
                <div className="text-xs text-gray-500">
                  This may take a few moments while we create your personalized meal plan.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MealPlanCreator;
