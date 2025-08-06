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
    specialRequests: ""
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
    { id: 1, title: "Meal Details", description: "Basic meal information" },
    { id: 2, title: "Preferences", description: "Your dietary needs" },
    { id: 3, title: "Summary", description: "Review your selections" },
    { id: 4, title: "Generate", description: "AI creates your meal" }
  ];

  const handleNext = async () => {
    if (currentStep === 3) {
      // Show the cooking loader when transitioning to generation
      showLoader("Analyzing your preferences and creating the perfect meal...");
      
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
    "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", 
    "Low-Carb", "Low-Fat", "Pescatarian", "Nut-Free"
  ];

  const cuisineOptions = [
    "Italian", "Mexican", "Asian", "Mediterranean", "Indian", "American", 
    "French", "Japanese", "Thai", "Greek", "Spanish", "Chinese"
  ];

  const healthGoalsOptions = [
    "Weight Loss", "Muscle Gain", "Heart Health", "Energy Boost", 
    "Immune Support", "Digestive Health", "Anti-Inflammatory", "Detox"
  ];

  const allergiesOptions = [
    "Nuts", "Peanuts", "Shellfish", "Eggs", "Dairy", "Soy", "Fish", "Wheat", "Sesame", "Sulfites"
  ];

  const getLanguageDisplayName = () => {
    const languageNames = {
      en: "English",
      es: "Español", 
      pt: "Português"
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
                <span>Meal Details</span>
              </CardTitle>
              <CardDescription>
                Tell us about the meal you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Special Meal Name (Optional)</label>
                <Input
                  placeholder="e.g., My Special Sunday Dinner"
                  value={mealData.mealName}
                  onChange={(e) => handleStepData({ mealName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer", "Custom"].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={mealData.mealType === type ? "default" : "outline"}
                      onClick={() => handleStepData({ mealType: type })}
                      className="h-16 flex flex-col space-y-1"
                    >
                      <span className="font-medium text-sm">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                    <Users className="h-4 w-4" />
                    <span>Servings</span>
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
                    <span>Max Cooking Time (mins)</span>
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
                    <span>Cooking Skill Level</span>
                  </label>
                  <Select 
                    value={mealData.cookingSkillLevel} 
                    onValueChange={(value) => handleStepData({ cookingSkillLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget Range</span>
                </label>
                <Select 
                  value={mealData.budgetRange} 
                  onValueChange={(value) => handleStepData({ budgetRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Budget</SelectItem>
                    <SelectItem value="medium">Medium Budget</SelectItem>
                    <SelectItem value="high">High Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
                <Textarea 
                  placeholder="Any specific requests or inspirations for your meal?"
                  value={mealData.specialRequests}
                  onChange={(e) => handleStepData({ specialRequests: e.target.value })}
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
                <span>Preferences & Goals</span>
              </CardTitle>
              <CardDescription>
                Help us customize your meal to your dietary needs and health goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Dietary Restrictions</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${option}`}
                        checked={mealData.dietaryRestrictions?.includes(option)}
                        onCheckedChange={(checked) => {
                          const current = mealData.dietaryRestrictions || [];
                          if (checked) {
                            handleStepData({ dietaryRestrictions: [...current, option] });
                          } else {
                            handleStepData({ dietaryRestrictions: current.filter((item: string) => item !== option) });
                          }
                        }}
                      />
                      <label htmlFor={`dietary-${option}`} className="text-sm">{option}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Cuisine Preferences</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cuisineOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${option}`}
                        checked={mealData.cuisinePreferences?.includes(option)}
                        onCheckedChange={(checked) => {
                          const current = mealData.cuisinePreferences || [];
                          if (checked) {
                            handleStepData({ cuisinePreferences: [...current, option] });
                          } else {
                            handleStepData({ cuisinePreferences: current.filter((item: string) => item !== option) });
                          }
                        }}
                      />
                      <label htmlFor={`cuisine-${option}`} className="text-sm">{option}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-3">
                  <Target className="h-4 w-4" />
                  <span>Health Goals</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {healthGoalsOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`health-${option}`}
                        checked={mealData.healthGoals?.includes(option)}
                        onCheckedChange={(checked) => {
                          const current = mealData.healthGoals || [];
                          if (checked) {
                            handleStepData({ healthGoals: [...current, option] });
                          } else {
                            handleStepData({ healthGoals: current.filter((item: string) => item !== option) });
                          }
                        }}
                      />
                      <label htmlFor={`health-${option}`} className="text-sm">{option}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Allergies & Intolerances</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allergiesOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${option}`}
                        checked={mealData.allergiesIntolerances?.includes(option)}
                        onCheckedChange={(checked) => {
                          const current = mealData.allergiesIntolerances || [];
                          if (checked) {
                            handleStepData({ allergiesIntolerances: [...current, option] });
                          } else {
                            handleStepData({ allergiesIntolerances: current.filter((item: string) => item !== option) });
                          }
                        }}
                      />
                      <label htmlFor={`allergy-${option}`} className="text-sm">{option}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Custom Allergies/Intolerances (Optional)</label>
                <Textarea 
                  placeholder="List any other ingredients or foods you're allergic to or intolerant of..."
                  value={mealData.customAllergies}
                  onChange={(e) => handleStepData({ customAllergies: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dislikes (Optional)</label>
                <Textarea 
                  placeholder="List any ingredients or foods you dislike..."
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
                <span>Review Your Selections</span>
              </CardTitle>
              <CardDescription>
                Please review all your preferences before generating your meal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-purple-700">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <strong>Language:</strong> {getLanguageDisplayName()}
                    </div>
                    <div><strong>Meal Name:</strong> {mealData.mealName || "Not specified"}</div>
                    <div><strong>Meal Type:</strong> {mealData.mealType || "Not selected"}</div>
                    <div><strong>Servings:</strong> {mealData.servings}</div>
                    <div><strong>Max Cooking Time:</strong> {mealData.cookingTime} minutes</div>
                    <div><strong>Skill Level:</strong> {mealData.cookingSkillLevel}</div>
                    <div><strong>Budget:</strong> {mealData.budgetRange}</div>
                  </div>
                </div>

                {mealData.dietaryRestrictions?.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-green-700">Dietary Restrictions</h3>
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
                    <h3 className="font-semibold mb-2 text-blue-700">Cuisine Preferences</h3>
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
                    <h3 className="font-semibold mb-2 text-orange-700">Health Goals</h3>
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
                    <h3 className="font-semibold mb-2 text-red-700">Allergies & Intolerances</h3>
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
                    <h3 className="font-semibold mb-2 text-red-700">Custom Allergies/Intolerances</h3>
                    <p className="text-sm text-red-600">{mealData.customAllergies}</p>
                  </div>
                )}

                {mealData.dislikes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-yellow-700">Dislikes</h3>
                    <p className="text-sm text-yellow-600">{mealData.dislikes}</p>
                  </div>
                )}

                {mealData.specialRequests && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-purple-700">Special Requests</h3>
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
          <span>Back to AI Meals</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h1 className="text-xl font-semibold">Create AI Meal</h1>
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
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentStep === 1 && !mealData.mealType}
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

export default AIMealCreatorStepper;
