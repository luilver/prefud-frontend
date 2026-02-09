import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Sparkles, ChefHat, Bot, User, Check, RotateCcw, Plus, Minus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import AIMealGeneration from "./AIMealGeneration";
import { trackEvent } from "@/services/analytics";

interface AIMealCreatorStepperProps {
  onBack: () => void;
  onMealCreated: (meal: any) => void;
}

type ChatStep =
  | "mealType"
  | "mealName"
  | "dishName"
  | "servings"
  | "cookingTime"
  | "skillLevel"
  | "budgetRange"
  | "dietary"
  | "cuisine"
  | "healthGoals"
  | "allergies"
  | "extras"
  | "summary"
  | "generating";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  options?: { key: string; label: string }[];
  multiSelect?: boolean;
  inputType?: "text" | "number" | "textarea" | "stepper";
  step?: ChatStep;
  selected?: string[];
  skippable?: boolean;
}

const AIMealCreatorStepper = ({ onBack, onMealCreated }: AIMealCreatorStepperProps) => {
  const { user } = useUser();
  const { language, t } = useLanguage();
  const { showLoader, hideLoader, LoaderComponent } = useCookingLoader();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState<ChatStep>("mealType");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const initializedRef = useRef(false);

  // Stepper inputs
  const [servings, setServings] = useState(2);
  const [cookingTime, setCookingTime] = useState(30);
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [budgetRange, setBudgetRange] = useState("medium");

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

  const mealTypeOptions = [
    { key: "Breakfast", label: t("aiMealCreatorStepper.mealType.breakfast") || "Breakfast" },
    { key: "Lunch", label: t("aiMealCreatorStepper.mealType.lunch") || "Lunch" },
    { key: "Dinner", label: t("aiMealCreatorStepper.mealType.dinner") || "Dinner" },
    { key: "Snack", label: t("aiMealCreatorStepper.mealType.snack") || "Snack" },
    { key: "Dessert", label: t("aiMealCreatorStepper.mealType.dessert") || "Dessert" },
    { key: "Appetizer", label: t("aiMealCreatorStepper.mealType.appetizer") || "Appetizer" },
  ];

  const dietaryOptions = [
    { key: "Vegetarian", label: t("aiMealCreatorStepper.dietary.vegetarian") || "Vegetarian" },
    { key: "Vegan", label: t("aiMealCreatorStepper.dietary.vegan") || "Vegan" },
    { key: "Gluten-Free", label: t("aiMealCreatorStepper.dietary.glutenfree") || "Gluten-Free" },
    { key: "Dairy-Free", label: t("aiMealCreatorStepper.dietary.dairyfree") || "Dairy-Free" },
    { key: "Keto", label: t("aiMealCreatorStepper.dietary.keto") || "Keto" },
    { key: "Paleo", label: t("aiMealCreatorStepper.dietary.paleo") || "Paleo" },
    { key: "Low-Carb", label: t("aiMealCreatorStepper.dietary.lowcarb") || "Low-Carb" },
    { key: "Pescatarian", label: t("aiMealCreatorStepper.dietary.pescatarian") || "Pescatarian" },
  ];

  const cuisineOptions = [
    { key: "Italian", label: t("aiMealCreatorStepper.cuisine.italian") || "Italian" },
    { key: "Mexican", label: t("aiMealCreatorStepper.cuisine.mexican") || "Mexican" },
    { key: "Asian", label: t("aiMealCreatorStepper.cuisine.asian") || "Asian" },
    { key: "Mediterranean", label: t("aiMealCreatorStepper.cuisine.mediterranean") || "Mediterranean" },
    { key: "Indian", label: t("aiMealCreatorStepper.cuisine.indian") || "Indian" },
    { key: "American", label: t("aiMealCreatorStepper.cuisine.american") || "American" },
    { key: "French", label: t("aiMealCreatorStepper.cuisine.french") || "French" },
    { key: "Japanese", label: t("aiMealCreatorStepper.cuisine.japanese") || "Japanese" },
    { key: "Thai", label: t("aiMealCreatorStepper.cuisine.thai") || "Thai" },
    { key: "Chinese", label: t("aiMealCreatorStepper.cuisine.chinese") || "Chinese" },
    { key: "Spanish", label: t("aiMealCreatorStepper.cuisine.spanish") || "Spanish" },
    { key: "Greek", label: t("aiMealCreatorStepper.cuisine.greek") || "Greek" },
  ];

  const healthGoalsOptions = [
    { key: "Weight Loss", label: t("aiMealCreatorStepper.health.weightloss") || "Weight Loss" },
    { key: "Muscle Gain", label: t("aiMealCreatorStepper.health.musclegain") || "Muscle Gain" },
    { key: "Heart Health", label: t("aiMealCreatorStepper.health.hearthealth") || "Heart Health" },
    { key: "Energy Boost", label: t("aiMealCreatorStepper.health.energyboost") || "Energy Boost" },
    { key: "Immune Support", label: t("aiMealCreatorStepper.health.immunesupport") || "Immune Support" },
    { key: "Digestive Health", label: t("aiMealCreatorStepper.health.digestivehealth") || "Digestive Health" },
    { key: "Anti-Inflammatory", label: t("aiMealCreatorStepper.health.antiinflammatory") || "Anti-Inflammatory" },
    { key: "Detox", label: t("aiMealCreatorStepper.health.detox") || "Detox" },
  ];

  const allergiesOptions = [
    { key: "Nuts", label: t("aiMealCreatorStepper.allergy.nuts") || "Nuts" },
    { key: "Peanuts", label: t("aiMealCreatorStepper.allergy.peanuts") || "Peanuts" },
    { key: "Shellfish", label: t("aiMealCreatorStepper.allergy.shellfish") || "Shellfish" },
    { key: "Eggs", label: t("aiMealCreatorStepper.allergy.eggs") || "Eggs" },
    { key: "Dairy", label: t("aiMealCreatorStepper.allergy.dairy") || "Dairy" },
    { key: "Soy", label: t("aiMealCreatorStepper.allergy.soy") || "Soy" },
    { key: "Wheat", label: t("aiMealCreatorStepper.allergy.wheat") || "Wheat" },
    { key: "Sesame", label: t("aiMealCreatorStepper.allergy.sesame") || "Sesame" },
  ];

  const skillOptions = [
    { key: "beginner", label: t("aiMealCreatorStepper.skillLevel.beginner") || "Beginner" },
    { key: "intermediate", label: t("aiMealCreatorStepper.skillLevel.intermediate") || "Intermediate" },
    { key: "advanced", label: t("aiMealCreatorStepper.skillLevel.advanced") || "Advanced" },
  ];

  const budgetOptions = [
    { key: "low", label: t("aiMealCreatorStepper.budget.low") || "Low" },
    { key: "medium", label: t("aiMealCreatorStepper.budget.medium") || "Medium" },
    { key: "high", label: t("aiMealCreatorStepper.budget.high") || "High" },
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStep]);

  // Initialize first bot message (ref guard against StrictMode double-run)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    addBotMessage(
      t("aiMealCreatorStepper.chat.welcome") || "👋 Hi! I'm your AI meal assistant. Let's create something delicious together! What type of meal are you craving?",
      mealTypeOptions
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
    if (currentStep === "mealType") {
      addUserMessage(label);
      setMealData((prev: any) => ({ ...prev, mealType: key }));
      setCurrentStep("mealName");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.mealName") || "Great choice! 🎉 Do you have a name for this meal? (Optional - just type or skip)",
          undefined,
          { inputType: "text", skippable: true }
        );
      }, 400);
    } else if (currentStep === "skillLevel") {
      addUserMessage(label);
      setSkillLevel(key);
      setMealData((prev: any) => ({ ...prev, cookingSkillLevel: key }));
      setCurrentStep("budgetRange");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.budget") || "💰 What's your budget range for this meal?",
          budgetOptions
        );
      }, 400);
    } else if (currentStep === "budgetRange") {
      addUserMessage(label);
      setBudgetRange(key);
      setMealData((prev: any) => ({ ...prev, budgetRange: key }));
      setCurrentStep("dietary");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.dietary") || "🥗 Any dietary restrictions? Select all that apply.",
          dietaryOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    }
  };

  const handleMultiSelectConfirm = () => {
    const labels = multiSelected.map((k) => {
      const allOpts = [...dietaryOptions, ...cuisineOptions, ...healthGoalsOptions, ...allergiesOptions];
      return allOpts.find((o) => o.key === k)?.label || k;
    });

    if (currentStep === "dietary") {
      addUserMessage(multiSelected.length > 0 ? labels.join(", ") : t("aiMealCreatorStepper.chat.none") || "None");
      setMealData((prev: any) => ({ ...prev, dietaryRestrictions: [...multiSelected] }));
      setMultiSelected([]);
      setCurrentStep("cuisine");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.cuisine") || "🌍 Any cuisine preferences? Select all that sound good!",
          cuisineOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "cuisine") {
      addUserMessage(multiSelected.length > 0 ? labels.join(", ") : t("aiMealCreatorStepper.chat.none") || "None");
      setMealData((prev: any) => ({ ...prev, cuisinePreferences: [...multiSelected] }));
      setMultiSelected([]);
      setCurrentStep("healthGoals");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.healthGoals") || "💪 Any health goals for this meal?",
          healthGoalsOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "healthGoals") {
      addUserMessage(multiSelected.length > 0 ? labels.join(", ") : t("aiMealCreatorStepper.chat.none") || "None");
      setMealData((prev: any) => ({ ...prev, healthGoals: [...multiSelected] }));
      setMultiSelected([]);
      setCurrentStep("allergies");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.allergies") || "⚠️ Any allergies or food intolerances I should know about?",
          allergiesOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "allergies") {
      addUserMessage(multiSelected.length > 0 ? labels.join(", ") : t("aiMealCreatorStepper.chat.none") || "None");
      setMealData((prev: any) => ({ ...prev, allergiesIntolerances: [...multiSelected] }));
      setMultiSelected([]);
      setCurrentStep("extras");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.extras") || "📝 Anything else? Dislikes, special requests, or custom allergies? (Optional)",
          undefined,
          { inputType: "textarea", skippable: true }
        );
      }, 400);
    }
  };

  const toggleMultiSelect = (key: string) => {
    setMultiSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleTextSubmit = () => {
    const value = textInput.trim();

    if (currentStep === "mealName") {
      addUserMessage(value || (t("aiMealCreatorStepper.chat.skipped") || "Skipped"));
      setMealData((prev: any) => ({ ...prev, mealName: value }));
      setTextInput("");
      setCurrentStep("dishName");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.dishName") || "🍽️ Do you have a specific dish in mind? e.g. Mac and Cheese (Optional)",
          undefined,
          { inputType: "text", skippable: true }
        );
      }, 400);
    } else if (currentStep === "dishName") {
      addUserMessage(value || (t("aiMealCreatorStepper.chat.skipped") || "Skipped"));
      setMealData((prev: any) => ({ ...prev, nameOfMeal: value }));
      setTextInput("");
      setCurrentStep("servings");
      setTimeout(() => {
        addBotMessage(
          t("aiMealCreatorStepper.chat.servings") || "👥 How many servings do you need?",
          undefined,
          { inputType: "stepper" }
        );
      }, 400);
    } else if (currentStep === "extras") {
      addUserMessage(value || (t("aiMealCreatorStepper.chat.skipped") || "Skipped"));
      setMealData((prev: any) => ({ ...prev, specialRequests: value, dislikes: value }));
      setTextInput("");
      setCurrentStep("summary");
      setTimeout(() => showSummary(), 400);
    }
  };

  const handleServingsSubmit = () => {
    addUserMessage(`${servings} ${t("aiMealCreatorStepper.chat.servingsLabel") || "servings"}`);
    setMealData((prev: any) => ({ ...prev, servings }));
    setCurrentStep("cookingTime");
    setTimeout(() => {
      addBotMessage(
        t("aiMealCreatorStepper.chat.cookTime") || "⏱️ What's the maximum cooking time (in minutes)?",
        undefined,
        { inputType: "stepper" }
      );
    }, 400);
  };

  const handleCookingTimeSubmit = () => {
    addUserMessage(`${cookingTime} min`);
    setMealData((prev: any) => ({ ...prev, cookingTime }));
    setCurrentStep("skillLevel");
    setTimeout(() => {
      addBotMessage(
        t("aiMealCreatorStepper.chat.skill") || "👨‍🍳 What's your cooking skill level?",
        skillOptions
      );
    }, 400);
  };

  const showSummary = () => {
    const d = mealData;
    const lines = [
      `✅ **${t("aiMealCreatorStepper.chat.readyTitle") || "Here's your meal plan summary:"}**`,
      "",
      `🍽️ ${t("aiMealCreatorStepper.review.mealType") || "Type"}: ${d.mealType}`,
      d.mealName ? `📛 ${t("aiMealCreatorStepper.review.mealName") || "Name"}: ${d.mealName}` : "",
      d.nameOfMeal ? `🍕 ${t("aiMealCreatorStepper.review.dish") || "Dish"}: ${d.nameOfMeal}` : "",
      `👥 ${t("aiMealCreatorStepper.review.servings") || "Servings"}: ${d.servings}`,
      `⏱️ ${t("aiMealCreatorStepper.review.cookingTime") || "Time"}: ${d.cookingTime} min`,
      `👨‍🍳 ${t("aiMealCreatorStepper.review.skillLevel") || "Skill"}: ${d.cookingSkillLevel}`,
      `💰 ${t("aiMealCreatorStepper.review.budget") || "Budget"}: ${d.budgetRange}`,
      d.dietaryRestrictions?.length ? `🥗 ${t("aiMealCreatorStepper.review.dietaryRestrictions") || "Diet"}: ${d.dietaryRestrictions.join(", ")}` : "",
      d.cuisinePreferences?.length ? `🌍 ${t("aiMealCreatorStepper.review.cuisinePreferences") || "Cuisine"}: ${d.cuisinePreferences.join(", ")}` : "",
      d.healthGoals?.length ? `💪 ${t("aiMealCreatorStepper.review.healthGoals") || "Goals"}: ${d.healthGoals.join(", ")}` : "",
      d.allergiesIntolerances?.length ? `⚠️ ${t("aiMealCreatorStepper.review.allergies") || "Allergies"}: ${d.allergiesIntolerances.join(", ")}` : "",
      d.specialRequests ? `📝 ${t("aiMealCreatorStepper.review.specialRequests") || "Notes"}: ${d.specialRequests}` : "",
      "",
      t("aiMealCreatorStepper.chat.confirmPrompt") || "Looks good? Hit **Generate** to create your meal! 🚀",
    ]
      .filter(Boolean)
      .join("\n");

    addBotMessage(lines, undefined, { step: "summary" });
  };

  const handleGenerate = async () => {
    addUserMessage(t("aiMealCreatorStepper.chat.letsGo") || "Let's go! 🚀");
    showLoader(t("aiMealCreatorStepper.loaderMessage") || "Analyzing your preferences and creating the perfect meal...");
    trackEvent("button_click", {
      button_name: "generate_special_meal_submit",
      screen: "generate_special_meal_page",
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    hideLoader();
    setIsGenerating(true);
  };

  const handleRestart = () => {
    setMessages([]);
    setMealData({
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
    setMultiSelected([]);
    setTextInput("");
    setServings(2);
    setCookingTime(30);
    setSkillLevel("intermediate");
    setBudgetRange("medium");
    setCurrentStep("mealType");
    setIsGenerating(false);
    setTimeout(() => {
      addBotMessage(
        t("aiMealCreatorStepper.chat.welcome") || "👋 Hi! I'm your AI meal assistant. Let's create something delicious together! What type of meal are you craving?",
        mealTypeOptions
      );
    }, 100);
  };

  // Rendering: if generating, show the generation component
  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoaderComponent />
        <AIMealGeneration mealData={mealData} onMealCreated={onMealCreated} />
      </div>
    );
  }

  const isMultiSelectStep = ["dietary", "cuisine", "healthGoals", "allergies"].includes(currentStep);
  const isTextStep = ["mealName", "dishName", "extras"].includes(currentStep);
  const isStepperStep = currentStep === "servings" || currentStep === "cookingTime";
  const isSingleSelectStep = currentStep === "skillLevel" || currentStep === "budgetRange";
  const isSummaryStep = currentStep === "summary";

  // Get current options for multi-select
  const currentMultiOptions =
    currentStep === "dietary" ? dietaryOptions :
    currentStep === "cuisine" ? cuisineOptions :
    currentStep === "healthGoals" ? healthGoalsOptions :
    currentStep === "allergies" ? allergiesOptions : [];

  // Get current options for single-select (skill/budget shown as options in messages)
  const currentSingleOptions =
    currentStep === "skillLevel" ? skillOptions :
    currentStep === "budgetRange" ? budgetOptions : [];

  // Stepper config
  const stepperValue = currentStep === "servings" ? servings : cookingTime;
  const stepperMin = currentStep === "servings" ? 1 : 5;
  const stepperMax = currentStep === "servings" ? 20 : 180;
  const stepperIncrement = currentStep === "servings" ? 1 : 5;
  const stepperLabel = currentStep === "servings"
    ? (t("aiMealCreatorStepper.servingsLabel") || "Servings")
    : (t("aiMealCreatorStepper.cookingTimeLabel") || "Time (min)");

  const handleStepperChange = (delta: number) => {
    if (currentStep === "servings") {
      setServings((prev) => Math.max(stepperMin, Math.min(stepperMax, prev + delta)));
    } else {
      setCookingTime((prev) => Math.max(stepperMin, Math.min(stepperMax, prev + delta * stepperIncrement)));
    }
  };

  const handleStepperSubmit = () => {
    if (currentStep === "servings") {
      handleServingsSubmit();
    } else {
      handleCookingTimeSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-160px)] min-h-[500px] md:bg-black/10 md:backdrop-blur-sm md:rounded-2xl md:border md:border-white/10 md:shadow-xl md:my-4">
      <LoaderComponent />

      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white/80 hover:text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("aiMealCreatorStepper.backToMeals") || "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white">
            {t("aiMealCreatorStepper.createAIMealTitle") || "AI Meal Creator"}
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
              {/* Avatar */}
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 ${
                msg.role === "bot"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-white/20"
              }`}>
                {msg.role === "bot" ? (
                  <Bot className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Bubble */}
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "bot"
                  ? "bg-white/95 text-gray-800 rounded-tl-sm shadow-md"
                  : "bg-emerald-500 text-white rounded-tr-sm shadow-md"
              }`}>
                {msg.text}

                {/* Single-select options (meal type) */}
                {msg.options && !msg.multiSelect && msg.role === "bot" && currentStep === "mealType" && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleOptionSelect(opt.key, opt.label)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors border border-emerald-200"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
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
                        multiSelected.includes(opt.key)
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {multiSelected.includes(opt.key) && <Check className="inline h-3 w-3 mr-1" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleMultiSelectConfirm}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-full px-4"
                  >
                    {multiSelected.length > 0
                      ? `${t("aiMealCreatorStepper.chat.confirm") || "Confirm"} (${multiSelected.length})`
                      : t("aiMealCreatorStepper.chat.skip") || "Skip"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single-select for skill level / budget (shown inline like meal type) */}
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

        {/* Stepper input for servings / cooking time */}
        {isStepperStep && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%] md:max-w-[70%]">
              <div className="shrink-0 w-7 h-7" />
              <div className="bg-white/95 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md w-full">
                <label className="text-xs font-medium text-gray-500 mb-2 block">{stepperLabel}</label>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <button
                    onClick={() => handleStepperChange(-1)}
                    disabled={stepperValue <= stepperMin}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-2xl font-bold text-gray-800 min-w-[60px] text-center">
                    {stepperValue}
                  </span>
                  <button
                    onClick={() => handleStepperChange(1)}
                    disabled={stepperValue >= stepperMax}
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
                  {t("aiMealCreatorStepper.chat.continue") || "Continue"} →
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
              {t("aiMealCreatorStepper.chat.generate") || "Generate My Meal"}
            </Button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Text Input Area */}
      {isTextStep && (
        <div className="shrink-0 px-3 pb-3 pt-2">
          <div className="flex gap-2 bg-white/95 rounded-full px-4 py-2 shadow-lg items-center">
            {currentStep === "extras" ? (
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                placeholder={t("aiMealCreatorStepper.chat.typePlaceholder") || "Type here or skip..."}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                maxLength={40}
              />
            ) : (
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                placeholder={
                  currentStep === "mealName"
                    ? (t("aiMealCreatorStepper.mealNamePlaceholder") || "e.g., My Special Sunday Dinner")
                    : (t("aiMealCreatorStepper.chat.dishPlaceholder") || "e.g., Mac and Cheese")
                }
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                maxLength={currentStep === "mealName" ? 20 : 30}
              />
            )}
            <Button
              size="sm"
              onClick={handleTextSubmit}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-8 w-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <button
            onClick={() => { setTextInput(""); handleTextSubmit(); }}
            className="text-xs text-white/60 hover:text-white/90 mt-1.5 ml-4 transition-colors"
          >
            {t("aiMealCreatorStepper.chat.skip") || "Skip →"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIMealCreatorStepper;
