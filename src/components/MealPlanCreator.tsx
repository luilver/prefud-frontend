import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Sparkles, X, Plus, ChefHat, Clock, DollarSign, Globe } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { createMealPlan, transformApiMealPlanToLocal } from "@/services/mealPlanService";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import MealPlanView from "./MealPlanView";
import MealPlanSuccessModal from "./MealPlanSuccessModal";
import SubscriptionUpgradeModal from "./SubscriptionUpgradeModal";

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
   const [numberOfKidsLessThan5, setNumberOfKidsLessThan5] = useState(0);
    const [numberFrom5to12, setNumberFrom5to12] = useState(0);
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
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [showPlanView, setShowPlanView] = useState(false);
  const [createdPlan, setCreatedPlan] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { user, refreshMealPlans } = useUser();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { showLoader, hideLoader, LoaderComponent } = useCookingLoader();
  const { t } = useLanguage();

  const availableDiets = [
    "vegetarian", "vegan", "keto", "paleo", "mediterranean", 
    "low-carb", "gluten-free", "dairy-free", "pescatarian", "autism"
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
      'pt': 'portuguese',
      'fr': 'french',
      'de': 'german',
      'it': 'italian'
    };
    const mappedLanguage = languageMap[languageCode.toLowerCase()] || 'english';
    console.log('Mapped language:', mappedLanguage);
    return mappedLanguage;
  };

  const getLanguageDisplayName = (languageCode: string) => {
    const displayMap: { [key: string]: string } = {
      'en': 'English',
      'es': 'Español',
      'pt': 'Português', 
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano'
    };
    return displayMap[languageCode.toLowerCase()] || 'English';
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

    // Show the cooking loader
    showLoader("Analyzing your preferences and creating your perfect meal plan...");

    // Set up timeout for 3 minutes (180 seconds)
    const timeout = setTimeout(() => {
      console.log('Meal plan generation timed out after 3 minutes');
      hideLoader();
      toast({
        title: "Still Cooking!",
        description: "Your meal plan is being prepared in the background. Please check your meal plans in a few minutes.",
        duration: 5000,
      });
      // Navigate back and refresh
      onBack();
      refreshMealPlans();
    }, 180000); // 3 minutes

    setTimeoutId(timeout);

    try {
      // Prepare the API request data with correct language mapping
      const requestData = {
        duration: numberOfDays,
        numberPeople: numberOfPersons,
        numberKidsLessThan5: numberOfKidsLessThan5,
        numberKids5To12: numberFrom5to12,
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
        start_date: startDate,
        plan_name: planName,
        plan_description: planDescription || `Personalized meal plan for ${numberOfPersons} person${numberOfPersons > 1 ? 's' : ''}`
      };

      console.log('Creating meal plan with data:', requestData);
      console.log('Language being sent:', requestData.language);

      const apiResponse = await createMealPlan(requestData);
      console.log('API Response received:', apiResponse);

      // Clear the timeout since we got a response
      if (timeout) {
        clearTimeout(timeout);
        setTimeoutId(null);
      }

      // Hide the loader
      hideLoader();

      // Check if the response indicates success - API returns the meal plan object directly
      const isSuccess = apiResponse && apiResponse._id && apiResponse.plan;

      if (!isSuccess) {
        throw new Error('Failed to create meal plan - invalid response format');
      }

      // Transform the API response to match our local format
      const transformedPlan = transformApiMealPlanToLocal(apiResponse);
      console.log('Transformed plan:', transformedPlan);

      // Store the created plan
      setCreatedPlan(transformedPlan);
      
      // Show success toast immediately
      toast({
        title: "🎉 Meal Plan Created Successfully!",
        description: `Your meal plan is ready to explore.`,
        duration: 8000,
      });

      console.log('Showing success modal with plan:', transformedPlan);
      
      // Show the success modal
      setShowSuccessModal(true);

      // Add to context
      onPlanCreated(transformedPlan);

      // Refresh meal plans from server
      await refreshMealPlans();

    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      console.log('Error code:', error.code);
      
      // Clear the timeout
      if (timeout) {
        clearTimeout(timeout);
        setTimeoutId(null);
      }
      
      // Hide the loader
      hideLoader();
      
      // Handle specific subscription error
      if (
        error?.code === "03" ||
        error?.response?.data?.code === "03" ||
        (typeof error?.message === "string" && error.message.includes("No meal plans available according to your subscription"))
      ) {
        console.log('Showing upgrade modal for meal plan code 03');
        setShowUpgradeModal(true);
      } else {
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : "Failed to generate meal plan. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const calculateEndDate = (start: string, days: number) => {
    if (!start) return "";
    const startDateObj = new Date(start);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + days - 1);
    return endDateObj.toISOString().split('T')[0];
  };

  const handleBackFromPlanView = () => {
    setShowPlanView(false);
    onBack(); // Navigate back to meal planner
  };

  const handleEditPlan = () => {
    // For now, just go back to the creator form - user can edit by creating a new plan
    setShowPlanView(false);
    // Stay on the creator form so user can modify settings
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setCreatedPlan(null);
    // Navigate back to meal planner
    onBack();
  };

  const handleViewSuccessPlan = () => {
    if (createdPlan) {
      setShowSuccessModal(false);
      setShowPlanView(true);
    }
  };

  if (showPlanView && createdPlan) {
    return (
      <MealPlanView
        plan={createdPlan}
        onBack={handleBackFromPlanView}
        onEdit={handleEditPlan}
      />
    );
  }

  return (
    <div className="space-y-6">
      <LoaderComponent />
      
      {/* Success Modal */}
      <MealPlanSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onViewPlan={handleViewSuccessPlan}
        mealPlan={createdPlan ? {
          name: createdPlan.name || planName,
          numberOfDays: numberOfDays,
          numberOfPersons: numberOfPersons,
          mealsPerDay: mealsPerDay
        } : undefined}
      />
      
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← {t('mealPlanCreator.backToMeal') || 'Back to Meal Planner'}
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">{t('mealPlanCreator.title') || 'Create AI Meal Plan'}</h2>
        <div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan Details */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700">{t('mealPlanCreator.planDetails') || 'Plan Details'}</CardTitle>
            <CardDescription>
              {t('mealPlanCreator.setUpYourMeal') || 'Set up your meal planning preferences'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="planName">{t('mealPlanCreator.planName') || 'Plan Name'} *</Label>
              <Input
                id="planName"
                placeholder={t('mealPlanCreator.planNamePlaceholder') || 'e.g., Weekly Healthy Meals'}
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>

            <div>
              <Label htmlFor="planDescription">{t('mealPlanCreator.planDescription') || 'Plan Description (Optional)'}</Label>
              <Textarea
                id="planDescription"
                placeholder={t('mealPlanCreator.planDescriptionPlaceholder') || 'Describe your meal plan goals or preferences...'}
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="startDate">{t('mealPlanCreator.startDate') || 'Start Date'} *</Label>
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
                <Label htmlFor="numberOfDays">{t('mealPlanCreator.numberOfDays') || 'Number of Days'} *</Label>
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
                <Label htmlFor="numberOfPersons">{t('mealPlanCreator.numberOfPersons') || 'Number of Persons'} *</Label>
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
                <Label htmlFor="numberOfPersons">{t('mealPlanCreator.numberOfPersons') || 'Number of Kids less than 5 years'} *</Label>
                <Input
                  id="numberOfKidsLessThan5"
                  type="number"
                  min="0"
                  max="10"
                  value={numberOfKidsLessThan5}
                  onChange={(e) => setNumberOfKidsLessThan5(parseInt(e.target.value) || 0)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
              <div>
                <Label htmlFor="numberOfPersons">{t('mealPlanCreator.numberOfPersons') || 'Number of Kids from 5 to 12 years'} *</Label>
                <Input
                  id="numberFrom5to12"
                  type="number"
                  min="0"
                  max="10"
                  value={numberFrom5to12}
                  onChange={(e) => setNumberFrom5to12(parseInt(e.target.value) || 0)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
              <div>
                <Label htmlFor="mealsPerDay">{t('mealPlanCreator.mealsPerDay') || 'Meals per Day'} *</Label>
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
                  <strong>{t('mealPlanCreator.planDuration') || 'Plan Duration'}:</strong> {new Date(startDate).toLocaleDateString()} - {new Date(calculateEndDate(startDate, numberOfDays)).toLocaleDateString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {numberOfDays} {t('mealPlanner.day') || 'day'}{numberOfDays > 1 ? 's' : ''} • {numberOfPersons} {t('mealPlanCreator.person') || 'person'}{numberOfPersons > 1 ? 's' : ''} • {mealsPerDay} {t('mealPlanCreator.meal') || 'meal'}{mealsPerDay > 1 ? 's' : ''} {t('mealPlanCreator.perDay') || 'per day'}
                </p>
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <strong>{t('mealPlanCreator.language') || 'Language'}:</strong> {getLanguageDisplayName(language)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">{t('mealPlanCreator.dietary.title') || 'Dietary Preferences'}</CardTitle>
            <CardDescription>
              {t('mealPlanCreator.dietary.desc') || 'Tell us about your dietary needs and restrictions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('mealPlanCreator.dietary.restrictions') || 'Dietary Restrictions'}</Label>
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
              <Label>{t('mealPlanCreator.dietary.allergies') || 'Allergies & Intolerances'}</Label>
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
              <Label htmlFor="additionalAllergies">{t('mealPlanCreator.dietary.additionalAllergies') || 'Additional Allergies'}</Label>
              <Textarea
                id="additionalAllergies"
                placeholder={t('mealPlanCreator.dietary.placeholder') || 'Please specify any other allergies or intolerances not listed above...'}
                value={additionalAllergies}
                onChange={(e) => setAdditionalAllergies(e.target.value)}
                className="border-red-200 focus:border-red-400 mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label>{t('mealPlanCreator.dietary.healthGoals') || 'Health Goals'}</Label>
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
              {t('mealPlanCreator.cuisine.title') || 'Cuisine Preferences'}
            </CardTitle>
            <CardDescription>
              {t('mealPlanCreator.cuisine.desc') || 'Select your favorite cuisines'}
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
              {t('mealPlanCreator.cooking.title') || 'Cooking Preferences'}
            </CardTitle>
            <CardDescription>
              {t('mealPlanCreator.cooking.desc') || 'Set your cooking constraints and skill level'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('mealPlanCreator.cooking.maxCook') || 'Max Cook Time'}</Label>
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
              <Label>{t('mealPlanCreator.cooking.skillLevel') || 'Cooking Skill Level'}</Label>
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
                {t('mealPlanCreator.cooking.budget') || 'Budget Range'}
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
            <CardTitle className="text-red-700">{t('mealPlanCreator.dislike.title') || 'Food Dislikes'}</CardTitle>
            <CardDescription>
              {t('mealPlanCreator.dislike.desc') || 'Add foods you want to avoid in your meal plan'}
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
                <Label className="text-sm text-gray-600">{t('mealPlanCreator.dislike.yourDislike') || 'Your dislikes'}:</Label>
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
                  {t('mealPlanCreator.dislike.clickToRemove') || 'Click on any item to remove it'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">{t('mealPlanCreator.generate.title') || 'Generate Your Plan'}</CardTitle>
            <CardDescription>
              {t('mealPlanCreator.generate.desc') || 'Create a personalized meal plan with AI'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateMealPlan}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {t('mealPlanCreator.generate.button') || 'Generate AI Meal Plan'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureType="plans"
      />
    </div>
  );
};

export default MealPlanCreator;
