import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Sparkles, X, Plus, ChefHat, Clock, DollarSign, ArrowLeft, ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface MealPlanCreatorStepperProps {
  initialData?: any;
  onPlanCreated: (plan: any) => void;
  onBack: () => void;
  isEditing?: boolean;
}

const MealPlanCreatorStepper = ({ initialData, onPlanCreated, onBack, isEditing = false }: MealPlanCreatorStepperProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [planName, setPlanName] = useState(initialData?.name || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [numberOfDays, setNumberOfDays] = useState(initialData?.numberOfDays || initialData?.numberOfWeeks * 7 || 7);
  const [numberOfPersons, setNumberOfPersons] = useState(initialData?.numberOfPersons || 1);
  const [mealsPerDay, setMealsPerDay] = useState(initialData?.mealsPerDay || 3);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialData?.dietaryRestrictions || []);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>(initialData?.cuisinePreferences || []);
  const [allergiesIntolerances, setAllergiesIntolerances] = useState<string[]>(initialData?.allergiesIntolerances || []);
  const [additionalAllergies, setAdditionalAllergies] = useState(initialData?.additionalAllergies || "");
  const [maxCookTime, setMaxCookTime] = useState(initialData?.maxCookTime || 30);
  const [cookingSkillLevel, setCookingSkillLevel] = useState(initialData?.cookingSkillLevel || "");
  const [budgetRange, setBudgetRange] = useState(initialData?.budgetRange || "");
  const [dislikes, setDislikes] = useState<string[]>(initialData?.dislikes || []);
  const [newDislike, setNewDislike] = useState("");
  const [healthGoals, setHealthGoals] = useState<string[]>(initialData?.healthGoals || []);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { ingredients } = useUser();
  const { toast } = useToast();

  const steps = [
    { title: "Plan Details", description: "Basic information about your meal plan", shortTitle: "Details" },
    { title: "Dietary Preferences", description: "Your dietary needs and restrictions", shortTitle: "Diet" },
    { title: "Cuisine & Cooking", description: "Cuisine preferences and cooking constraints", shortTitle: "Cuisine" },
    { title: "Food Preferences", description: "Foods you like and dislike (optional)", shortTitle: "Prefs" },
    { title: "Generate Plan", description: "Review and create your meal plan", shortTitle: "Generate" }
  ];

  const availableDiets = [
    "vegetarian", "vegan", "keto", "paleo", "mediterranean", 
    "low-carb", "gluten-free", "dairy-free", "pescatarian"
  ];

  const availableCuisines = [
    "italian", "mexican", "asian", "indian", "mediterranean", 
    "american", "french", "thai", "japanese", "chinese", "korean", "greek"
  ];

  const availableAllergies = [
    "nuts", "peanuts", "shellfish", "fish", "eggs", "dairy", 
    "soy", "gluten", "sesame", "sulfites"
  ];

  const availableGoals = [
    "weight-loss", "muscle-gain", "maintain-weight", "heart-health", 
    "diabetes-friendly", "high-protein", "low-sodium"
  ];

  const cookTimesOptions = [15, 30, 45, 60];
  const cookingSkillLevels = ["beginner", "intermediate", "advanced", "expert"];
  const budgetRanges = ["low", "medium", "high"];

  const calculateEndDate = (start: string, days: number) => {
    if (!start) return "";
    const startDateObj = new Date(start);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + days - 1);
    return endDateObj.toISOString().split('T')[0];
  };

  const endDate = calculateEndDate(startDate, numberOfDays);

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

  const toggleCuisine = (cuisine: string) => {
    setCuisinePreferences(prev =>
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergiesIntolerances(prev =>
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleGoal = (goal: string) => {
    setHealthGoals(prev =>
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return planName && startDate && numberOfDays >= 1 && numberOfPersons >= 1 && mealsPerDay >= 1;
      case 1:
        return true; // Dietary preferences are optional
      case 2:
        return cookingSkillLevel && budgetRange;
      case 3:
        return true; // Food preferences are optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1 && canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateMealPlan = async () => {
    if (!planName || !startDate || numberOfDays < 1 || numberOfPersons < 1 || mealsPerDay < 1 || !cookingSkillLevel || !budgetRange) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating meal plan with preferences:', {
        planName,
        startDate,
        endDate,
        numberOfDays,
        numberOfPersons,
        mealsPerDay,
        dietaryRestrictions,
        cuisinePreferences,
        allergiesIntolerances,
        additionalAllergies,
        maxCookTime,
        cookingSkillLevel,
        budgetRange,
        dislikes,
        healthGoals,
        availableIngredients: ingredients
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      const allMeals = [];
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      const sampleMeals = [
        {
          name: "Mediterranean Quinoa Bowl",
          type: "lunch",
          calories: 450,
          prepTime: 20,
          servings: numberOfPersons,
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
          name: "Grilled Salmon with Asparagus",
          type: "dinner",
          calories: 380,
          prepTime: 25,
          servings: numberOfPersons,
          difficulty: "medium",
          ingredients: ["salmon fillets", "asparagus", "lemon", "garlic", "olive oil"],
          instructions: [
            "Season salmon with salt and pepper",
            "Grill salmon for 4-5 minutes per side",
            "Sauté asparagus with garlic",
            "Serve with lemon wedges"
          ]
        },
        {
          name: "Overnight Oats with Berries",
          type: "breakfast",
          calories: 320,
          prepTime: 5,
          servings: numberOfPersons,
          difficulty: "easy",
          ingredients: ["rolled oats", "milk", "greek yogurt", "honey", "mixed berries"],
          instructions: [
            "Mix oats with milk and yogurt",
            "Add honey to taste",
            "Refrigerate overnight",
            "Top with berries before serving"
          ]
        },
        {
          name: "Thai Green Curry",
          type: "dinner",
          calories: 420,
          prepTime: 35,
          servings: numberOfPersons,
          difficulty: "intermediate",
          ingredients: ["chicken breast", "green curry paste", "coconut milk", "bell peppers", "basil"],
          instructions: [
            "Cut chicken into pieces",
            "Sauté curry paste in oil",
            "Add chicken and cook through",
            "Add coconut milk and vegetables",
            "Simmer until tender"
          ]
        }
      ];

      for (let day = 1; day <= numberOfDays; day++) {
        for (let mealIndex = 0; mealIndex < mealsPerDay; mealIndex++) {
          const mealType = mealTypes[mealIndex] || 'snack';
          const baseMeal = sampleMeals[Math.floor(Math.random() * sampleMeals.length)];
          
          allMeals.push({
            id: `${day}-${mealIndex}`,
            ...baseMeal,
            type: mealType,
            day,
            date: new Date(new Date(startDate).getTime() + ((day - 1)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }
      }

      const mockMealPlan = {
        id: isEditing ? initialData?.id : Date.now().toString(),
        name: planName,
        startDate,
        endDate,
        numberOfDays,
        numberOfPersons,
        mealsPerDay,
        dietaryRestrictions,
        cuisinePreferences,
        allergiesIntolerances,
        additionalAllergies,
        maxCookTime,
        cookingSkillLevel,
        budgetRange,
        dislikes,
        healthGoals,
        meals: allMeals
      };

      onPlanCreated(mockMealPlan);
      
      toast({
        title: isEditing ? "Meal Plan Updated!" : "Meal Plan Generated!",
        description: `Your personalized meal plan "${planName}" is ready for ${numberOfDays} day${numberOfDays > 1 ? 's' : ''} and ${numberOfPersons} person${numberOfPersons > 1 ? 's' : ''}.`,
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-purple-700 text-lg sm:text-xl">Plan Details</CardTitle>
              <CardDescription className="text-sm">Set up your meal planning preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  placeholder="e.g., Weekly Healthy Meals"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numberOfDays">Number of Days *</Label>
                  <Input
                    id="numberOfDays"
                    type="number"
                    min="1"
                    max="10"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfPersons">Number of Persons *</Label>
                  <Input
                    id="numberOfPersons"
                    type="number"
                    min="1"
                    max="10"
                    value={numberOfPersons}
                    onChange={(e) => setNumberOfPersons(parseInt(e.target.value) || 1)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <Label htmlFor="mealsPerDay">Meals per Day *</Label>
                  <Input
                    id="mealsPerDay"
                    type="number"
                    min="1"
                    max="6"
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(parseInt(e.target.value) || 3)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>

              {startDate && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700">
                    <strong>Plan Duration:</strong> {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {numberOfDays} day{numberOfDays > 1 ? 's' : ''} • {numberOfPersons} person{numberOfPersons > 1 ? 's' : ''} • {mealsPerDay} meal{mealsPerDay > 1 ? 's' : ''} per day
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-green-700 text-lg sm:text-xl">Dietary Preferences</CardTitle>
              <CardDescription className="text-sm">Tell us about your dietary needs and restrictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Dietary Restrictions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableDiets.map((diet) => (
                    <Badge
                      key={diet}
                      variant={dietaryRestrictions.includes(diet) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${
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
                <Label className="text-sm font-medium">Allergies & Intolerances</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableAllergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      variant={allergiesIntolerances.includes(allergy) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${
                        allergiesIntolerances.includes(allergy)
                          ? 'bg-red-500 text-white'
                          : 'border-red-300 text-red-700 hover:bg-red-50'
                      }`}
                      onClick={() => toggleAllergy(allergy)}
                    >
                      {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="additionalAllergies" className="text-sm font-medium">Additional Allergies (Optional)</Label>
                <Textarea
                  id="additionalAllergies"
                  placeholder="Please specify any other allergies or intolerances not listed above..."
                  value={additionalAllergies}
                  onChange={(e) => setAdditionalAllergies(e.target.value)}
                  className="border-red-200 focus:border-red-400 mt-2 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Health Goals</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableGoals.map((goal) => (
                    <Badge
                      key={goal}
                      variant={healthGoals.includes(goal) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${
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
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-orange-700 flex items-center gap-2 text-lg sm:text-xl">
                  <ChefHat className="h-4 w-4 sm:h-5 sm:w-5" />
                  Cuisine Preferences
                </CardTitle>
                <CardDescription className="text-sm">Select your favorite cuisines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableCuisines.map((cuisine) => (
                    <Badge
                      key={cuisine}
                      variant={cuisinePreferences.includes(cuisine) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${
                        cuisinePreferences.includes(cuisine)
                          ? 'bg-orange-500 text-white'
                          : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                      }`}
                      onClick={() => toggleCuisine(cuisine)}
                    >
                      {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-blue-700 flex items-center gap-2 text-lg sm:text-xl">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  Cooking Preferences
                </CardTitle>
                <CardDescription className="text-sm">Set your cooking constraints and skill level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Max Cook Time</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cookTimesOptions.map((time) => (
                      <Button
                        key={time}
                        variant={maxCookTime === time ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          maxCookTime === time
                            ? 'bg-blue-500 text-white'
                            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                        }`}
                        onClick={() => setMaxCookTime(time)}
                      >
                        {time} min
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Cooking Skill Level *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cookingSkillLevels.map((level) => (
                      <Button
                        key={level}
                        variant={cookingSkillLevel === level ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          cookingSkillLevel === level
                            ? 'bg-blue-500 text-white'
                            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                        }`}
                        onClick={() => setCookingSkillLevel(level)}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    Budget Range *
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {budgetRanges.map((range) => (
                      <Button
                        key={range}
                        variant={budgetRange === range ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          budgetRange === range
                            ? 'bg-blue-500 text-white'
                            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                        }`}
                        onClick={() => setBudgetRange(range)}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <Card className="bg-white/70 backdrop-blur-sm border-red-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-700 text-lg sm:text-xl">Food Preferences (Optional)</CardTitle>
              <CardDescription className="text-sm">Add foods you want to avoid in your meal plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., mushrooms, cilantro, spicy food..."
                  value={newDislike}
                  onChange={(e) => setNewDislike(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDislike()}
                  className="border-red-200 focus:border-red-400 text-sm"
                />
                <Button
                  onClick={addDislike}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 px-3"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
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
                        className="cursor-pointer text-xs"
                        onClick={() => removeDislike(dislike)}
                      >
                        {dislike}
                        <X className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
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
        );

      case 4:
        return (
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-orange-700 text-lg sm:text-xl">Generate Your Plan</CardTitle>
              <CardDescription className="text-sm">Review your preferences and create your personalized meal plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Plan Summary:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <p>• <strong>Name:</strong> {planName}</p>
                  <p>• <strong>Duration:</strong> {numberOfDays} day{numberOfDays > 1 ? 's' : ''}</p>
                  <p>• <strong>People:</strong> {numberOfPersons} person{numberOfPersons > 1 ? 's' : ''}</p>
                  <p>• <strong>Meals per day:</strong> {mealsPerDay}</p>
                  <p>• <strong>Skill level:</strong> {cookingSkillLevel}</p>
                  <p>• <strong>Budget:</strong> {budgetRange}</p>
                </div>
                {dietaryRestrictions.length > 0 && (
                  <p className="text-xs sm:text-sm text-gray-600">• <strong>Dietary restrictions:</strong> {dietaryRestrictions.join(', ')}</p>
                )}
              </div>
              
              <Button
                onClick={generateMealPlan}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm sm:text-lg py-4 sm:py-6"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {isGenerating ? "Generating Your Plan..." : (isEditing ? "Update AI Meal Plan" : "Generate AI Meal Plan")}
              </Button>
              
              {isGenerating && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-500"></div>
                    <span>Analyzing your preferences...</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    This may take a few moments while we create your personalized meal plan.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Cooking Animation Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="relative mb-6">
              {/* Main cooking pot */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
                <div className="w-full h-full bg-gray-800 rounded-full animate-pulse"></div>
                {/* Steam animation */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-4 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                </div>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-x-2">
                  <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 translate-x-2">
                  <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              
              {/* Chef hat */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 animate-bounce" />
              </div>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Cooking Your Perfect Plan</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Our AI chef is preparing your personalized meal plan...</p>
            
            {/* Progress indicators */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} size="sm" className="text-xs sm:text-sm">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{isEditing ? "Edit Meal Plan" : "AI Meal Plan"}</h2>
          <div></div>
        </div>

        {/* Desktop Stepper */}
        <div className="hidden sm:flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <div className="text-center mt-2">
                <p className={`text-xs font-medium ${
                  index <= currentStep ? 'text-purple-700' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 hidden lg:block">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-0.5 mt-4 ${
                  index < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile Stepper */}
        <div className="sm:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-sm font-medium text-purple-700">
              {steps[currentStep].shortTitle}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] sm:min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 sm:pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button
              onClick={nextStep}
              disabled={!canGoNext()}
              className="flex items-center gap-1 sm:gap-2 bg-purple-500 hover:bg-purple-600 text-xs sm:text-sm px-3 sm:px-4"
              size="sm"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default MealPlanCreatorStepper;
