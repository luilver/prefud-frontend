import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Send,
  Sparkles,
  ChefHat,
  Bot,
  User,
  Check,
  RotateCcw,
  Plus,
  Minus,
  Utensils,
  Calendar,
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
import MealPlanView from "./MealPlanView";
import { trackEvent } from "@/services/analytics";

interface MealPlanCreatorStepperProps {
  onPlanCreated: (plan: any) => void;
  onBack: () => void;
  initialData?: any;
  isEditing?: boolean;
}

type ChatStep =
  | "planName"
  | "planDescription"
  | "startDate"
  | "numberOfDays"
  | "numberOfPersons"
  | "kidsUnder5"
  | "kids5to12"
  | "mealsPerDay"
  | "dietary"
  | "cuisine"
  | "maxCookTime"
  | "skillLevel"
  | "budgetRange"
  | "allergies"
  | "healthGoals"
  | "extras"
  | "summary"
  | "generating";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  options?: { key: string; label: string }[];
  multiSelect?: boolean;
  inputType?: "text" | "textarea" | "date" | "stepper";
  step?: ChatStep;
  selected?: string[];
  skippable?: boolean;
}

const MealPlanCreatorStepper = ({
  onPlanCreated,
  onBack,
  initialData,
  isEditing,
}: MealPlanCreatorStepperProps) => {
  const { user, refreshMealPlans } = useUser();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { showLoader, hideLoader, LoaderComponent } = useCookingLoader();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState<ChatStep>("planName");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const initializedRef = useRef(false);

  // Stepper values
  const [numberOfDays, setNumberOfDays] = useState(initialData?.preferences?.numberOfDays || 7);
  const [numberOfPersons, setNumberOfPersons] = useState(initialData?.preferences?.numberOfPersons || 1);
  const [kidsUnder5, setKidsUnder5] = useState(initialData?.preferences?.numberKidsLessThan5 || 0);
  const [kids5to12, setKids5to12] = useState(initialData?.preferences?.numberKids5To12 || 0);
  const [mealsPerDay, setMealsPerDay] = useState(initialData?.preferences?.mealsPerDay || 3);
  const [maxCookTime, setMaxCookTime] = useState(initialData?.preferences?.maxCookingTime || 30);

  const [customCuisine, setCustomCuisine] = useState("");
  const [showCustomCuisineInput, setShowCustomCuisineInput] = useState(false);
  const [customAllergy, setCustomAllergy] = useState("");
  const [showCustomAllergyInput, setShowCustomAllergyInput] = useState(false);

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [createdPlan, setCreatedPlan] = useState<any>(null);
  const [showPlanView, setShowPlanView] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const [planData, setPlanData] = useState<any>({
    planName: initialData?.name || "",
    planDescription: initialData?.description || "",
    startDate: initialData?.startDate || "",
    numberOfDays: initialData?.preferences?.numberOfDays || 7,
    numberOfPersons: initialData?.preferences?.numberOfPersons || 1,
    numberKidsLessThan5: initialData?.preferences?.numberKidsLessThan5 || 0,
    numberKids5To12: initialData?.preferences?.numberKids5To12 || 0,
    mealsPerDay: initialData?.preferences?.mealsPerDay || 3,
    dietaryRestrictions: initialData?.preferences?.dietaryRestrictions || [],
    cuisinePreferences: initialData?.preferences?.cuisinePreferences || [],
    allergiesIntolerances: initialData?.preferences?.allergiesIntolerance || [],
    maxCookTime: initialData?.preferences?.maxCookingTime || 30,
    cookingSkillLevel: initialData?.preferences?.cookingSkillLevel || "",
    budgetRange: initialData?.preferences?.budgetRange || "",
    healthGoals: initialData?.preferences?.healthGoals || [],
    dislikes: "",
    additionalAllergies: "",
  });

  // Options
  const dietaryOptions = [
    { key: "Vegetarian", label: t("mealPlanCreator.dietary.vegetarian") || "Vegetarian" },
    { key: "Vegan", label: t("mealPlanCreator.dietary.vegan") || "Vegan" },
    { key: "Gluten-Free", label: t("mealPlanCreator.dietary.glutenFree") || "Gluten-Free" },
    { key: "Dairy-Free", label: t("mealPlanCreator.dietary.dairyFree") || "Dairy-Free" },
    { key: "Keto", label: t("mealPlanCreator.dietary.keto") || "Keto" },
    { key: "Paleo", label: t("mealPlanCreator.dietary.paleo") || "Paleo" },
    { key: "Autism", label: t("mealPlanCreator.dietary.autism") || "Autism" },
  ];

  const cuisineOptions = [
    { key: "Italian", label: t("mealPlanCreator.cuisine.italian") || "Italian" },
    { key: "Mexican", label: t("mealPlanCreator.cuisine.mexican") || "Mexican" },
    { key: "Asian", label: t("mealPlanCreator.cuisine.asian") || "Asian" },
    { key: "American", label: t("mealPlanCreator.cuisine.american") || "American" },
    { key: "Ecuadorian", label: t("mealPlanCreator.cuisine.ecuadorian") || "Ecuadorian" },
    { key: "Chinese", label: t("mealPlanCreator.cuisine.chinese") || "Chinese" },
    { key: "Indian", label: t("mealPlanCreator.cuisine.indian") || "Indian" },
    { key: "__other__", label: t("mealPlanCreator.cuisine.other") || "Other" },
  ];

  const allergiesOptions = [
    { key: "Nuts", label: t("mealPlanCreator.dietary.allergy.nuts") || "Nuts" },
    { key: "Shellfish", label: t("mealPlanCreator.dietary.allergy.shellfish") || "Shellfish" },
    { key: "Soy", label: t("mealPlanCreator.dietary.allergy.soy") || "Soy" },
    { key: "Eggs", label: t("mealPlanCreator.dietary.allergy.eggs") || "Eggs" },
    { key: "Fish", label: t("mealPlanCreator.dietary.allergy.fish") || "Fish" },
    { key: "__other__", label: t("mealPlanCreator.allergy.other") || "Other" },
  ];

  const healthGoalsOptions = [
    { key: "Weight Loss", label: t("mealPlanCreator.healthGoals.weightLoss") || "Weight Loss" },
    { key: "Muscle Gain", label: t("mealPlanCreator.healthGoals.muscleGain") || "Muscle Gain" },
    { key: "Heart Health", label: t("mealPlanCreator.healthGoals.heartHealth") || "Heart Health" },
    { key: "Diabetes Friendly", label: t("mealPlanCreator.healthGoals.diabetesFriendly") || "Diabetes Friendly" },
  ];

  const skillOptions = [
    { key: "Beginner", label: t("mealPlanCreator.cooking.skillLevel.beginner") || "Beginner" },
    { key: "Intermediate", label: t("mealPlanCreator.cooking.skillLevel.inter") || "Intermediate" },
    { key: "Advanced", label: t("mealPlanCreator.cooking.skillLevel.adv") || "Advanced" },
  ];

  const budgetOptions = [
    { key: "Low", label: t("mealPlanCreator.cooking.budget.low") || "Low" },
    { key: "Medium", label: t("mealPlanCreator.cooking.budget.medium") || "Medium" },
    { key: "High", label: t("mealPlanCreator.cooking.budget.high") || "High" },
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStep]);

  // Initialize first bot message
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    addBotMessage(
      t("mealPlanCreator.chat.welcome") || "👋 Hi! Let's create your personalized meal plan. What would you like to name it?",
      undefined,
      { inputType: "text" }
    );
  }, []);

  const addBotMessage = (text: string, options?: { key: string; label: string }[], config?: Partial<ChatMessage>) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      role: "bot",
      text,
      options,
      ...config,
    };
    setMessages((prev) => [...prev, msg]);
  };

  const addUserMessage = (text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleOptionSelect = (key: string, label: string) => {
    if (currentStep === "skillLevel") {
      addUserMessage(label);
      setPlanData((prev: any) => ({ ...prev, cookingSkillLevel: key }));
      setCurrentStep("budgetRange");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.budget") || "💰 What's your budget range?",
          budgetOptions
        );
      }, 400);
    } else if (currentStep === "budgetRange") {
      addUserMessage(label);
      setPlanData((prev: any) => ({ ...prev, budgetRange: key }));
      setCurrentStep("allergies");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.allergies") || "⚠️ Any allergies or food intolerances?",
          allergiesOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    }
  };

  const handleMultiSelectConfirm = () => {
    const allOpts = [...dietaryOptions, ...cuisineOptions, ...healthGoalsOptions, ...allergiesOptions];
    const labels = multiSelected.map((k) => allOpts.find((o) => o.key === k)?.label || k);

    if (currentStep === "dietary") {
      addUserMessage(multiSelected.length > 0 ? labels.join(", ") : t("mealPlanCreator.chat.none") || "None");
      setPlanData((prev: any) => ({ ...prev, dietaryRestrictions: [...multiSelected] }));
      setMultiSelected([]);
      setCurrentStep("cuisine");
      setShowCustomCuisineInput(false);
      setCustomCuisine("");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.cuisine") || "🌍 Any cuisine preferences? Select all that apply.",
          cuisineOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "cuisine") {
      const finalCuisine = [...multiSelected.filter(k => k !== "__other__")];
      if (customCuisine.trim()) finalCuisine.push(customCuisine.trim());
      const displayLabels = finalCuisine.map((k) => {
        const found = cuisineOptions.find((o) => o.key === k);
        return found ? found.label : k;
      });
      addUserMessage(displayLabels.length > 0 ? displayLabels.join(", ") : t("mealPlanCreator.chat.none") || "None");
      setPlanData((prev: any) => ({ ...prev, cuisinePreferences: finalCuisine }));
      setMultiSelected([]);
      setShowCustomCuisineInput(false);
      setCustomCuisine("");
      setCurrentStep("maxCookTime");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.maxCookTime") || "⏱️ What's the maximum cooking time per meal (in minutes)?",
          undefined,
          { inputType: "stepper" }
        );
      }, 400);
    } else if (currentStep === "allergies") {
      const finalAllergies = [...multiSelected.filter(k => k !== "__other__")];
      if (customAllergy.trim()) finalAllergies.push(customAllergy.trim());
      const displayAllergyLabels = finalAllergies.map((k) => {
        const found = allergiesOptions.find((o) => o.key === k);
        return found ? found.label : k;
      });
      addUserMessage(displayAllergyLabels.length > 0 ? displayAllergyLabels.join(", ") : t("mealPlanCreator.chat.none") || "None");
      setPlanData((prev: any) => ({ ...prev, allergiesIntolerances: finalAllergies }));
      setMultiSelected([]);
      setShowCustomAllergyInput(false);
      setCustomAllergy("");
      setCurrentStep("healthGoals");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.healthGoals") || "💪 Any health goals for this plan?",
          healthGoalsOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "healthGoals") {
      addUserMessage(multiSelected.length > 0 ? labels.join(", ") : t("mealPlanCreator.chat.none") || "None");
      setPlanData((prev: any) => ({ ...prev, healthGoals: [...multiSelected] }));
      setMultiSelected([]);
      setCurrentStep("extras");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.extras") || "📝 Any dislikes or special requests? (Optional)",
          undefined,
          { inputType: "textarea", skippable: true }
        );
      }, 400);
    }
  };

  const toggleMultiSelect = (key: string) => {
    if (key === "__other__") {
      if (currentStep === "cuisine") {
        setShowCustomCuisineInput((prev) => !prev);
        if (showCustomCuisineInput) setCustomCuisine("");
      } else if (currentStep === "allergies") {
        setShowCustomAllergyInput((prev) => !prev);
        if (showCustomAllergyInput) setCustomAllergy("");
      }
      return;
    }
    setMultiSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleTextSubmit = () => {
    const value = textInput.trim();

    if (currentStep === "planName") {
      if (!value) {
        toast({ title: t("mealPlanCreator.chat.missingName") || "Please enter a plan name.", variant: "destructive" });
        return;
      }
      addUserMessage(value);
      setPlanData((prev: any) => ({ ...prev, planName: value }));
      setTextInput("");
      setCurrentStep("planDescription");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.description") || "📝 Add a brief description for your plan. (Optional)",
          undefined,
          { inputType: "text", skippable: true }
        );
      }, 400);
    } else if (currentStep === "planDescription") {
      addUserMessage(value || (t("mealPlanCreator.chat.skipped") || "Skipped"));
      setPlanData((prev: any) => ({ ...prev, planDescription: value || `Personalized meal plan` }));
      setTextInput("");
      setCurrentStep("startDate");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.startDate") || "📅 When should your meal plan start?",
          undefined,
          { inputType: "date" }
        );
      }, 400);
    } else if (currentStep === "extras") {
      addUserMessage(value || (t("mealPlanCreator.chat.skipped") || "Skipped"));
      setPlanData((prev: any) => ({ ...prev, dislikes: value, additionalAllergies: value }));
      setTextInput("");
      setCurrentStep("summary");
      setTimeout(() => showSummary(), 400);
    }
  };

  const handleDateSubmit = () => {
    const value = textInput.trim();
    if (!value) {
      toast({ title: t("mealPlanCreator.chat.missingDate") || "Please select a start date.", variant: "destructive" });
      return;
    }
    addUserMessage(value);
    setPlanData((prev: any) => ({ ...prev, startDate: value }));
    setTextInput("");
    setCurrentStep("numberOfDays");
    setTimeout(() => {
      addBotMessage(
        t("mealPlanCreator.chat.numberOfDays") || "📆 How many days should the plan cover?",
        undefined,
        { inputType: "stepper" }
      );
    }, 400);
  };

  // Stepper config
  const getStepperConfig = () => {
    switch (currentStep) {
      case "numberOfDays": return { value: numberOfDays, set: setNumberOfDays, min: 1, max: 30, step: 1, label: t("mealPlanCreator.numberOfDays") || "Days" };
      case "numberOfPersons": return { value: numberOfPersons, set: setNumberOfPersons, min: 1, max: 20, step: 1, label: t("mealPlanCreator.numberOfPersons") || "Persons" };
      case "kidsUnder5": return { value: kidsUnder5, set: setKidsUnder5, min: 0, max: 10, step: 1, label: t("mealPlanCreator.kidsUnder5") || "Kids under 5" };
      case "kids5to12": return { value: kids5to12, set: setKids5to12, min: 0, max: 10, step: 1, label: t("mealPlanCreator.kidsFrom5to12") || "Kids 5-12" };
      case "mealsPerDay": return { value: mealsPerDay, set: setMealsPerDay, min: 1, max: 6, step: 1, label: t("mealPlanCreator.mealsPerDay") || "Meals/Day" };
      case "maxCookTime": return { value: maxCookTime, set: setMaxCookTime, min: 5, max: 180, step: 5, label: t("mealPlanCreator.cooking.maxCook") || "Max Cook Time (min)" };
      default: return null;
    }
  };

  const handleStepperChange = (delta: number) => {
    const config = getStepperConfig();
    if (!config) return;
    config.set((prev: number) => Math.max(config.min, Math.min(config.max, prev + delta * config.step)));
  };

  const handleStepperSubmit = () => {
    const config = getStepperConfig();
    if (!config) return;

    addUserMessage(`${config.value}`);

    if (currentStep === "numberOfDays") {
      setPlanData((prev: any) => ({ ...prev, numberOfDays: numberOfDays }));
      setCurrentStep("numberOfPersons");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.numberOfPersons") || "👥 How many adults will be eating?",
          undefined,
          { inputType: "stepper" }
        );
      }, 400);
    } else if (currentStep === "numberOfPersons") {
      setPlanData((prev: any) => ({ ...prev, numberOfPersons: numberOfPersons }));
      setCurrentStep("kidsUnder5");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.kidsUnder5") || "👶 How many kids under 5 years?",
          undefined,
          { inputType: "stepper" }
        );
      }, 400);
    } else if (currentStep === "kidsUnder5") {
      setPlanData((prev: any) => ({ ...prev, numberKidsLessThan5: kidsUnder5 }));
      setCurrentStep("kids5to12");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.kids5to12") || "🧒 How many kids between 5 and 12?",
          undefined,
          { inputType: "stepper" }
        );
      }, 400);
    } else if (currentStep === "kids5to12") {
      setPlanData((prev: any) => ({ ...prev, numberKids5To12: kids5to12 }));
      setCurrentStep("mealsPerDay");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.mealsPerDay") || "🍽️ How many meals per day?",
          undefined,
          { inputType: "stepper" }
        );
      }, 400);
    } else if (currentStep === "mealsPerDay") {
      setPlanData((prev: any) => ({ ...prev, mealsPerDay: mealsPerDay }));
      setCurrentStep("dietary");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.dietary") || "🥗 Any dietary restrictions? Select all that apply.",
          dietaryOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "maxCookTime") {
      setPlanData((prev: any) => ({ ...prev, maxCookTime: maxCookTime }));
      setCurrentStep("skillLevel");
      setTimeout(() => {
        addBotMessage(
          t("mealPlanCreator.chat.skillLevel") || "👨‍🍳 What's your cooking skill level?",
          skillOptions
        );
      }, 400);
    }
  };

  const showSummary = () => {
    const d = planData;
    const lines = [
      `✅ **${t("mealPlanCreator.chat.summaryTitle") || "Here's your meal plan summary:"}**`,
      "",
      `📛 ${t("mealPlanCreator.name") || "Name"}: ${d.planName}`,
      d.planDescription ? `📝 ${t("mealPlanCreator.description") || "Description"}: ${d.planDescription}` : "",
      `📅 ${t("mealPlanCreator.startDate") || "Start Date"}: ${d.startDate}`,
      `📆 ${t("mealPlanCreator.numberOfDays") || "Days"}: ${d.numberOfDays}`,
      `👥 ${t("mealPlanCreator.numberOfPersons") || "Adults"}: ${d.numberOfPersons}`,
      d.numberKidsLessThan5 > 0 ? `👶 ${t("mealPlanCreator.kidsUnder5") || "Kids under 5"}: ${d.numberKidsLessThan5}` : "",
      d.numberKids5To12 > 0 ? `🧒 ${t("mealPlanCreator.kidsFrom5to12") || "Kids 5-12"}: ${d.numberKids5To12}` : "",
      `🍽️ ${t("mealPlanCreator.mealsPerDay") || "Meals/Day"}: ${d.mealsPerDay}`,
      `⏱️ ${t("mealPlanCreator.cooking.maxCook") || "Max Cook Time"}: ${d.maxCookTime} min`,
      `👨‍🍳 ${t("mealPlanner.skillLevel") || "Skill Level"}: ${d.cookingSkillLevel}`,
      `💰 ${t("mealPlanCreator.budget") || "Budget"}: ${d.budgetRange}`,
      d.dietaryRestrictions?.length ? `🥗 ${t("mealPlanCreator.dietary.restrictions") || "Dietary"}: ${d.dietaryRestrictions.join(", ")}` : "",
      d.cuisinePreferences?.length ? `🌍 ${t("mealPlanCreator.cuisine.title") || "Cuisine"}: ${d.cuisinePreferences.join(", ")}` : "",
      d.allergiesIntolerances?.length ? `⚠️ ${t("mealPlanCreator.dietary.allergies") || "Allergies"}: ${d.allergiesIntolerances.join(", ")}` : "",
      d.healthGoals?.length ? `💪 ${t("mealPlanCreator.dietary.healthGoals") || "Health Goals"}: ${d.healthGoals.join(", ")}` : "",
      d.dislikes ? `📝 ${t("mealPlanCreator.dislikes") || "Dislikes"}: ${d.dislikes}` : "",
      "",
      t("mealPlanCreator.chat.confirmPrompt") || "Looks good? Hit **Generate** to create your meal plan! 🚀",
    ]
      .filter(Boolean)
      .join("\n");

    addBotMessage(lines, undefined, { step: "summary" });
  };

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

  const handleGenerate = async () => {
    addUserMessage(t("mealPlanCreator.chat.letsGo") || "Let's go! 🚀");
    trackEvent("button_click", {
      button_name: "generate_plan_submit",
      screen: "generate_mealplan_page",
    });

    if (!user?.id) {
      toast({ title: "Authentication Required", description: "Please log in to create a meal plan.", variant: "destructive" });
      return;
    }

    const effectiveSkill = planData.cookingSkillLevel || "Intermediate";
    const effectiveBudget = planData.budgetRange || "Medium";

    showLoader(t("mealPlanCreator.chat.loaderMessage") || "Analyzing your preferences and creating your perfect meal plan...");

    const timeout = setTimeout(() => {
      hideLoader();
      setShowTimeoutModal(true);
    }, 180000);
    setTimeoutId(timeout);

    try {
      const requestData = {
        duration: planData.numberOfDays,
        numberPeople: planData.numberOfPersons,
        numberKidsLessThan5: planData.numberKidsLessThan5,
        numberKids5To12: planData.numberKids5To12,
        mealsPerDay: planData.mealsPerDay,
        dietaryRestrictions: planData.dietaryRestrictions,
        cuisinePreferences: planData.cuisinePreferences,
        allergiesIntolerance: planData.allergiesIntolerances,
        dislikes: [planData.dislikes, planData.additionalAllergies].filter((item) => item && item.trim()).join(", "),
        maxCookingTime: planData.maxCookTime,
        cookingSkillLevel: effectiveSkill,
        budgetRange: effectiveBudget,
        healthGoals: planData.healthGoals,
        language: getLanguageName(language),
        user_id: user.id,
        start_date: planData.startDate,
        plan_name: planData.planName,
        plan_description: planData.planDescription,
      };

      console.log("Creating meal plan with data:", requestData);

      const apiResponse = await createMealPlan(requestData);

      if (timeout) {
        clearTimeout(timeout);
        setTimeoutId(null);
      }

      hideLoader();

      const transformedPlan = transformApiMealPlanToLocal(apiResponse);
      setCreatedPlan(transformedPlan);

      toast({
        title: "🎉 Meal Plan Created Successfully!",
        description: "Your meal plan is ready to explore.",
        duration: 8000,
      });

      setShowSuccessModal(true);
      onPlanCreated(transformedPlan);
      await refreshMealPlans();
    } catch (error: any) {
      console.error("Error generating meal plan:", error);

      if (timeout) {
        clearTimeout(timeout);
        setTimeoutId(null);
      }

      hideLoader();

      if (
        error?.code === "03" ||
        error?.response?.data?.code === "03" ||
        (typeof error?.message === "string" && error.message.includes("No meal plans available according to your subscription"))
      ) {
        setShowUpgradeModal(true);
      } else {
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : "Failed to generate meal plan. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setPlanData({
      planName: "",
      planDescription: "",
      startDate: "",
      numberOfDays: 7,
      numberOfPersons: 1,
      numberKidsLessThan5: 0,
      numberKids5To12: 0,
      mealsPerDay: 3,
      dietaryRestrictions: [],
      cuisinePreferences: [],
      allergiesIntolerances: [],
      maxCookTime: 30,
      cookingSkillLevel: "",
      budgetRange: "",
      healthGoals: [],
      dislikes: "",
      additionalAllergies: "",
    });
    setMultiSelected([]);
    setTextInput("");
    setNumberOfDays(7);
    setNumberOfPersons(1);
    setKidsUnder5(0);
    setKids5to12(0);
    setMealsPerDay(3);
    setMaxCookTime(30);
    setCurrentStep("planName");
    setIsGenerating(false);
    setShowCustomCuisineInput(false);
    setShowCustomAllergyInput(false);
    setCustomCuisine("");
    setCustomAllergy("");
    setTimeout(() => {
      addBotMessage(
        t("mealPlanCreator.chat.welcome") || "👋 Hi! Let's create your personalized meal plan. What would you like to name it?",
        undefined,
        { inputType: "text" }
      );
    }, 100);
  };

  const handleSuccessModalClose = async () => {
    setShowSuccessModal(false);
    if (createdPlan) {
      onPlanCreated(createdPlan);
    }
    try {
      await refreshMealPlans();
    } catch (error) {
      console.error("Error refreshing meal plans:", error);
    }
  };

  const handleViewSuccessPlan = () => {
    if (createdPlan) {
      setShowSuccessModal(false);
      setShowPlanView(true);
    }
  };

  const handleTimeoutModalClose = async () => {
    setShowTimeoutModal(false);
    onBack();
    try {
      await refreshMealPlans();
    } catch (error) {
      console.error("Error refreshing meal plans:", error);
    }
  };

  if (showPlanView && createdPlan) {
    return (
      <MealPlanView
        plan={createdPlan}
        onBack={() => { setShowPlanView(false); onBack(); }}
        onEdit={() => setShowPlanView(false)}
      />
    );
  }

  const isMultiSelectStep = ["dietary", "cuisine", "healthGoals", "allergies"].includes(currentStep);
  const isTextStep = ["planName", "planDescription", "extras"].includes(currentStep);
  const isDateStep = currentStep === "startDate";
  const isStepperStep = ["numberOfDays", "numberOfPersons", "kidsUnder5", "kids5to12", "mealsPerDay", "maxCookTime"].includes(currentStep);
  const isSingleSelectStep = currentStep === "skillLevel" || currentStep === "budgetRange";
  const isSummaryStep = currentStep === "summary";

  const currentMultiOptions =
    currentStep === "dietary" ? dietaryOptions :
    currentStep === "cuisine" ? cuisineOptions :
    currentStep === "healthGoals" ? healthGoalsOptions :
    currentStep === "allergies" ? allergiesOptions : [];

  const currentSingleOptions =
    currentStep === "skillLevel" ? skillOptions :
    currentStep === "budgetRange" ? budgetOptions : [];

  const stepperConfig = getStepperConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full max-h-[100dvh] flex flex-col">
      <LoaderComponent />
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] shrink-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white/80 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("common.back") || "Back"}
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-white">
                {isEditing ? t("mealPlanCreator.chat.editTitle") || "Edit Meal Plan" : t("mealPlanCreator.chat.createTitle") || "AI Meal Plan"}
              </h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRestart} className="text-white/80 hover:text-white hover:bg-white/10">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-3 space-y-3 pb-3" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 ${
                    msg.role === "bot" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-white/20"
                  }`}>
                    {msg.role === "bot" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "bot"
                      ? "bg-white/95 text-gray-800 rounded-tl-sm shadow-md"
                      : "bg-emerald-500 text-white rounded-tr-sm shadow-md"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Active multi-select chips */}
            {isMultiSelectStep && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%] md:max-w-[70%]">
                  <div className="shrink-0 w-7 h-7" />
                  <div className="bg-white/95 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md w-full">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {currentMultiOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => toggleMultiSelect(opt.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            multiSelected.includes(opt.key) || (opt.key === "__other__" && ((currentStep === "cuisine" && showCustomCuisineInput) || (currentStep === "allergies" && showCustomAllergyInput)))
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {multiSelected.includes(opt.key) && <Check className="inline h-3 w-3 mr-1" />}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {currentStep === "cuisine" && showCustomCuisineInput && (
                      <div className="flex gap-2 mt-2">
                        <input
                          value={customCuisine}
                          onChange={(e) => setCustomCuisine(e.target.value.slice(0, 30))}
                          placeholder={t("mealPlanCreator.cuisine.customCountryPlaceholder") || "Type your cuisine..."}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-emerald-400"
                          maxLength={30}
                        />
                      </div>
                    )}
                    {currentStep === "allergies" && showCustomAllergyInput && (
                      <div className="flex gap-2 mt-2">
                        <input
                          value={customAllergy}
                          onChange={(e) => setCustomAllergy(e.target.value.slice(0, 30))}
                          placeholder={t("mealPlanCreator.allergy.otherPlaceholder") || "Type your allergy..."}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-emerald-400"
                          maxLength={30}
                        />
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={handleMultiSelectConfirm}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-full px-4"
                      >
                        {(multiSelected.filter(k => k !== "__other__").length > 0 || (currentStep === "cuisine" && customCuisine.trim()) || (currentStep === "allergies" && customAllergy.trim()))
                          ? `${t("mealPlanCreator.chat.confirm") || "Confirm"} (${multiSelected.filter(k => k !== "__other__").length + ((currentStep === "cuisine" && customCuisine.trim()) || (currentStep === "allergies" && customAllergy.trim()) ? 1 : 0)})`
                          : t("mealPlanCreator.chat.skip") || "Skip →"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Single-select options */}
            {isSingleSelectStep && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%] md:max-w-[70%]">
                  <div className="shrink-0 w-7 h-7" />
                  <div className="bg-white/95 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md w-full">
                    <div className="flex flex-wrap gap-2">
                      {currentSingleOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => handleOptionSelect(opt.key, opt.label)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors border border-emerald-200"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper input */}
            {isStepperStep && stepperConfig && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%] md:max-w-[70%]">
                  <div className="shrink-0 w-7 h-7" />
                  <div className="bg-white/95 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md w-full">
                    <label className="text-xs font-medium text-gray-500 mb-2 block">{stepperConfig.label}</label>
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <button
                        onClick={() => handleStepperChange(-1)}
                        disabled={stepperConfig.value <= stepperConfig.min}
                        className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-2xl font-bold text-gray-800 min-w-[60px] text-center">
                        {stepperConfig.value}
                      </span>
                      <button
                        onClick={() => handleStepperChange(1)}
                        disabled={stepperConfig.value >= stepperConfig.max}
                        className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleStepperSubmit}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-full px-4 w-full"
                    >
                      {t("mealPlanCreator.chat.continue") || "Continue"} →
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary generate button */}
            {isSummaryStep && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleGenerate}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-8 shadow-lg shadow-emerald-500/30"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t("mealPlanCreator.generate.btn") || "Generate My Meal Plan"}
                </Button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Text Input Area */}
          {isTextStep && (
            <div className="shrink-0 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2">
              <div className="flex gap-2 bg-white/95 rounded-full px-4 py-2 shadow-lg items-center">
                <input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                  placeholder={
                    currentStep === "planName"
                      ? (t("mealPlanCreator.planNamePlaceholder") || "e.g., Weekly Healthy Meals")
                      : currentStep === "planDescription"
                      ? (t("mealPlanCreator.planDescriptionPlaceholder") || "Describe your plan goals...")
                      : (t("mealPlanCreator.chat.extrasPlaceholder") || "Type here or skip...")
                  }
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                  maxLength={currentStep === "planName" ? 50 : 100}
                />
                <Button
                  size="sm"
                  onClick={handleTextSubmit}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {(currentStep === "planDescription" || currentStep === "extras") && (
                <button
                  onClick={() => { setTextInput(""); handleTextSubmit(); }}
                  className="text-xs text-white/60 hover:text-white/90 mt-1.5 ml-4 transition-colors"
                >
                  {t("mealPlanCreator.chat.skip") || "Skip →"}
                </button>
              )}
            </div>
          )}

          {/* Date Input Area */}
          {isDateStep && (
            <div className="shrink-0 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2">
              <div className="flex gap-2 bg-white/95 rounded-full px-4 py-2 shadow-lg items-center">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDateSubmit()}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800"
                />
                <Button
                  size="sm"
                  onClick={handleDateSubmit}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

      <MealPlanSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onViewPlan={handleViewSuccessPlan}
        mealPlan={createdPlan ? {
          name: createdPlan.name || planData.planName,
          numberOfDays: planData.numberOfDays,
          numberOfPersons: planData.numberOfPersons,
          mealsPerDay: planData.mealsPerDay,
        } : undefined}
      />

      <MealPlanTimeoutModal
        isOpen={showTimeoutModal}
        onClose={handleTimeoutModalClose}
      />

      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      </div>
    </div>
  );
};

export default MealPlanCreatorStepper;
