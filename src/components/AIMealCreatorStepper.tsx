import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Sparkles, Clock, Users, ChefHat, Utensils, Eye, Target, DollarSign, Heart, AlertTriangle, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import AIMealGeneration from "./AIMealGeneration";
import { trackEvent } from "@/services/analytics";

interface AIMealCreatorStepperProps {
  onBack: () => void;
  onMealCreated: (meal: any) => void;
}

const AIMealCreatorStepper = ({ onBack, onMealCreated }: AIMealCreatorStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [mealData, setMealData] = useState<any>({
    mealName: "",
    mealType: "",
    servings: 2,
    cookingTime: 30,
    cookingSkillLevel: "intermediate",
    budgetRange: "medium",
    dietaryRestrictions: [],
    cuisinePreferences: [],
    healthGoals: [],
    allergiesIntolerances: [],
    customAllergies: "",
    dislikes: "",
    specialRequests: "",
    nameOfMeal: "",
  });
  const { user } = useUser();
  const { language, t } = useLanguage();
  const { showLoader, hideLoader, LoaderComponent } = useCookingLoader();

  const form = useForm({
    defaultValues: {
      mealName: "",
      mealType: "",
      servings: 2,
      cookingTime: 30,
      cookingSkillLevel: "intermediate",
      budgetRange: "medium",
      dietaryRestrictions: [],
      cuisinePreferences: [],
      healthGoals: [],
      allergiesIntolerances: [],
      customAllergies: "",
      dislikes: "",
      specialRequests: ""
    }
  });

  const steps = [
    { id: 1, title: t("aiMealCreatorStepper.step1Title") || "Meal Details", description: t("aiMealCreatorStepper.step1Desc") || "Basic meal information" },
    { id: 2, title: t("aiMealCreatorStepper.step2Title") || "Preferences", description: t("aiMealCreatorStepper.step2Desc") || "Your dietary needs" },
    { id: 3, title: t("aiMealCreatorStepper.step3Title") || "Summary", description: t("aiMealCreatorStepper.step3Desc") || "Review your selections" },
    { id: 4, title: t("aiMealCreatorStepper.step4Title") || "Generate", description: t("aiMealCreatorStepper.step4Desc") || "AI creates your meal" }
  ];

  const handleNext = async () => {
    if (currentStep === 3) {
      
      // Show the cooking loader when transitioning to generation
      showLoader(t("aiMealCreatorStepper.loaderMessage") || "Analyzing your preferences and creating the perfect meal...");
      trackEvent('button_click', {
            button_name: 'generate_special_meal_submit',
            screen: 'generate_special_meal_page',
          })
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Hide loader and move to generation step
      hideLoader();
      setCurrentStep(currentStep + 1);
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepData: any) => {
    setMealData(prev => ({ ...prev, ...stepData }));
  };

  const dietaryOptions = [
    { key: "Vegetarian", label: t('aiMealCreatorStepper.dietary.vegetarian') || 'Vegetarian' },
    { key: "Vegan", label: t('aiMealCreatorStepper.dietary.vegan') || 'Vegan' },
    { key: "Gluten-Free", label: t('aiMealCreatorStepper.dietary.glutenfree') || 'Gluten-Free' },
    { key: "Dairy-Free", label: t('aiMealCreatorStepper.dietary.dairyfree') || 'Dairy-Free' },
    { key: "Keto", label: t('aiMealCreatorStepper.dietary.keto') || 'Keto' },
    { key: "Paleo", label: t('aiMealCreatorStepper.dietary.paleo') || 'Paleo' },
    { key: "Low-Carb", label: t('aiMealCreatorStepper.dietary.lowcarb') || 'Low-Carb' },
    { key: "Low-Fat", label: t('aiMealCreatorStepper.dietary.lowfat') || 'Low-Fat' },
    { key: "Pescatarian", label: t('aiMealCreatorStepper.dietary.pescatarian') || 'Pescatarian' },
    { key: "Nut-Free", label: t('aiMealCreatorStepper.dietary.nutfree') || 'Nut-Free' },
  ];

  const cuisineOptions = [
    { key: "Italian", label: t('aiMealCreatorStepper.cuisine.italian') || 'Italian' },
    { key: "Mexican", label: t('aiMealCreatorStepper.cuisine.mexican') || 'Mexican' },
    { key: "Asian", label: t('aiMealCreatorStepper.cuisine.asian') || 'Asian' },
    { key: "Mediterranean", label: t('aiMealCreatorStepper.cuisine.mediterranean') || 'Mediterranean' },
    { key: "Indian", label: t('aiMealCreatorStepper.cuisine.indian') || 'Indian' },
    { key: "American", label: t('aiMealCreatorStepper.cuisine.american') || 'American' },
    { key: "French", label: t('aiMealCreatorStepper.cuisine.french') || 'French' },
    { key: "Japanese", label: t('aiMealCreatorStepper.cuisine.japanese') || 'Japanese' },
    { key: "Thai", label: t('aiMealCreatorStepper.cuisine.thai') || 'Thai' },
    { key: "Greek", label: t('aiMealCreatorStepper.cuisine.greek') || 'Greek' },
    { key: "Spanish", label: t('aiMealCreatorStepper.cuisine.spanish') || 'Spanish' },
    { key: "Chinese", label: t('aiMealCreatorStepper.cuisine.chinese') || 'Chinese' },
  ];

  const healthGoalsOptions = [
    { key: "Weight Loss", label: t('aiMealCreatorStepper.health.weightloss') || 'Weight Loss' },
    { key: "Muscle Gain", label: t('aiMealCreatorStepper.health.musclegain') || 'Muscle Gain' },
    { key: "Heart Health", label: t('aiMealCreatorStepper.health.hearthealth') || 'Heart Health' },
    { key: "Energy Boost", label: t('aiMealCreatorStepper.health.energyboost') || 'Energy Boost' },
    { key: "Immune Support", label: t('aiMealCreatorStepper.health.immunesupport') || 'Immune Support' },
    { key: "Digestive Health", label: t('aiMealCreatorStepper.health.digestivehealth') || 'Digestive Health' },
    { key: "Anti-Inflammatory", label: t('aiMealCreatorStepper.health.antiinflammatory') || 'Anti-Inflammatory' },
    { key: "Detox", label: t('aiMealCreatorStepper.health.detox') || 'Detox' },
  ];

  const allergiesOptions = [
    { key: "Nuts", label: t('aiMealCreatorStepper.allergy.nuts') || 'Nuts' },
    { key: "Peanuts", label: t('aiMealCreatorStepper.allergy.peanuts') || 'Peanuts' },
    { key: "Shellfish", label: t('aiMealCreatorStepper.allergy.shellfish') || 'Shellfish' },
    { key: "Eggs", label: t('aiMealCreatorStepper.allergy.eggs') || 'Eggs' },
    { key: "Dairy", label: t('aiMealCreatorStepper.allergy.dairy') || 'Dairy' },
    { key: "Soy", label: t('aiMealCreatorStepper.allergy.soy') || 'Soy' },
    { key: "Fish", label: t('aiMealCreatorStepper.allergy.fish') || 'Fish' },
    { key: "Wheat", label: t('aiMealCreatorStepper.allergy.wheat') || 'Wheat' },
    { key: "Sesame", label: t('aiMealCreatorStepper.allergy.sesame') || 'Sesame' },
    { key: "Sulfites", label: t('aiMealCreatorStepper.allergy.sulfites') || 'Sulfites' },
  ];

  const getLanguageDisplayName = () => {
    const languageNames = {
      en: t("language.english") || "English",
      es: t("language.spanish") || "Español",
      pt: t("language.portuguese") || "Português"
    };
    return languageNames[language as keyof typeof languageNames] || "English";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-purple-600" />
                <span>{t("aiMealCreatorStepper.mealDetailsTitle") || "Meal Details"}</span>
              </CardTitle>
              <CardDescription>
                {t("aiMealCreatorStepper.mealDetailsDesc") || "Tell us about the meal you want to create"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t("aiMealCreatorStepper.mealNameLabel") || "Special Meal Name (Optional)"}</label>
                <Input
                  placeholder={t("aiMealCreatorStepper.mealNamePlaceholder") || "e.g., My Special Sunday Dinner"}
                  value={mealData.mealName}
                  onChange={(e) => handleStepData({ mealName: e.target.value })}
                   maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("aiMealCreatorStepper.dishName") || "Do you want a specific dish? Write it here: (Optional)"}</label>
                <Input
                  placeholder={t("aiMealCreatorStepper.dishName") || "e.g., Mac and cheese"}
                  value={mealData.nameOfMeal}
                  onChange={(e) => handleStepData({ nameOfMeal: e.target.value })}
                   maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("aiMealCreatorStepper.mealTypeLabel") || "Meal Type"}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ key: "Breakfast", label: t('aiMealCreatorStepper.mealType.breakfast') || 'Breakfast' },
                    { key: "Lunch", label: t('aiMealCreatorStepper.mealType.lunch') || 'Lunch' },
                    { key: "Dinner", label: t('aiMealCreatorStepper.mealType.dinner') || 'Dinner' },
                    { key: "Snack", label: t('aiMealCreatorStepper.mealType.snack') || 'Snack' },
                    { key: "Dessert", label: t('aiMealCreatorStepper.mealType.dessert') || 'Dessert' },
                    { key: "Appetizer", label: t('aiMealCreatorStepper.mealType.appetizer') || 'Appetizer' },
                    { key: "Custom", label: t('aiMealCreatorStepper.mealType.custom') || 'Custom' },
                  ].map((type) => (
                    <Button
                      key={type.key}
                      type="button"
                      variant={mealData.mealType === type.key ? "default" : "outline"}
                      onClick={() => handleStepData({ mealType: type.key })}
                      className="h-16 flex flex-col space-y-1"
                    >
                      <span className="font-medium text-sm">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                    <Users className="h-4 w-4" />
                    <span>{t("aiMealCreatorStepper.servingsLabel") || "Servings"}</span>
                  </label>
                  <Input 
                    type="number" 
                    value={mealData.servings}
                    onChange={(e) => handleStepData({ servings: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                    <Clock className="h-4 w-4" />
                    <span>{t("aiMealCreatorStepper.cookingTimeLabel") || "Max Cooking Time (mins)"}</span>
                  </label>
                  <Input 
                    type="number" 
                    value={mealData.cookingTime}
                    onChange={(e) => handleStepData({ cookingTime: parseInt(e.target.value) })}
                    min="5"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                    <ChefHat className="h-4 w-4" />
                    <span>{t("aiMealCreatorStepper.skillLevelLabel") || "Cooking Skill Level"}</span>
                  </label>
                  <Select 
                    value={mealData.cookingSkillLevel} 
                    onValueChange={(value) => handleStepData({ cookingSkillLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("aiMealCreatorStepper.skillLevelPlaceholder") || "Select skill level"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">{t("aiMealCreatorStepper.skillLevel.beginner") || "Beginner"}</SelectItem>
                      <SelectItem value="intermediate">{t("aiMealCreatorStepper.skillLevel.intermediate") || "Intermediate"}</SelectItem>
                      <SelectItem value="advanced">{t("aiMealCreatorStepper.skillLevel.advanced") || "Advanced"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span>{t("aiMealCreatorStepper.budgetLabel") || "Budget Range"}</span>
                </label>
                <Select 
                  value={mealData.budgetRange} 
                  onValueChange={(value) => handleStepData({ budgetRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("aiMealCreatorStepper.budgetPlaceholder") || "Select budget"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("aiMealCreatorStepper.budget.low") || "Low Budget"}</SelectItem>
                    <SelectItem value="medium">{t("aiMealCreatorStepper.budget.medium") || "Medium Budget"}</SelectItem>
                    <SelectItem value="high">{t("aiMealCreatorStepper.budget.high") || "High Budget"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("aiMealCreatorStepper.specialRequestsLabel") || "Special Requests (Optional)"}</label>
                <Textarea 
                  placeholder={t("aiMealCreatorStepper.specialRequestsPlaceholder") || "Any specific requests or inspirations for your meal?"}
                  value={mealData.specialRequests}
                  onChange={(e) => handleStepData({ specialRequests: e.target.value })}
                  maxLength={40}
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
                <Heart className="h-5 w-5 text-purple-600" />
                <span>{t("aiMealCreatorStepper.preferencesTitle") || "Preferences & Goals"}</span>
              </CardTitle>
              <CardDescription>
                {t("aiMealCreatorStepper.preferencesDesc") || "Help us customize your meal to your dietary needs and health goals"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">{t("aiMealCreatorStepper.dietaryRestrictionsLabel") || "Dietary Restrictions"}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${option.key}`}
                        checked={mealData.dietaryRestrictions?.includes(option.key)}
                        onCheckedChange={(checked) => {
                          const current = mealData.dietaryRestrictions || [];
                          if (checked) {
                            handleStepData({ dietaryRestrictions: [...current, option.key] });
                          } else {
                            handleStepData({ dietaryRestrictions: current.filter((item: string) => item !== option.key) });
                          }
                        }}
                      />
                      <label htmlFor={`dietary-${option.key}`} className="text-sm">{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">{t("aiMealCreatorStepper.cuisinePreferencesLabel") || "Cuisine Preferences"}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cuisineOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${option.key}`}
                        checked={mealData.cuisinePreferences?.includes(option.key)}
                        onCheckedChange={(checked) => {
                          const current = mealData.cuisinePreferences || [];
                          if (checked) {
                            handleStepData({ cuisinePreferences: [...current, option.key] });
                          } else {
                            handleStepData({ cuisinePreferences: current.filter((item: string) => item !== option.key) });
                          }
                        }}
                      />
                      <label htmlFor={`cuisine-${option.key}`} className="text-sm">{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-3">
                  <Target className="h-4 w-4" />
                  <span>{t("aiMealCreatorStepper.healthGoalsLabel") || "Health Goals"}</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {healthGoalsOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`health-${option.key}`}
                        checked={mealData.healthGoals?.includes(option.key)}
                        onCheckedChange={(checked) => {
                          const current = mealData.healthGoals || [];
                          if (checked) {
                            handleStepData({ healthGoals: [...current, option.key] });
                          } else {
                            handleStepData({ healthGoals: current.filter((item: string) => item !== option.key) });
                          }
                        }}
                      />
                      <label htmlFor={`health-${option.key}`} className="text-sm">{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{t("aiMealCreatorStepper.allergiesLabel") || "Allergies & Intolerances"}</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allergiesOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${option.key}`}
                        checked={mealData.allergiesIntolerances?.includes(option.key)}
                        onCheckedChange={(checked) => {
                          const current = mealData.allergiesIntolerances || [];
                          if (checked) {
                            handleStepData({ allergiesIntolerances: [...current, option.key] });
                          } else {
                            handleStepData({ allergiesIntolerances: current.filter((item: string) => item !== option.key) });
                          }
                        }}
                      />
                      <label htmlFor={`allergy-${option.key}`} className="text-sm">{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("aiMealCreatorStepper.customAllergiesLabel") || "Custom Allergies/Intolerances (Optional)"}</label>
                <Textarea 
                  placeholder={t("aiMealCreatorStepper.customAllergiesPlaceholder") || "List any other ingredients or foods you're allergic to or intolerant of..."}
                  value={mealData.customAllergies}
                  onChange={(e) => handleStepData({ customAllergies: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("aiMealCreatorStepper.dislikesLabel") || "Dislikes (Optional)"}</label>
                <Textarea 
                  placeholder={t("aiMealCreatorStepper.dislikesPlaceholder") || "List any ingredients or foods you dislike..."}
                  value={mealData.dislikes}
                  onChange={(e) => handleStepData({ dislikes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <span>{t("aiMealCreatorStepper.reviewTitle") || "Review Your Selections"}</span>
              </CardTitle>
              <CardDescription>
                {t("aiMealCreatorStepper.reviewDesc") || "Please review all your preferences before generating your meal"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-purple-700">{t("aiMealCreatorStepper.review.basicInfo") || "Basic Information"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <strong>{t("aiMealCreatorStepper.review.language") || "Language"}:</strong> {getLanguageDisplayName()}
                    </div>
                    <div><strong>{t("aiMealCreatorStepper.review.mealName") || "Meal Name"}:</strong> {mealData.mealName || t("aiMealCreatorStepper.review.notSpecified") || "Not specified"}</div>
                    <div><strong>{t("aiMealCreatorStepper.review.dish") || "Dish Name"}:</strong> {mealData.nameOfMeal || t("aiMealCreatorStepper.review.notSpecified") || "Not specified"}</div>

                    <div><strong>{t("aiMealCreatorStepper.review.mealType") || "Meal Type"}:</strong> {mealData.mealType || t("aiMealCreatorStepper.review.notSelected") || "Not selected"}</div>
                    <div><strong>{t("aiMealCreatorStepper.review.servings") || "Servings"}:</strong> {mealData.servings}</div>
                    <div><strong>{t("aiMealCreatorStepper.review.cookingTime") || "Max Cooking Time"}:</strong> {mealData.cookingTime} {t("aiMealCreatorStepper.review.minutes") || "minutes"}</div>
                    <div><strong>{t("aiMealCreatorStepper.review.skillLevel") || "Skill Level"}:</strong> {mealData.cookingSkillLevel}</div>
                    <div><strong>{t("aiMealCreatorStepper.review.budget") || "Budget"}:</strong> {mealData.budgetRange}</div>
                  </div>
                </div>

                {mealData.dietaryRestrictions?.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-green-700">{t("aiMealCreatorStepper.review.dietaryRestrictions") || "Dietary Restrictions"}</h3>
                    <div className="flex flex-wrap gap-2">
                      {mealData.dietaryRestrictions.map((restriction: string) => (
                        <span key={restriction} className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mealData.cuisinePreferences?.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-700">{t("aiMealCreatorStepper.review.cuisinePreferences") || "Cuisine Preferences"}</h3>
                    <div className="flex flex-wrap gap-2">
                      {mealData.cuisinePreferences.map((cuisine: string) => (
                        <span key={cuisine} className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mealData.healthGoals?.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-orange-700">{t("aiMealCreatorStepper.review.healthGoals") || "Health Goals"}</h3>
                    <div className="flex flex-wrap gap-2">
                      {mealData.healthGoals.map((goal: string) => (
                        <span key={goal} className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mealData.allergiesIntolerances?.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-red-700">{t("aiMealCreatorStepper.review.allergies") || "Allergies & Intolerances"}</h3>
                    <div className="flex flex-wrap gap-2">
                      {mealData.allergiesIntolerances.map((allergy: string) => (
                        <span key={allergy} className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mealData.customAllergies && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-red-700">{t("aiMealCreatorStepper.review.customAllergies") || "Custom Allergies/Intolerances"}</h3>
                    <p className="text-sm text-red-600">{mealData.customAllergies}</p>
                  </div>
                )}

                {mealData.dislikes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-yellow-700">{t("aiMealCreatorStepper.review.dislikes") || "Dislikes"}</h3>
                    <p className="text-sm text-yellow-600">{mealData.dislikes}</p>
                  </div>
                )}

                {mealData.specialRequests && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-purple-700">{t("aiMealCreatorStepper.review.specialRequests") || "Special Requests"}</h3>
                    <p className="text-sm text-purple-600">{mealData.specialRequests}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return <AIMealGeneration mealData={mealData} onMealCreated={onMealCreated} />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <LoaderComponent />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>{t("aiMealCreatorStepper.backToMeals") || "Back to AI Meals"}</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h1 className="text-xl font-semibold">
            {t("aiMealCreatorStepper.createAIMealTitle") || "Create AI Meal"}
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${currentStep >= step.id 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {step.id}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                ml-4 w-12 h-0.5 
                ${currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("aiMealCreatorStepper.previousBtn") || "Previous"}
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentStep === 1 && !mealData.mealType}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {t("aiMealCreatorStepper.nextBtn") || "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIMealCreatorStepper;
