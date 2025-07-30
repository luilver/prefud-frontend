import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Sparkles, X, Plus, ChefHat, Clock, DollarSign } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { createMealPlan, transformApiMealPlanToLocal } from "@/services/mealPlanService";

interface MealPlanCreatorProps {
  onPlanCreated: (plan: any) => void;
  onBack: () => void;
}

const MealPlanCreator = ({ onPlanCreated, onBack }: MealPlanCreatorProps) => {
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [allergiesIntolerances, setAllergiesIntolerances] = useState<string[]>([]);
  const [additionalAllergies, setAdditionalAllergies] = useState("");
  const [maxCookTime, setMaxCookTime] = useState(30);
  const [cookingSkillLevel, setCookingSkillLevel] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [newDislike, setNewDislike] = useState("");
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { user } = useUser();
  const { language } = useLanguage();
  const { toast } = useToast();

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

  const getLanguageName = (languageCode: string) => {
    console.log('Current language code:', languageCode);
    const languageMap: { [key: string]: string } = {
      'en': 'english',
      'es': 'spanish',
      'pt': 'portuguese'
    };
    const mappedLanguage = languageMap[languageCode] || 'english';
    console.log('Mapped language:', mappedLanguage);
    return mappedLanguage;
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

    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a meal plan.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare the API request data
      const requestData = {
        duration: numberOfDays,
        numberPeople: numberOfPersons,
        mealsPerDay: mealsPerDay,
        dietaryRestrictions: dietaryRestrictions,
        cuisinePreferences: cuisinePreferences,
        allergiesIntolerance: allergiesIntolerances,
        dislikes: [...dislikes, additionalAllergies].filter(item => item.trim()).join(', '),
        maxCookingTime: maxCookTime,
        cookingSkillLevel: cookingSkillLevel,
        budgetRange: budgetRange,
        healthGoals: healthGoals,
        language: getLanguageName(language),
        user_id: user.id,
        start_date: new Date(startDate).toISOString(),
        plan_name: planName,
        plan_description: planDescription || `Personalized meal plan for ${numberOfPersons} person${numberOfPersons > 1 ? 's' : ''}`
      };

      console.log('Creating meal plan with data:', requestData);

      const apiResponse = await createMealPlan(requestData);
      console.log('API Response received:', apiResponse);

      // Transform the API response to match our local format
      const transformedPlan = transformApiMealPlanToLocal(apiResponse);
      console.log('Transformed plan:', transformedPlan);

      onPlanCreated(transformedPlan);
      
      toast({
        title: "Meal Plan Generated!",
        description: `Your personalized meal plan "${planName}" has been created successfully.`,
      });

    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateEndDate = (start: string, days: number) => {
    if (!start) return "";
    const startDateObj = new Date(start);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + days - 1);
    return endDateObj.toISOString().split('T')[0];
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
              <Label htmlFor="planDescription">Plan Description (Optional)</Label>
              <Textarea
                id="planDescription"
                placeholder="Describe your meal plan goals or preferences..."
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
                rows={2}
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numberOfDays">Number of Days *</Label>
                <Input
                  id="numberOfDays"
                  type="number"
                  min="1"
                  max="30"
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
                  <strong>Plan Duration:</strong> {new Date(startDate).toLocaleDateString()} - {new Date(calculateEndDate(startDate, numberOfDays)).toLocaleDateString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {numberOfDays} day{numberOfDays > 1 ? 's' : ''} • {numberOfPersons} person{numberOfPersons > 1 ? 's' : ''} • {mealsPerDay} meal{mealsPerDay > 1 ? 's' : ''} per day
                </p>
              </div>
            )}
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
              <Label>Allergies & Intolerances</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableAllergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant={allergiesIntolerances.includes(allergy) ? "default" : "outline"}
                    className={`cursor-pointer ${
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
              <Label htmlFor="additionalAllergies">Additional Allergies</Label>
              <Textarea
                id="additionalAllergies"
                placeholder="Please specify any other allergies or intolerances not listed above..."
                value={additionalAllergies}
                onChange={(e) => setAdditionalAllergies(e.target.value)}
                className="border-red-200 focus:border-red-400 mt-2"
                rows={3}
              />
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

        {/* Cuisine Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Cuisine Preferences
            </CardTitle>
            <CardDescription>
              Select your favorite cuisines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableCuisines.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={cuisinePreferences.includes(cuisine) ? "default" : "outline"}
                  className={`cursor-pointer ${
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

        {/* Cooking Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cooking Preferences
            </CardTitle>
            <CardDescription>
              Set your cooking constraints and skill level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Max Cook Time</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cookTimesOptions.map((time) => (
                  <Badge
                    key={time}
                    variant={maxCookTime === time ? "default" : "outline"}
                    className={`cursor-pointer ${
                      maxCookTime === time
                        ? 'bg-blue-500 text-white'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => setMaxCookTime(time)}
                  >
                    {time} min
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Cooking Skill Level</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cookingSkillLevels.map((level) => (
                  <Badge
                    key={level}
                    variant={cookingSkillLevel === level ? "default" : "outline"}
                    className={`cursor-pointer ${
                      cookingSkillLevel === level
                        ? 'bg-blue-500 text-white'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => setCookingSkillLevel(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Range
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {budgetRanges.map((range) => (
                  <Badge
                    key={range}
                    variant={budgetRange === range ? "default" : "outline"}
                    className={`cursor-pointer ${
                      budgetRange === range
                        ? 'bg-blue-500 text-white'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => setBudgetRange(range)}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
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
