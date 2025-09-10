import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  Clock,
  ChefHat,
  DollarSign,
  Globe,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  createMealPlan,
  transformApiMealPlanToLocal,
} from "@/services/mealPlanService";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import MealPlanSuccessModal from "./MealPlanSuccessModal";
import MealPlanTimeoutModal from "./MealPlanTimeoutModal";
import SubscriptionUpgradeModal from "./SubscriptionUpgradeModal";

interface MealPlanCreatorStepperProps {
  onPlanCreated: (plan: any) => void;
  onBack: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const MealPlanCreatorStepper = ({
  onPlanCreated,
  onBack,
  initialData,
  isEditing,
}: MealPlanCreatorStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [planData, setPlanData] = useState({
    planName: initialData?.name || "",
    planDescription: initialData?.description || "",
    startDate: initialData?.startDate || "",
    numberOfDays: initialData?.preferences?.numberOfDays || 7,
    numberOfPersons:
      initialData?.preferences?.numberOfPersons ||
      initialData?.preferences?.people ||
      1,
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
    numberKidsLessThan5: initialData?.preferences?.numberKidsLessThan5 || 0,
    numberKids5To12: initialData?.preferences?.numberKids5To12 || 0,
  });
  const [customCuisines, setCustomCuisines] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [createdPlan, setCreatedPlan] = useState<any>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { user, refreshMealPlans } = useUser();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { showLoader, hideLoader, LoaderComponent } = useCookingLoader();
  const { t } = useLanguage();
  const customCountryRef = useRef<HTMLInputElement | null>(null);

  const steps = [
    {
      id: 1,
      title: t("mealPlanCreator.planDetails") || "Plan Details",
      description:
        t("mealPlanCreator.planDetails.desc") ||
        "Basic information about your meal plan",
    },
    {
      id: 2,
      title: t("mealPlanCreator.dietary.title") || "Dietary Preferences",
      description:
        t("mealPlanCreator.dietary.desc") ||
        "Tell us about your dietary needs and restrictions",
    },
    {
      id: 3,
      title: t("mealPlanCreator.cuisine.label") || "Cuisine & Cooking",
      description:
        t("mealPlanCreator.cuisine.label.desc") ||
        "Cuisine preferences and cooking constraints",
    },
    {
      id: 4,
      title: t("mealPlanCreator.foodPref") || "Food Preferences",
      description:
        t("mealPlanCreator.foodPref.desc") ||
        "Foods you like and dislike (optional)",
    },
    {
      id: 5,
      title: t("mealPlanCreator.generatePlan") || "Generate Plan",
      description:
        t("mealPlanCreator.generatePlan.desc") ||
        "Review and create your meal plan",
    },
  ];

  const getLanguageDisplayName = (languageCode: string) => {
    const displayMap: { [key: string]: string } = {
      en: "English",
      es: "Español",
      pt: "Português",
      fr: "Français",
      de: "Deutsch",
      it: "Italiano",
    };
    return displayMap[languageCode.toLowerCase()] || "English";
  };

  const handleDataChange = (stepData: any) => {
    setPlanData((prev) => ({ ...prev, ...stepData }));
  };

  const addCustomCuisine = (country: string) => {
    const formattedCountry = country.trim();
    console.log('🔍 Adding custom cuisine:', formattedCountry);
    console.log('🔍 Current cuisinePreferences before:', planData.cuisinePreferences);
    console.log('🔍 Current customCuisines before:', customCuisines);
    
    if (formattedCountry) {
      // Check if it's not already in cuisinePreferences (case insensitive)
      const isAlreadyInPreferences = planData.cuisinePreferences.some(cuisine => 
        cuisine.toLowerCase() === formattedCountry.toLowerCase()
      );
      
      // Check if it's not already in customCuisines (case insensitive)
      const isAlreadyInCustom = customCuisines.some(c => 
        c.toLowerCase() === formattedCountry.toLowerCase()
      );
      
      console.log('🔍 Is already in preferences:', isAlreadyInPreferences);
      console.log('🔍 Is already in custom:', isAlreadyInCustom);
      
      if (!isAlreadyInPreferences && !isAlreadyInCustom) {
        // Add to custom cuisines for display first
        const newCustomCuisines = [...customCuisines, formattedCountry];
        setCustomCuisines(newCustomCuisines);
        
        // Add to cuisinePreferences immediately and automatically select it
        const updatedCuisines = [...planData.cuisinePreferences, formattedCountry];
        handleDataChange({ cuisinePreferences: updatedCuisines });
        
        console.log('🔍 Updated customCuisines:', newCustomCuisines);
        console.log('🔍 Updated cuisinePreferences:', updatedCuisines);
        
        toast({
          title: "Cuisine Added & Selected",
          description: `${formattedCountry} cuisine has been added and selected automatically.`,
        });
      } else {
        toast({
          title: "Already Added",
          description: `${formattedCountry} cuisine is already in your preferences.`,
        });
      }
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!planData.planName.trim()) {
          toast({
            title: "Missing Information",
            description: "Please enter a plan name.",
            variant: "destructive",
          });
          return false;
        }
        if (!planData.planDescription.trim()) {
          toast({
            title: "Missing Information",
            description: "Please enter a plan description.",
            variant: "destructive",
          });
          return false;
        }
        if (!planData.startDate) {
          toast({
            title: "Missing Information",
            description: "Please select a start date.",
            variant: "destructive",
          });
          return false;
        }
        if (planData.numberOfDays < 1) {
          toast({
            title: "Invalid Information",
            description: "Number of days must be at least 1.",
            variant: "destructive",
          });
          return false;
        }
        if (planData.numberOfPersons < 1) {
          toast({
            title: "Invalid Information",
            description: "Number of persons must be at least 1.",
            variant: "destructive",
          });
          return false;
        }
        if (planData.mealsPerDay < 1) {
          toast({
            title: "Invalid Information",
            description: "Meals per day must be at least 1.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>
                  {t("mealPlanCreator.planDetails") || "Plan Details"}
                </span>
              </CardTitle>
              <CardDescription>
                {t("mealPlanCreator.planDetails.desc") ||
                  "Basic information about your meal plan"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Name */}
              <div>
                <label
                  htmlFor="planName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.planName") || "Plan Name"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="planName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.planName}
                  onChange={(e) =>
                    handleDataChange({ planName: e.target.value })
                  }
                  placeholder={
                    t("mealPlanCreator.planNamePlaceholder") ||
                    "e.g., Weekly Healthy Meals"
                  }
                />
              </div>

              {/* Plan Description */}
              <div>
                <label
                  htmlFor="planDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.planDescription") || "Plan Description"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="planDescription"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.planDescription}
                  onChange={(e) =>
                    handleDataChange({ planDescription: e.target.value })
                  }
                  placeholder={
                    t("mealPlanCreator.planDescriptionPlaceholder") ||
                    "Describe your meal plan goals or preferences..."
                  }
                  rows={3}
                />
              </div>

              {/* Start Date */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.startDate") || "Start Date"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.startDate || ""}
                  onChange={(e) =>
                    handleDataChange({ startDate: e.target.value })
                  }
                />
              </div>

              {/* Number of Days */}
              <div>
                <label
                  htmlFor="numberOfDays"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.numberOfDays") || "Number of Days"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="numberOfDays"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.numberOfDays}
                  onChange={(e) =>
                    handleDataChange({ numberOfDays: parseInt(e.target.value) })
                  }
                  min="1"
                />
              </div>

              {/* Number of Persons */}
              <div>
                <label
                  htmlFor="numberOfPersons"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.numberOfPersons") || "Number of Persons"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="numberOfPersons"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.numberOfPersons}
                  onChange={(e) =>
                    handleDataChange({
                      numberOfPersons: parseInt(e.target.value),
                    })
                  }
                  min="1"
                />
              </div>
              {/* Number of Kids under 5 */}
              <div>
                <label
                  htmlFor="numberOfPersons"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.kidsUnder5") ||
                    "Number of Kids under 5 years"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="numberKidsLessThan5"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.numberKidsLessThan5}
                  onChange={(e) =>
                    handleDataChange({
                      numberKidsLessThan5: parseInt(e.target.value),
                    })
                  }
                  min="0"
                />
              </div>
              {/* Number of Kids from 5 to 12 */}
              <div>
                <label
                  htmlFor="numberOfPersons"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.kidsFrom5to12") ||
                    "Number of Kids from 5 to 12 years"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="numberKids5To12"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.numberKids5To12}
                  onChange={(e) =>
                    handleDataChange({
                      numberKids5To12: parseInt(e.target.value),
                    })
                  }
                  min="1"
                />
              </div>

              {/* Meals Per Day */}
              <div>
                <label
                  htmlFor="mealsPerDay"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.mealsPerDay") || "Meals per Day"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="mealsPerDay"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.mealsPerDay}
                  onChange={(e) =>
                    handleDataChange({ mealsPerDay: parseInt(e.target.value) })
                  }
                  min="1"
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
                <span>
                  {t("mealPlanCreator.dietary.title") || "Dietary Preferences"}
                </span>
              </CardTitle>
              <CardDescription>
                {t("mealPlanCreator.dietary.desc") ||
                  "Tell us about your dietary needs and restrictions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("mealPlanCreator.dietary.restrictions") ||
                    "Dietary Restrictions"}
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    {
                      key: "Vegetarian",
                      label:
                        t("mealPlanCreator.dietary.vegetarian") || "Vegetarian",
                    },
                    {
                      key: "Vegan",
                      label: t("mealPlanCreator.dietary.vegan") || "Vegan",
                    },
                    {
                      key: "Gluten-Free",
                      label:
                        t("mealPlanCreator.dietary.glutenFree") ||
                        "Gluten-Free",
                    },
                    {
                      key: "Dairy-Free",
                      label:
                        t("mealPlanCreator.dietary.dairyFree") || "Dairy-Free",
                    },
                    {
                      key: "Keto",
                      label: t("mealPlanCreator.dietary.keto") || "Keto",
                    },
                    {
                      key: "Paleo",
                      label: t("mealPlanCreator.dietary.paleo") || "Paleo",
                    },
                     {
                      key: "Austism",
                      label: t("mealPlanCreator.dietary.autism") || "Autism",
                    },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center">
                      <input
                        id={`dietary-${option.key}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={planData.dietaryRestrictions.includes(
                          option.key
                        )}
                        onChange={(e) => {
                          const updatedRestrictions = e.target.checked
                            ? [...planData.dietaryRestrictions, option.key]
                            : planData.dietaryRestrictions.filter(
                                (item) => item !== option.key
                              );
                          handleDataChange({
                            dietaryRestrictions: updatedRestrictions,
                          });
                        }}
                      />
                      <label
                        htmlFor={`dietary-${option.key}`}
                        className="ml-3 block text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies Intolerances */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("mealPlanCreator.dietary.allergies") ||
                    "Allergies & Intolerances"}
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    {
                      key: "Nuts",
                      label:
                        t("mealPlanCreator.dietary.allergy.nuts") || "Nuts",
                    },
                    {
                      key: "Shellfish",
                      label:
                        t("mealPlanCreator.dietary.allergy.shellfish") ||
                        "Shellfish",
                    },
                    {
                      key: "Soy",
                      label: t("mealPlanCreator.dietary.allergy.soy") || "Soy",
                    },
                    {
                      key: "Eggs",
                      label:
                        t("mealPlanCreator.dietary.allergy.eggs") || "Eggs",
                    },
                    {
                      key: "Fish",
                      label:
                        t("mealPlanCreator.dietary.allergy.fish") || "Fish",
                    },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center">
                      <input
                        id={`allergy-${option.key}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={planData.allergiesIntolerances.includes(
                          option.key
                        )}
                        onChange={(e) => {
                          const updatedAllergies = e.target.checked
                            ? [...planData.allergiesIntolerances, option.key]
                            : planData.allergiesIntolerances.filter(
                                (item) => item !== option.key
                              );
                          handleDataChange({
                            allergiesIntolerances: updatedAllergies,
                          });
                        }}
                      />
                      <label
                        htmlFor={`allergy-${option.key}`}
                        className="ml-3 block text-sm text-gray-700"
                      >
                        {option.label}
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
                <span>
                  {t("mealPlanCreator.cuisine.label") || "Cuisine & Cooking"}
                </span>
              </CardTitle>
              <CardDescription>
                {t("mealPlanCreator.cuisine.label.desc") ||
                  "Cuisine preferences and cooking constraints"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cuisine Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("mealPlanCreator.cuisine.title") || "Cuisine Preferences"}
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    {
                      key: "Italian",
                      label: t("mealPlanCreator.cuisine.italian") || "Italian",
                    },
                    {
                      key: "Mexican",
                      label: t("mealPlanCreator.cuisine.mexican") || "Mexican",
                    },
                    {
                      key: "Asian",
                      label: t("mealPlanCreator.cuisine.asian") || "Asian",
                    },
                    {
                      key: "American",
                      label:
                        t("mealPlanCreator.cuisine.american") || "American",
                    },
                    {
                      key: "Ecuadorian",
                      label:
                        t("mealPlanCreator.cuisine.ecuadorian") || "Ecuadorian",
                    },
                    {
                      key: "Chinese",
                      label: t("mealPlanCreator.cuisine.chinese") || "Chinese",
                    },
                    {
                      key: "Indian",
                      label: t("mealPlanCreator.cuisine.indian") || "Indian",
                    },
                    ...customCuisines.map((cuisine) => ({
                      key: cuisine,
                      label: cuisine,
                    })),
                  ].map((option) => (
                    <div key={option.key} className="flex items-center">
                      <input
                        id={`cuisine-${option.key}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={planData.cuisinePreferences.includes(
                          option.key
                        )}
                        onChange={(e) => {
                          const updatedCuisines = e.target.checked
                            ? [...planData.cuisinePreferences, option.key]
                            : planData.cuisinePreferences.filter(
                                (item) => item !== option.key
                              );
                          handleDataChange({
                            cuisinePreferences: updatedCuisines,
                          });
                        }}
                      />
                      <label
                        htmlFor={`cuisine-${option.key}`}
                        className="ml-3 block text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Custom Country Cuisine Input */}
                <div className="mt-4">
                  <label
                    htmlFor="customCountry"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("mealPlanCreator.cuisine.customCountry") || "Add Country Cuisine"}
                  </label>
                  <input
                    type="text"
                    id="customCountry"
                    ref={customCountryRef}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder={t("mealPlanCreator.cuisine.customCountryPlaceholder") || "Enter a country for its cuisine (e.g., Brazil, Morocco)"}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        addCustomCuisine(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        addCustomCuisine(val);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Max Cook Time */}
              <div>
                <label
                  htmlFor="maxCookTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.cooking.maxCook") ||
                    "Max Cook Time (minutes)"}
                </label>
                <input
                  type="number"
                  id="maxCookTime"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.maxCookTime}
                  onChange={(e) =>
                    handleDataChange({ maxCookTime: parseInt(e.target.value) })
                  }
                />
              </div>

              {/* Cooking Skill Level */}
              <div>
                <label
                  htmlFor="cookingSkillLevel"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.cooking.skillLevel") ||
                    "Cooking Skill Level"}
                </label>
                <select
                  id="cookingSkillLevel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.cookingSkillLevel}
                  onChange={(e) =>
                    handleDataChange({ cookingSkillLevel: e.target.value })
                  }
                >
                  <option value="">
                    {t("mealPlanCreator.cooking.skillLevel.select") ||
                      "Select Skill Level"}
                  </option>
                  <option value="Beginner">
                    {t("mealPlanCreator.cooking.skillLevel.beginner") ||
                      "Beginner"}
                  </option>
                  <option value="Intermediate">
                    {t("mealPlanCreator.cooking.skillLevel.inter") ||
                      "Intermediate"}
                  </option>
                  <option value="Advanced">
                    {t("mealPlanCreator.cooking.skillLevel.adv") || "Advanced"}
                  </option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label
                  htmlFor="budgetRange"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.cooking.budget") || "Budget Range"}
                </label>
                <select
                  id="budgetRange"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.budgetRange}
                  onChange={(e) =>
                    handleDataChange({ budgetRange: e.target.value })
                  }
                >
                  <option value="">
                    {t("mealPlanCreator.cooking.budget.select") ||
                      "Select Budget Range"}
                  </option>
                  <option value="Low">
                    {t("mealPlanCreator.cooking.budget.low") || "Low"}
                  </option>
                  <option value="Medium">
                    {t("mealPlanCreator.cooking.budget.medium") || "Medium"}
                  </option>
                  <option value="High">
                    {t("mealPlanCreator.cooking.budget.high") || "High"}
                  </option>
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
                <span>
                  {t("mealPlanCreator.foodPref") || "Food Preferences"}
                </span>
              </CardTitle>
              <CardDescription>
                {t("mealPlanCreator.foodPref.desc") ||
                  "Foods you like and dislike (optional)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dislikes */}
              <div>
                <label
                  htmlFor="dislikes"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("mealPlanCreator.dislikes") ||
                    "Dislikes (comma-separated)"}
                </label>
                <input
                  type="text"
                  id="dislikes"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={planData.dislikes}
                  onChange={(e) =>
                    handleDataChange({ dislikes: e.target.value.split(",") })
                  }
                />
              </div>

              {/* Health Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("mealPlanCreator.dietary.healthGoals") || "Health Goals"}
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    {
                      key: "Weight Loss",
                      label:
                        t("mealPlanCreator.healthGoals.weightLoss") ||
                        "Weight Loss",
                    },
                    {
                      key: "Muscle Gain",
                      label:
                        t("mealPlanCreator.healthGoals.muscleGain") ||
                        "Muscle Gain",
                    },
                    {
                      key: "Heart Health",
                      label:
                        t("mealPlanCreator.healthGoals.heartHealth") ||
                        "Heart Health",
                    },
                    {
                      key: "Diabetes Friendly",
                      label:
                        t("mealPlanCreator.healthGoals.diabetesFriendly") ||
                        "Diabetes Friendly",
                    },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center">
                      <input
                        id={`health-${option.key}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={planData.healthGoals.includes(option.key)}
                        onChange={(e) => {
                          const updatedGoals = e.target.checked
                            ? [...planData.healthGoals, option.key]
                            : planData.healthGoals.filter(
                                (item) => item !== option.key
                              );
                          handleDataChange({ healthGoals: updatedGoals });
                        }}
                      />
                      <label
                        htmlFor={`health-${option.key}`}
                        className="ml-3 block text-sm text-gray-700"
                      >
                        {option.label}
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
                <span>
                  {t("mealPlanCreator.generate.title") || "Generate Your Plan"}
                </span>
              </CardTitle>
              <CardDescription>
                {t("mealPlanCreator.generate.desc.alt") ||
                  "Review your preferences and create your personalized meal plan"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                  {t("mealPlanCreator.generate.planSummary") || "Plan Summary"}:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>{t("mealPlanCreator.name") || "Name"}:</strong>{" "}
                      {planData.planName}
                    </p>
                    <p>
                      <strong>
                        {t("mealPlanCreator.description") || "Description"}:
                      </strong>{" "}
                      {planData.planDescription}
                    </p>
                    <p>
                      <strong>
                        {t("mealPlanCreator.people") || "Adults"}:
                      </strong>{" "}
                      {planData.numberOfPersons}{" "}
                      {t("mealPlanCreator.persons") || "persons"}
                    </p>
                    <p>
                      <strong>
                        {t("mealPlanCreator.people") || "Kids 5 to 12"}:
                      </strong>{" "}
                      {planData.numberKids5To12}{" "}
                      {t("mealPlanCreator.kids5to12") || "kids"}
                    </p>
                    <p>
                      <strong>
                        {t("mealPlanCreator.people") || "Kids under 5"}:
                      </strong>{" "}
                      {planData.numberKidsLessThan5}{" "}
                      {t("mealPlanCreator.kidsless5") || "kids"}
                    </p>
                    <p>
                      <strong>
                        {t("mealPlanCreator.duration") || "Duration"}:
                      </strong>{" "}
                      {planData.numberOfDays}{" "}
                      {t("mealPlanCreator.days") || "days"}
                    </p>
                    <p>
                      <strong>
                        {t("mealPlanCreator.mealsPerDay") || "Meals per Day"}:
                      </strong>{" "}
                      {planData.mealsPerDay}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>
                        {t("mealPlanner.skillLevel") || "Skill Level"}:
                      </strong>{" "}
                      {planData.cookingSkillLevel}
                    </p>
                    <p>
                      <strong>
                        {t("mealPlanCreator.budget") || "Budget"}:
                      </strong>{" "}
                      {planData.budgetRange}
                    </p>
                    <p>
                      <strong>
                        {t("mealPlanCreator.dietary.restrictions") ||
                          "Dietary Restrictions"}
                        :
                      </strong>{" "}
                      {planData.dietaryRestrictions.length > 0
                        ? planData.dietaryRestrictions.join(", ")
                        : "None"}
                    </p>
                    <p className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <strong>
                        {t("mealPlanCreator.language") || "Language"}:
                      </strong>{" "}
                      {getLanguageDisplayName(language)}
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
                {isGenerating
                  ? t("mealPlanCreator.generate.btnLoad")
                  : t("mealPlanCreator.generate.btn")}
              </Button>

              {isGenerating && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    <span>
                      {t("mealPlanCreator.generate.analyzing") ||
                        "Analyzing your preferences..."}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {t("mealPlanCreator.generate.takeAFewMoments") ||
                      "This may take a few moments while we create your personalized meal plan."}
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
    console.log("🚀 Generate Meal Plan clicked!");
    console.log("Current plan data:", planData);
    console.log("User:", user);
    //populate the screen of the success modal
    setCreatedPlan({
      name: planData.planName,
      numberOfDays: planData.numberOfDays,
      numberOfPersons: planData.numberOfPersons,
      mealsPerDay: planData.mealsPerDay,
    });

    // Enhanced validation with toast messages
    if (!planData.planName.trim()) {
      console.log("❌ Validation failed: Missing plan name");
      toast({
        title: "Missing Information",
        description: "Please enter a plan name.",
        variant: "destructive",
      });
      return;
    }

    if (!planData.planDescription.trim()) {
      console.log("❌ Validation failed: Missing plan description");
      toast({
        title: "Missing Information",
        description: "Please enter a plan description.",
        variant: "destructive",
      });
      return;
    }

    if (!planData.startDate) {
      console.log("❌ Validation failed: Missing start date");
      toast({
        title: "Missing Information",
        description: "Please select a start date.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      console.log("❌ Validation failed: No user ID");
      toast({
        title: "Authentication Required",
        description: "Please log in to create a meal plan.",
        variant: "destructive",
      });
      return;
    }

    // Set default values if not provided instead of blocking
    const effectiveCookingSkillLevel =
      planData.cookingSkillLevel || "Intermediate";
    const effectiveBudgetRange = planData.budgetRange || "Medium";

    console.log("✅ Validation passed, starting meal plan generation...");
    setIsGenerating(true);

    // Show the cooking loader
    showLoader(
      "Analyzing your preferences and creating your perfect meal plan..."
    );

    // Set up timeout for 3 minutes (180 seconds)
    const timeout = setTimeout(() => {
      console.log("⏰ Meal plan generation timed out after 3 minutes");
      hideLoader();
      setIsGenerating(false);
      toast({
        title: "Still Cooking!",
        description:
          "Your meal plan is being prepared in the background. Please check your meal plans in a few minutes.",
        duration: 5000,
      });
      // Navigate back and refresh
      onBack();
      refreshMealPlans();
    }, 180000); // 3 minutes

    setTimeoutId(timeout);

    try {
      const getLanguageName = (languageCode: string) => {
        const languageMap: { [key: string]: string } = {
          en: "english",
          es: "spanish",
          pt: "portuguese",
          fr: "french",
          de: "german",
          it: "italian",
        };
        return languageMap[languageCode.toLowerCase()] || "english";
      };

      // Ensure any pending custom country input is added
      let cuisinePrefs = planData.cuisinePreferences;
      const pendingCustom = customCountryRef.current?.value?.trim();
      if (pendingCustom) {
        const exists = cuisinePrefs.some(
          (c) => c.toLowerCase() === pendingCustom.toLowerCase()
        );
        if (!exists) {
          cuisinePrefs = [...cuisinePrefs, pendingCustom];
          handleDataChange({ cuisinePreferences: cuisinePrefs });
        }
        customCountryRef.current.value = '';
      }

      const requestData = {
        duration: planData.numberOfDays,
        numberPeople: planData.numberOfPersons,
        numberKids5To12: planData.numberKids5To12,
        numberKidsLessThan5: planData.numberKidsLessThan5,
        mealsPerDay: planData.mealsPerDay,
        dietaryRestrictions: planData.dietaryRestrictions,
        cuisinePreferences: cuisinePrefs,
        allergiesIntolerance: planData.allergiesIntolerances,
        dislikes: [...planData.dislikes, planData.additionalAllergies]
          .filter((item) => item.trim())
          .join(", "),
        maxCookingTime: planData.maxCookTime,
        cookingSkillLevel: effectiveCookingSkillLevel,
        budgetRange: effectiveBudgetRange,
        healthGoals: planData.healthGoals,
        language: getLanguageName(language),
        user_id: user.id,
        start_date: planData.startDate,
        plan_name: planData.planName,
        plan_description: planData.planDescription,
      };

      console.log("📤 Sending API request with data:", requestData);
      console.log("🍽️ cuisinePreferences in payload:", requestData.cuisinePreferences);

      const apiResponse = await createMealPlan(requestData);

      console.log("✅ API response received:", apiResponse);

      // Clear the timeout since we got a response
      if (timeout) {
        clearTimeout(timeout);
        setTimeoutId(null);
      }

      // Hide the loader
      hideLoader();
      setIsGenerating(false);

      const transformedPlan = transformApiMealPlanToLocal(apiResponse);

      console.log("🔄 Transformed plan:", transformedPlan);

      // Show success toast
      toast({
        title: "Meal Plan Created Successfully!",
        description: `Your  meal plan is ready to explore.`,
        duration: 5000,
      });

      // Add to context and navigate
      onPlanCreated(transformedPlan);

      // Refresh meal plans from server
      await refreshMealPlans();
    } catch (error: any) {
      console.error("❌ Error generating meal plan:", error);
      console.log('Error code:', error.code);

      // Clear the timeout
      if (timeout) {
        clearTimeout(timeout);
        setTimeoutId(null);
      }

      // Hide the loader
      hideLoader();
      setIsGenerating(false);

      // Handle specific subscription error
      if (
        error?.code === "03" ||
        error?.response?.data?.code === "03" ||
        (typeof error?.message === "string" && error.message.includes("No meal plans available according to your subscription"))
      ) {
        console.log('Showing upgrade modal for meal plan stepper code 03');
        setShowUpgradeModal(true);
      } else {
        toast({
          title: "Generation Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to generate meal plan. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSuccessModalClose = async () => {
    setShowSuccessModal(false);

    if (createdPlan) {
      // Add to context and navigate
      onPlanCreated(createdPlan);
    }

    // Refresh meal plans from server
    try {
      await refreshMealPlans();
    } catch (error) {
      console.error("Error refreshing meal plans:", error);
    }
  };

  const handleTimeoutModalClose = async () => {
    setShowTimeoutModal(false);

    // Navigate back to meal planner
    onBack();

    // Refresh meal plans from server in case the plan was created in the background
    try {
      await refreshMealPlans();
    } catch (error) {
      console.error("Error refreshing meal plans:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <LoaderComponent />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>
            {t("mealPlanCreator.backToMeal") || "Back to Meal Planner"}
          </span>
        </Button>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h1 className="text-xl font-semibold">
            {isEditing ? "Edit" : "Create"}{" "}
            {t("mealPlanCreator.aiMealPlan") || "AI Meal Plan"}
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        <Progress
          value={(currentStep / steps.length) * 100}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          {steps.map((step) => (
            <span
              key={step.id}
              className={
                currentStep >= step.id ? "text-purple-600 font-medium" : ""
              }
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStepContent()}</div>

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
            onClick={handleNext}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <MealPlanSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        mealPlan={createdPlan}
      />

      <MealPlanTimeoutModal
        isOpen={showTimeoutModal}
        onClose={handleTimeoutModalClose}
      />

      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureType="plans"
      />
    </div>
  );
};

export default MealPlanCreatorStepper;
