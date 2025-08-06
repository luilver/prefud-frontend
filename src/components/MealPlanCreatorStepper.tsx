
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, ChefHat, Users, Clock, DollarSign, Target, Utensils, Heart, AlertCircle, CheckCircle, Sparkles, Plus, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import MealPlanSuccessModal from "./MealPlanSuccessModal";
import MealPlanTimeoutModal from "./MealPlanTimeoutModal";
import { createMealPlan, transformApiMealPlanToLocal } from "@/services/mealPlanService";

interface MealPlanCreatorStepperProps {
  initialData?: any;
  onPlanCreated: (plan: any) => void;
  onBack: () => void;
  isEditing?: boolean;
}

interface PlanData {
  planName: string;
  planDescription: string;
  numberOfWeeks: number;
  numberOfPersons: number;
  mealsPerDay: number;
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  allergiesIntolerances: string[];
  dislikes: string[];
  additionalAllergies: string;
  maxCookTime: number;
  cookingSkillLevel: string;
  budgetRange: string;
  healthGoals: string[];
  startDate: Date | null;
}

const defaultPlanData: PlanData = {
  planName: "",
  planDescription: "",
  numberOfWeeks: 1,
  numberOfPersons: 1,
  mealsPerDay: 3,
  dietaryRestrictions: [],
  cuisinePreferences: [],
  allergiesIntolerances: [],
  dislikes: [],
  additionalAllergies: "",
  maxCookTime: 30,
  cookingSkillLevel: "Intermediate",
  budgetRange: "Medium",
  healthGoals: [],
  startDate: null,
};

