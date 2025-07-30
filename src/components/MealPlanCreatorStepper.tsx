import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, Calendar, Users, Clock, ChefHat, DollarSign, Globe } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { createMealPlan, transformApiMealPlanToLocal } from "@/services/mealPlanService";

interface MealPlanCreatorStepperProps {
  onPlanCreated: (plan: any) => void;
  onBack: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const MealPlanCreatorStepper = ({ onPlanCreated, onBack, initialData, isEditing }: MealPlanCreatorStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [planData, setPlanData] = useState({
    planName: initialData?.name || "",
    planDescription: initialData?.description || "",
    startDate: initialData?.startDate || "",
    numberOfDays: initialData?.preferences?.numberOfDays || 7,
    numberOfPersons: initialData?.preferences?.numberOfPersons || initialData?.preferences?.people || 1,
    mealsPerDay: initialData?.preferences?.mealsPerDay || 3,
    dietaryRestrictions: initialData?.preferences?.dietaryRestrictions || [],
    cuisinePreferences: initialData?.preferences?.cuisinePreferences || [],
    allergiesIntolerances: initialData?.preferences?.allergiesIntolerance || [],
    additionalAllergies: "",
    maxCookTime: initialData?.preferences?.maxCookingTime || 30,
    cookingSkillLevel: initialData?.preferences?.cookingSkillLevel || "",
    budgetRange: initialData?.preferences?.budgetRange || "",
    dislikes: [],
    healthGoals: initialData?.preferences?.healthGoals || [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { user } = useUser();
  const { language } = useLanguage();
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Plan Details", description: "Basic information about your meal plan" },
    { id: 2, title: "Dietary Preferences", description: "Your dietary needs and restrictions" },
    { id: 3, title: "Cuisine & Cooking", description: "Cuisine preferences and cooking constraints" },
    { id: 4, title: "Food Preferences", description: "Foods you like and dislike (optional)" },
    { id: 5, title: "Generate Plan", description: "Review and create your meal plan" }
  ];

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

  const handleDataChange = (stepData: any) => {
    setPlanData(prev => ({ ...prev, ...stepData }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Plan Details</span>
              </CardTitle>
              <CardDescription>
                Basic information about your meal plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Name */}
              <div>
                <label htmlFor="planName" className="block text-sm font-medium text-gray-700">Plan Name</label>
                <input
                  type="text"
                  id="planName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.planName}
                  onChange={(e) => handleDataChange({ planName: e.target.value })}
                />
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.startDate}
                  onChange={(e) => handleDataChange({ startDate: e.target.value })}
                />
              </div>

              {/* Number of Days */}
              <div>
                <label htmlFor="numberOfDays" className="block text-sm font-medium text-gray-700">Number of Days</label>
                <input
                  type="number"
                  id="numberOfDays"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.numberOfDays}
                  onChange={(e) => handleDataChange({ numberOfDays: parseInt(e.target.value) })}
                />
              </div>

              {/* Number of Persons */}
              <div>
                <label htmlFor="numberOfPersons" className="block text-sm font-medium text-gray-700">Number of Persons</label>
                <input
                  type="number"
                  id="numberOfPersons"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.numberOfPersons}
                  onChange={(e) => handleDataChange({ numberOfPersons: parseInt(e.target.value) })}
                />
              </div>

              {/* Meals Per Day */}
              <div>
                <label htmlFor="mealsPerDay" className="block text-sm font-medium text-gray-700">Meals Per Day</label>
                <input
                  type="number"
                  id="mealsPerDay"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.mealsPerDay}
                  onChange={(e) => handleDataChange({ mealsPerDay: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-green-600" />
                <span>Dietary Preferences</span>
              </CardTitle>
              <CardDescription>
                Your dietary needs and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
                <div className="mt-2 space-y-2">
                  {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo"].map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        id={`dietary-${option}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={planData.dietaryRestrictions.includes(option)}
                        onChange={(e) => {
                          const updatedRestrictions = e.target.checked
                            ? [...planData.dietaryRestrictions, option]
                            : planData.dietaryRestrictions.filter((item) => item !== option);
                          handleDataChange({ dietaryRestrictions: updatedRestrictions });
                        }}
                      />
                      <label htmlFor={`dietary-${option}`} className="ml-3 block text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies Intolerances */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergies & Intolerances</label>
                <div className="mt-2 space-y-2">
                  {["Nuts", "Shellfish", "Soy", "Eggs", "Fish"].map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        id={`allergy-${option}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={planData.allergiesIntolerances.includes(option)}
                        onChange={(e) => {
                          const updatedAllergies = e.target.checked
                            ? [...planData.allergiesIntolerances, option]
                            : planData.allergiesIntolerances.filter((item) => item !== option);
                          handleDataChange({ allergiesIntolerances: updatedAllergies });
                        }}
                      />
                      <label htmlFor={`allergy-${option}`} className="ml-3 block text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Cuisine & Cooking</span>
              </CardTitle>
              <CardDescription>
                Cuisine preferences and cooking constraints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cuisine Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Cuisine Preferences</label>
                <div className="mt-2 space-y-2">
                  {["Italian", "Mexican", "Asian", "American", "Indian"].map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        id={`cuisine-${option}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={planData.cuisinePreferences.includes(option)}
                        onChange={(e) => {
                          const updatedCuisines = e.target.checked
                            ? [...planData.cuisinePreferences, option]
                            : planData.cuisinePreferences.filter((item) => item !== option);
                          handleDataChange({ cuisinePreferences: updatedCuisines });
                        }}
                      />
                      <label htmlFor={`cuisine-${option}`} className="ml-3 block text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Max Cook Time */}
              <div>
                <label htmlFor="maxCookTime" className="block text-sm font-medium text-gray-700">Max Cook Time (minutes)</label>
                <input
                  type="number"
                  id="maxCookTime"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.maxCookTime}
                  onChange={(e) => handleDataChange({ maxCookTime: parseInt(e.target.value) })}
                />
              </div>

              {/* Cooking Skill Level */}
              <div>
                <label htmlFor="cookingSkillLevel" className="block text-sm font-medium text-gray-700">Cooking Skill Level</label>
                <select
                  id="cookingSkillLevel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.cookingSkillLevel}
                  onChange={(e) => handleDataChange({ cookingSkillLevel: e.target.value })}
                >
                  <option value="">Select Skill Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700">Budget Range</label>
                <select
                  id="budgetRange"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.budgetRange}
                  onChange={(e) => handleDataChange({ budgetRange: e.target.value })}
                >
                  <option value="">Select Budget Range</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
                <span>Food Preferences</span>
              </CardTitle>
              <CardDescription>
                Foods you like and dislike (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dislikes */}
              <div>
                <label htmlFor="dislikes" className="block text-sm font-medium text-gray-700">Dislikes (comma-separated)</label>
                <input
                  type="text"
                  id="dislikes"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.dislikes}
                  onChange={(e) => handleDataChange({ dislikes: e.target.value.split(',') })}
                />
              </div>

              {/* Health Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Health Goals</label>
                <div className="mt-2 space-y-2">
                  {["Weight Loss", "Muscle Gain", "Heart Health", "Diabetes Friendly"].map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        id={`health-${option}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={planData.healthGoals.includes(option)}
                        onChange={(e) => {
                          const updatedGoals = e.target.checked
                            ? [...planData.healthGoals, option]
                            : planData.healthGoals.filter((item) => item !== option);
                          handleDataChange({ healthGoals: updatedGoals });
                        }}
                      />
                      <label htmlFor={`health-${option}`} className="ml-3 block text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Generate Your Plan</span>
              </CardTitle>
              <CardDescription>
                Review your preferences and create your personalized meal plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Plan Summary:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Name:</strong> {planData.planName}</p>
                    <p><strong>People:</strong> {planData.numberOfPersons} persons</p>
                    <p><strong>Duration:</strong> {planData.numberOfDays} days</p>
                    <p><strong>Meals per day:</strong> {planData.mealsPerDay}</p>
                  </div>
                  <div>
                    <p><strong>Skill level:</strong> {planData.cookingSkillLevel}</p>
                    <p><strong>Budget:</strong> {planData.budgetRange}</p>
                    <p><strong>Dietary restrictions:</strong> {planData.dietaryRestrictions.length > 0 ? planData.dietaryRestrictions.join(', ') : 'None'}</p>
                    <p className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <strong>Language:</strong> {getLanguageDisplayName(language)}
                    </p>
                  </div>
                </div>
              </div>

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
        );
      
      default:
        return null;
    }
  };

  const generateMealPlan = async () => {
    if (!planData.planName || !planData.startDate || !planData.cookingSkillLevel || !planData.budgetRange) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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
      const getLanguageName = (languageCode: string) => {
        const languageMap: { [key: string]: string } = {
          'en': 'english',
          'es': 'spanish',
          'pt': 'portuguese',
          'fr': 'french',
          'de': 'german',
          'it': 'italian'
        };
        return languageMap[languageCode.toLowerCase()] || 'english';
      };

      const requestData = {
        duration: planData.numberOfDays,
        numberPeople: planData.numberOfPersons,
        mealsPerDay: planData.mealsPerDay,
        dietaryRestrictions: planData.dietaryRestrictions,
        cuisinePreferences: planData.cuisinePreferences,
        allergiesIntolerance: planData.allergiesIntolerances,
        dislikes: [...planData.dislikes, planData.additionalAllergies].filter(item => item.trim()).join(', '),
        maxCookingTime: planData.maxCookTime,
        cookingSkillLevel: planData.cookingSkillLevel,
        budgetRange: planData.budgetRange,
        healthGoals: planData.healthGoals,
        language: getLanguageName(language),
        user_id: user.id,
        start_date: new Date(planData.startDate).toISOString(),
        plan_name: planData.planName,
        plan_description: planData.planDescription || `Personalized meal plan for ${planData.numberOfPersons} person${planData.numberOfPersons > 1 ? 's' : ''}`
      };

      console.log('Creating meal plan with data:', requestData);

      const apiResponse = await createMealPlan(requestData);
      const transformedPlan = transformApiMealPlanToLocal(apiResponse);

      onPlanCreated(transformedPlan);
      
      toast({
        title: "Meal Plan Generated!",
        description: `Your personalized meal plan "${planData.planName}" has been created successfully.`,
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Meal Planner</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h1 className="text-xl font-semibold">{isEditing ? 'Edit' : 'Create'} AI Meal Plan</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        <Progress value={(currentStep / steps.length) * 100} className="w-full" />
        <div className="flex justify-between text-xs text-gray-500">
          {steps.map((step) => (
            <span key={step.id} className={currentStep >= step.id ? 'text-purple-600 font-medium' : ''}>
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button 
            onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MealPlanCreatorStepper;