const MealPlanCreatorStepper = ({ initialData, onPlanCreated, onBack, isEditing }: MealPlanCreatorStepperProps) => {
  const [step, setStep] = useState(1);
  const [planData, setPlanData] = useState<PlanData>(initialData ? {
    planName: initialData.name || "",
    planDescription: initialData.planDescription || "",
    numberOfWeeks: initialData.preferences?.numberOfWeeks || 1,
    numberOfPersons: initialData.preferences?.numberOfPersons || 1,
    mealsPerDay: initialData.preferences?.mealsPerDay || 3,
    dietaryRestrictions: initialData.preferences?.dietaryRestrictions || [],
    cuisinePreferences: initialData.preferences?.cuisinePreferences || [],
    allergiesIntolerances: initialData.preferences?.allergiesIntolerance || [],
    dislikes: initialData.preferences?.dislikes ? initialData.preferences.dislikes.split(',').map((item: string) => item.trim()) : [],
    additionalAllergies: initialData.preferences?.additionalAllergies || "",
    maxCookTime: initialData.preferences?.maxCookingTime || 30,
    cookingSkillLevel: initialData.preferences?.cookingSkillLevel || "Intermediate",
    budgetRange: initialData.preferences?.budgetRange || "Medium",
    healthGoals: initialData.preferences?.healthGoals || [],
    startDate: initialData.startDate ? new Date(initialData.startDate) : null,
  } : defaultPlanData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPlan, setSuccessPlan] = useState<any>(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const { user, fetchMealPlansFromAPI } = useUser();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { showLoader, hideLoader, isLoading } = useCookingLoader();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const getLanguageDisplayName = (lang: string) => {
    const languageNames: { [key: string]: string } = {
      en: "English",
      es: "Español", 
      pt: "Português"
    };
    return languageNames[lang] || "English";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setPlanData(prevData => {
      if (type === "checkbox") {
        const isAdding = checked;
        if (name === "healthGoals") {
          const goal = value;
          return {
            ...prevData,
            healthGoals: isAdding
              ? [...prevData.healthGoals, goal]
              : prevData.healthGoals.filter(g => g !== goal),
          };
        } else if (name === "dietaryRestrictions") {
          const restriction = value;
          return {
            ...prevData,
            dietaryRestrictions: isAdding
              ? [...prevData.dietaryRestrictions, restriction]
              : prevData.dietaryRestrictions.filter(r => r !== restriction),
          };
        } else if (name === "cuisinePreferences") {
          const cuisine = value;
          return {
            ...prevData,
            cuisinePreferences: isAdding
              ? [...prevData.cuisinePreferences, cuisine]
              : prevData.cuisinePreferences.filter(c => c !== cuisine),
          };
        } else if (name === "allergiesIntolerances") {
          const allergy = value;
          return {
            ...prevData,
            allergiesIntolerances: isAdding
              ? [...prevData.allergiesIntolerances, allergy]
              : prevData.allergiesIntolerances.filter(a => a !== allergy),
          };
        }
      } else if (name === "dislikes") {
        const valueToAdd = value as string;
        return {
          ...prevData,
          dislikes: valueToAdd ? valueToAdd.split(',').map(item => item.trim()) : [],
        };
      } else if (type === "number") {
        return {
          ...prevData,
          [name]: parseInt(value, 10) || 1,
        };
      } else {
        return {
          ...prevData,
          [name]: value,
        };
      }
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    setPlanData(prevData => ({
      ...prevData,
      startDate: date || null,
    }));
  };

  const generateMealPlan = async () => {
    console.log('🚀 Generate Meal Plan clicked!');
    console.log('Current plan data:', planData);
    console.log('User:', user);
    
    // More flexible validation - only check truly required fields
    if (!planData.planName.trim()) {
      console.log('❌ Validation failed: Missing plan name');
      toast({
        title: "Missing Information",
        description: "Please enter a plan name.",
        variant: "destructive"
      });
      return;
    }

    if (!planData.startDate) {
      console.log('❌ Validation failed: Missing start date');
      toast({
        title: "Missing Information",
        description: "Please select a start date.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      console.log('❌ Validation failed: No user ID');
      toast({
        title: "Authentication Required",
        description: "Please log in to create a meal plan.",
        variant: "destructive"
      });
      return;
    }

    // Set default values if not provided instead of blocking
    const effectiveCookingSkillLevel = planData.cookingSkillLevel || "Intermediate";
    const effectiveBudgetRange = planData.budgetRange || "Medium";

    console.log('✅ Validation passed, starting meal plan generation...');
    setIsGenerating(true);

    // Show the cooking loader
    showLoader("Analyzing your preferences and creating your perfect meal plan...");

    // Set up timeout for 3 minutes (180 seconds)
    const timeout = setTimeout(() => {
      console.log('⏰ Meal plan generation timed out after 3 minutes');
      hideLoader();
      setIsGenerating(false);
      toast({
        title: "Still Cooking!",
        description: "Your meal plan is being prepared in the background. Please check your meal plans in a few minutes.",
        duration: 8000,
      });
      setShowTimeoutModal(true);
    }, 180000); // 3 minutes

    try {
      // Calculate end date
      const startDate = new Date(planData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (planData.numberOfWeeks * 7) - 1);

      // Prepare the request data matching the API specification
      const requestData = {
        duration: planData.numberOfWeeks * 7,
        numberPeople: planData.numberOfPersons,
        mealsPerDay: planData.mealsPerDay,
        dietaryRestrictions: planData.dietaryRestrictions,
        cuisinePreferences: planData.cuisinePreferences,
        allergiesIntolerance: planData.allergiesIntolerances,
        dislikes: [...planData.dislikes, planData.additionalAllergies].filter(item => item.trim()).join(', '),
        maxCookingTime: planData.maxCookTime,
        cookingSkillLevel: effectiveCookingSkillLevel,
        budgetRange: effectiveBudgetRange,
        healthGoals: planData.healthGoals,
        language: getLanguageDisplayName(language),
        user_id: user.id,
        start_date: planData.startDate.toISOString().split('T')[0],
        plan_name: planData.planName,
        plan_description: planData.planDescription || `Personalized meal plan for ${planData.numberOfPersons} person${planData.numberOfPersons > 1 ? 's' : ''}`
      };

      console.log('📤 Sending API request with data:', requestData);

      const apiResponse = await createMealPlan(requestData);
      
      console.log('✅ API response received:', apiResponse);
      
      // Clear the timeout since we got a response
      if (timeout) {
        clearTimeout(timeout);
      }
      
      // Hide the loader
      hideLoader();
      setIsGenerating(false);
      
      const transformedPlan = transformApiMealPlanToLocal(apiResponse);

      console.log('🔄 Transformed plan:', transformedPlan);

      // Show success toast
      toast({
        title: "🎉 Meal Plan Created Successfully!",
        description: `Your meal plan "${transformedPlan.name}" is ready to explore.`,
        duration: 8000,
      });

      // Set the success modal data with properly mapped information
      const successPlanData = {
        ...transformedPlan,
        name: transformedPlan.name || planData.planName,
        numberOfDays: planData.numberOfWeeks * 7,
        numberOfPersons: planData.numberOfPersons,
        mealsPerDay: planData.mealsPerDay,
        preferences: {
          ...transformedPlan.preferences,
          numberOfDays: planData.numberOfWeeks * 7,
          numberOfPersons: planData.numberOfPersons,
          mealsPerDay: planData.mealsPerDay
        }
      };
      
      console.log('📋 Setting success plan data:', successPlanData);
      setSuccessPlan(successPlanData);
      setShowSuccessModal(true);

      // Call the parent callback with the transformed plan
      onPlanCreated(transformedPlan);

      // Refresh meal plans in the background
      await refreshMealPlans();

    } catch (error) {
      console.error('❌ Error generating meal plan:', error);
      
      // Clear the timeout
      if (timeout) {
        clearTimeout(timeout);
      }
      
      // Hide the loader
      hideLoader();
      setIsGenerating(false);
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const refreshMealPlans = async () => {
    if (user?.id) {
      try {
        // Fetch the first page of meal plans to refresh the list
        await fetchMealPlansFromAPI(user.id, 1, 6);
      } catch (error) {
        console.error('Error refreshing meal plans:', error);
      }
    }
  };

  const handleViewSuccessPlan = () => {
    if (successPlan) {
      console.log('📋 Viewing success plan:', successPlan);
      setShowSuccessModal(false);
      // Pass the full transformed plan to the parent callback
      onPlanCreated(successPlan);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  type="text"
                  id="planName"
                  name="planName"
                  value={planData.planName}
                  onChange={handleChange}
                  placeholder="My Awesome Meal Plan"
                />
              </div>
              <div>
                <Label htmlFor="planDescription">Plan Description</Label>
                <Textarea
                  id="planDescription"
                  name="planDescription"
                  value={planData.planDescription}
                  onChange={handleChange}
                  placeholder="A brief description of this meal plan"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numberOfWeeks">Number of Weeks</Label>
                <Select value={planData.numberOfWeeks.toString()} onValueChange={(value) => setPlanData(prev => ({ ...prev, numberOfWeeks: parseInt(value) }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(week => (
                      <SelectItem key={week} value={week.toString()}>{week} Week{week > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numberOfPersons">Number of Persons</Label>
                <Select value={planData.numberOfPersons.toString()} onValueChange={(value) => setPlanData(prev => ({ ...prev, numberOfPersons: parseInt(value) }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(person => (
                      <SelectItem key={person} value={person.toString()}>{person} Person{person > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mealsPerDay">Meals Per Day</Label>
                <Select value={planData.mealsPerDay.toString()} onValueChange={(value) => setPlanData(prev => ({ ...prev, mealsPerDay: parseInt(value) }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(meal => (
                      <SelectItem key={meal} value={meal.toString()}>{meal} Meal{meal > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !planData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {planData.startDate ? format(planData.startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={planData.startDate}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        );
      case 2:
        return (
          <CardContent className="space-y-4">
            <div>
              <Label>Dietary Restrictions</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Pescatarian", "Ketogenic", "Paleo"].map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      name="dietaryRestrictions"
                      value={option}
                      checked={planData.dietaryRestrictions.includes(option)}
                      onCheckedChange={(checked) => handleChange({
                        target: {
                          name: "dietaryRestrictions",
                          value: option,
                          type: "checkbox",
                          checked: checked === true,
                        }
                      } as any)}
                    />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Cuisine Preferences</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Italian", "Mexican", "Chinese", "Indian", "American", "Mediterranean", "Japanese", "Thai", "French", "Korean"].map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      name="cuisinePreferences"
                      value={option}
                      checked={planData.cuisinePreferences.includes(option)}
                      onCheckedChange={(checked) => handleChange({
                        target: {
                          name: "cuisinePreferences",
                          value: option,
                          type: "checkbox",
                          checked: checked === true,
                        }
                      } as any)}
                    />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Allergies & Intolerances</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Peanuts", "Tree Nuts", "Dairy", "Eggs", "Soy", "Wheat", "Fish", "Shellfish"].map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      name="allergiesIntolerances"
                      value={option}
                      checked={planData.allergiesIntolerances.includes(option)}
                      onCheckedChange={(checked) => handleChange({
                        target: {
                          name: "allergiesIntolerances",
                          value: option,
                          type: "checkbox",
                          checked: checked === true,
                        }
                      } as any)}
                    />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="additionalAllergies">Additional Allergies/Dislikes (comma-separated)</Label>
              <Input
                type="text"
                id="additionalAllergies"
                name="additionalAllergies"
                value={planData.additionalAllergies}
                onChange={handleChange}
                placeholder="e.g., Sesame, Mustard"
              />
            </div>
          </CardContent>
        );
      case 3:
        return (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxCookTime">Max Cooking Time (minutes)</Label>
              <Select value={planData.maxCookTime.toString()} onValueChange={(value) => setPlanData(prev => ({ ...prev, maxCookTime: parseInt(value) }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[15, 30, 45, 60, 90].map(time => (
                    <SelectItem key={time} value={time.toString()}>{time} minutes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cooking Skill Level</Label>
              <RadioGroup defaultValue={planData.cookingSkillLevel} onValueChange={(value) => setPlanData(prev => ({ ...prev, cookingSkillLevel: value }))} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Beginner" id="beginner" />
                  <Label htmlFor="beginner">Beginner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Advanced" id="advanced" />
                  <Label htmlFor="advanced">Advanced</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>Budget Range</Label>
              <RadioGroup defaultValue={planData.budgetRange} onValueChange={(value) => setPlanData(prev => ({ ...prev, budgetRange: value }))} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="High" id="high" />
                  <Label htmlFor="high">High</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>Health Goals</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Weight Loss", "Muscle Gain", "Healthy Eating", "Improved Energy", "Balanced Diet"].map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      name="healthGoals"
                      value={option}
                      checked={planData.healthGoals.includes(option)}
                      onCheckedChange={(checked) => handleChange({
                        target: {
                          name: "healthGoals",
                          value: option,
                          type: "checkbox",
                          checked: checked === true,
                        }
                      } as any)}
                    />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Meal Planner
        </Button>
        <h2 className="text-2xl font-bold">{isEditing ? "Edit Meal Plan" : "Create AI Meal Plan"}</h2>
        <div></div>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg font-semibold">Step {step} of 3</CardTitle>
          <CardDescription>Fill in the details to create your personalized meal plan.</CardDescription>
        </CardHeader>
        {renderStepContent()}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {step < 3 ? (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={generateMealPlan} disabled={isGenerating || isLoading}>
            {isGenerating || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Meal Plan
              </>
            )}
          </Button>
        )}
      </div>

      {/* Success Modal */}
      <MealPlanSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessPlan(null);
        }}
        onViewPlan={handleViewSuccessPlan}
        mealPlan={successPlan ? {
          name: successPlan.name,
          numberOfDays: successPlan.numberOfDays || 7,
          numberOfPersons: successPlan.numberOfPersons || 1,
          mealsPerDay: successPlan.mealsPerDay || 3
        } : undefined}
      />

      {/* Timeout Modal */}
      <MealPlanTimeoutModal
        isOpen={showTimeoutModal}
        onClose={() => {
          setShowTimeoutModal(false);
          onBack();
        }}
      />
    </div>
  );
};

export default MealPlanCreatorStepper;
