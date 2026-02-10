import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Sparkles, Bot, User, Check, RotateCcw, Plus, Minus, Wine } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import AIDrinkGeneration from "./AIDrinkGeneration";
import SubscriptionUpgradeModal from "./SubscriptionUpgradeModal";
import { createHealthyDrink } from "@/services/drinkService";
import { trackEvent } from "@/services/analytics";
import { useToast } from "@/hooks/use-toast";

interface AIDrinkCreatorStepperProps {
  onBack: () => void;
  onDrinkCreated: (drink: any) => void;
}

type ChatStep =
  | "drinkType"
  | "drinkName"
  | "servings"
  | "cookingTime"
  | "skillLevel"
  | "budgetRange"
  | "healthGoals"
  | "dietary"
  | "cuisine"
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

const AIDrinkCreatorStepper = ({ onBack, onDrinkCreated }: AIDrinkCreatorStepperProps) => {
  const { user } = useUser();
  const { language, t } = useLanguage();
  const { showLoader, hideLoader, LoaderComponent } = useCookingLoader();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState<ChatStep>("drinkType");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDrink, setGeneratedDrink] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [customCuisine, setCustomCuisine] = useState("");
  const [showCustomCuisineInput, setShowCustomCuisineInput] = useState(false);
  const [customAllergy, setCustomAllergy] = useState("");
  const [showCustomAllergyInput, setShowCustomAllergyInput] = useState(false);
  const initializedRef = useRef(false);

  // Stepper inputs
  const [servings, setServings] = useState(1);
  const [cookingTime, setCookingTime] = useState(15);

  const [drinkData, setDrinkData] = useState<any>({
    type: "",
    drinkType: "",
    drink_name: "",
    numberPeople: 1,
    maxCookingTime: 15,
    cookingSkillLevel: "intermediate",
    budgetRange: "medium",
    healthGoals: [],
    dietaryRestrictions: [],
    cuisinePreferences: [],
    allergiesIntolerance: [],
    dislikes: "",
  });

  const drinkTypeOptions = [
    { key: "smoothie", label: t("aiDrinkChat.type.smoothie") || "🥤 Smoothie" },
    { key: "juice", label: t("aiDrinkChat.type.juice") || "🧃 Fresh Juice" },
    { key: "tea", label: t("aiDrinkChat.type.tea") || "🍵 Wellness Tea" },
    { key: "protein", label: t("aiDrinkChat.type.protein") || "💪 Protein Shake" },
    { key: "detox", label: t("aiDrinkChat.type.detox") || "🌿 Detox Drink" },
    { key: "energy", label: t("aiDrinkChat.type.energy") || "⚡ Energy Boost" },
  ];

  const healthGoalsOptions = [
    { key: "energy-boost", label: t("aiDrinkChat.goal.energy") || "⚡ Energy Boost" },
    { key: "weight-loss", label: t("aiDrinkChat.goal.weightLoss") || "⚖️ Weight Management" },
    { key: "immunity", label: t("aiDrinkChat.goal.immunity") || "🛡️ Immune Support" },
    { key: "digestive-health", label: t("aiDrinkChat.goal.digestive") || "🌱 Digestive Health" },
    { key: "skin-health", label: t("aiDrinkChat.goal.skin") || "✨ Skin Health" },
    { key: "detox", label: t("aiDrinkChat.goal.detox") || "🌿 Detoxification" },
  ];

  const dietaryOptions = [
    { key: "keto", label: t("aiDrinkChat.diet.keto") || "Keto" },
    { key: "paleo", label: t("aiDrinkChat.diet.paleo") || "Paleo" },
    { key: "vegan", label: t("aiDrinkChat.diet.vegan") || "Vegan" },
    { key: "vegetarian", label: t("aiDrinkChat.diet.vegetarian") || "Vegetarian" },
    { key: "gluten-free", label: t("aiDrinkChat.diet.glutenFree") || "Gluten Free" },
    { key: "dairy-free", label: t("aiDrinkChat.diet.dairyFree") || "Dairy Free" },
    { key: "low-carb", label: t("aiDrinkChat.diet.lowCarb") || "Low Carb" },
    { key: "diabetic-friendly", label: t("aiDrinkChat.diet.diabeticFriendly") || "Diabetic Friendly" },
  ];

  const cuisineOptions = [
    { key: "ecuadorian", label: t("aiDrinkChat.cuisine.ecuadorian") || "Ecuadorian" },
    { key: "american", label: t("aiDrinkChat.cuisine.american") || "American" },
    { key: "japanese", label: t("aiDrinkChat.cuisine.japanese") || "Japanese" },
    { key: "mexican", label: t("aiDrinkChat.cuisine.mexican") || "Mexican" },
    { key: "indian", label: t("aiDrinkChat.cuisine.indian") || "Indian" },
    { key: "thai", label: t("aiDrinkChat.cuisine.thai") || "Thai" },
    { key: "chinese", label: t("aiDrinkChat.cuisine.chinese") || "Chinese" },
    { key: "mediterranean", label: t("aiDrinkChat.cuisine.mediterranean") || "Mediterranean" },
    { key: "brazilian", label: t("aiDrinkChat.cuisine.brazilian") || "Brazilian" },
    { key: "korean", label: t("aiDrinkChat.cuisine.korean") || "Korean" },
    { key: "__other__", label: t("aiDrinkChat.cuisine.other") || "✏️ Other" },
  ];

  const allergiesOptions = [
    { key: "peanuts", label: t("aiDrinkChat.allergy.peanuts") || "Peanuts" },
    { key: "tree-nuts", label: t("aiDrinkChat.allergy.treeNuts") || "Tree Nuts" },
    { key: "dairy", label: t("aiDrinkChat.allergy.dairy") || "Dairy" },
    { key: "eggs", label: t("aiDrinkChat.allergy.eggs") || "Eggs" },
    { key: "soy", label: t("aiDrinkChat.allergy.soy") || "Soy" },
    { key: "shellfish", label: t("aiDrinkChat.allergy.shellfish") || "Shellfish" },
    { key: "wheat", label: t("aiDrinkChat.allergy.wheat") || "Wheat" },
    { key: "sesame", label: t("aiDrinkChat.allergy.sesame") || "Sesame" },
    { key: "sulfites", label: t("aiDrinkChat.allergy.sulfites") || "Sulfites" },
    { key: "__other__", label: t("aiDrinkChat.allergy.other") || "✏️ Other" },
  ];

  const skillOptions = [
    { key: "beginner", label: t("aiDrinkChat.skill.beginner") || "Beginner" },
    { key: "intermediate", label: t("aiDrinkChat.skill.intermediate") || "Intermediate" },
    { key: "advanced", label: t("aiDrinkChat.skill.advanced") || "Advanced" },
  ];

  const budgetOptions = [
    { key: "low", label: t("aiDrinkChat.budget.low") || "Low" },
    { key: "medium", label: t("aiDrinkChat.budget.medium") || "Medium" },
    { key: "high", label: t("aiDrinkChat.budget.high") || "High" },
  ];

  const getLanguageName = (languageCode: string) => {
    const languageMap: { [key: string]: string } = {
      'en': 'english', 'es': 'spanish', 'pt': 'portuguese',
      'fr': 'french', 'de': 'german', 'it': 'italian'
    };
    return languageMap[languageCode.toLowerCase()] || 'english';
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStep]);

  // Initialize first bot message
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    addBotMessage(
      t("aiDrinkChat.welcome") || "👋 Hi! I'm your AI drink assistant. Let's create a healthy drink just for you! What type of drink would you like?",
      drinkTypeOptions
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
    if (currentStep === "drinkType") {
      addUserMessage(label);
      setDrinkData((prev: any) => ({ ...prev, type: key, drinkType: key }));
      setCurrentStep("drinkName");
      setTimeout(() => {
        addBotMessage(
          t("aiDrinkChat.drinkName") || "Great choice! 🎉 What would you like to name your drink? (Optional)",
          undefined,
          { inputType: "text", skippable: true }
        );
      }, 400);
    } else if (currentStep === "skillLevel") {
      addUserMessage(label);
      setDrinkData((prev: any) => ({ ...prev, cookingSkillLevel: key }));
      setCurrentStep("budgetRange");
      setTimeout(() => {
        addBotMessage(
          t("aiDrinkChat.budget") || "💰 What's your budget range for this drink?",
          budgetOptions
        );
      }, 400);
    } else if (currentStep === "budgetRange") {
      addUserMessage(label);
      setDrinkData((prev: any) => ({ ...prev, budgetRange: key }));
      setCurrentStep("healthGoals");
      setTimeout(() => {
        addBotMessage(
          t("aiDrinkChat.healthGoals") || "💪 What are your health goals? Select all that apply.",
          healthGoalsOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    }
  };

  const handleMultiSelectConfirm = () => {
    if (currentStep === "healthGoals") {
      const labels = multiSelected.map((k) => healthGoalsOptions.find((o) => o.key === k)?.label || k);
      addUserMessage(multiSelected.length > 0 ? labels.join(", ") : t("aiDrinkChat.none") || "None");
      setDrinkData((prev: any) => ({ ...prev, healthGoals: [...multiSelected] }));
      setMultiSelected([]);
      setCurrentStep("dietary");
      setTimeout(() => {
        addBotMessage(
          t("aiDrinkChat.dietary") || "🥗 Any dietary restrictions? Select all that apply.",
          dietaryOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "dietary") {
      const labels = multiSelected.map((k) => dietaryOptions.find((o) => o.key === k)?.label || k);
      addUserMessage(multiSelected.length > 0 ? labels.join(", ") : t("aiDrinkChat.none") || "None");
      setDrinkData((prev: any) => ({ ...prev, dietaryRestrictions: [...multiSelected] }));
      setMultiSelected([]);
      setCurrentStep("cuisine");
      setTimeout(() => {
        addBotMessage(
          t("aiDrinkChat.cuisine") || "🌍 Any cuisine or flavor preferences?",
          cuisineOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "cuisine") {
      const finalCuisines = multiSelected.filter(k => k !== "__other__");
      if (customCuisine.trim()) finalCuisines.push(customCuisine.trim());
      const displayLabels = finalCuisines.map((k) => {
        const found = cuisineOptions.find((o) => o.key === k);
        return found ? found.label : k;
      });
      addUserMessage(displayLabels.length > 0 ? displayLabels.join(", ") : t("aiDrinkChat.none") || "None");
      setDrinkData((prev: any) => ({ ...prev, cuisinePreferences: finalCuisines }));
      setMultiSelected([]);
      setCustomCuisine("");
      setShowCustomCuisineInput(false);
      setCurrentStep("allergies");
      setTimeout(() => {
        addBotMessage(
          t("aiDrinkChat.allergies") || "⚠️ Any allergies or intolerances I should know about?",
          allergiesOptions,
          { multiSelect: true, skippable: true }
        );
      }, 400);
    } else if (currentStep === "allergies") {
      const finalAllergies = multiSelected.filter(k => k !== "__other__");
      if (customAllergy.trim()) finalAllergies.push(customAllergy.trim());
      const displayLabels = finalAllergies.map((k) => {
        const found = allergiesOptions.find((o) => o.key === k);
        return found ? found.label : k;
      });
      addUserMessage(displayLabels.length > 0 ? displayLabels.join(", ") : t("aiDrinkChat.none") || "None");
      setDrinkData((prev: any) => ({ ...prev, allergiesIntolerance: finalAllergies }));
      setMultiSelected([]);
      setCustomAllergy("");
      setShowCustomAllergyInput(false);
      setCurrentStep("extras");
      setTimeout(() => {
        addBotMessage(
          t("aiDrinkChat.extras") || "📝 Anything else? Dislikes or special requests? (Optional)",
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
      } else if (currentStep === "allergies") {
        setShowCustomAllergyInput((prev) => !prev);
      }
      return;
    }
    setMultiSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleTextSubmit = () => {
    const value = textInput.trim();

    if (currentStep === "drinkName") {
      addUserMessage(value || (t("aiDrinkChat.skipped") || "Skipped"));
      setDrinkData((prev: any) => ({ ...prev, drink_name: value || `Healthy ${prev.type || "Drink"}` }));
      setTextInput("");
      setCurrentStep("servings");
      setTimeout(() => {
        addBotMessage(
          t("aiDrinkChat.servings") || "👥 How many servings do you need?",
          undefined,
          { inputType: "stepper" }
        );
      }, 400);
    } else if (currentStep === "extras") {
      addUserMessage(value || (t("aiDrinkChat.skipped") || "Skipped"));
      setDrinkData((prev: any) => ({ ...prev, dislikes: value }));
      setTextInput("");
      setCurrentStep("summary");
      setTimeout(() => showSummary(), 400);
    }
  };

  const handleServingsSubmit = () => {
    addUserMessage(`${servings} ${t("aiDrinkChat.servingsLabel") || "servings"}`);
    setDrinkData((prev: any) => ({ ...prev, numberPeople: servings }));
    setCurrentStep("cookingTime");
    setTimeout(() => {
      addBotMessage(
        t("aiDrinkChat.cookTime") || "⏱️ What's the maximum prep time (in minutes)?",
        undefined,
        { inputType: "stepper" }
      );
    }, 400);
  };

  const handleCookingTimeSubmit = () => {
    addUserMessage(`${cookingTime} min`);
    setDrinkData((prev: any) => ({ ...prev, maxCookingTime: cookingTime }));
    setCurrentStep("skillLevel");
    setTimeout(() => {
      addBotMessage(
        t("aiDrinkChat.skill") || "👨‍🍳 What's your skill level?",
        skillOptions
      );
    }, 400);
  };

  const showSummary = () => {
    const d = drinkData;
    const lines = [
      `✅ **${t("aiDrinkChat.readyTitle") || "Here's your drink summary:"}**`,
      "",
      `🥤 ${t("aiDrinkChat.review.type") || "Type"}: ${d.type}`,
      d.drink_name ? `📛 ${t("aiDrinkChat.review.name") || "Name"}: ${d.drink_name}` : "",
      `👥 ${t("aiDrinkChat.review.servings") || "Servings"}: ${d.numberPeople}`,
      `⏱️ ${t("aiDrinkChat.review.prepTime") || "Prep Time"}: ${d.maxCookingTime} min`,
      `👨‍🍳 ${t("aiDrinkChat.review.skill") || "Skill"}: ${d.cookingSkillLevel}`,
      `💰 ${t("aiDrinkChat.review.budget") || "Budget"}: ${d.budgetRange}`,
      d.healthGoals?.length ? `💪 ${t("aiDrinkChat.review.goals") || "Goals"}: ${d.healthGoals.join(", ")}` : "",
      d.dietaryRestrictions?.length ? `🥗 ${t("aiDrinkChat.review.diet") || "Diet"}: ${d.dietaryRestrictions.join(", ")}` : "",
      d.cuisinePreferences?.length ? `🌍 ${t("aiDrinkChat.review.cuisine") || "Cuisine"}: ${d.cuisinePreferences.join(", ")}` : "",
      d.allergiesIntolerance?.length ? `⚠️ ${t("aiDrinkChat.review.allergies") || "Allergies"}: ${d.allergiesIntolerance.join(", ")}` : "",
      d.dislikes ? `📝 ${t("aiDrinkChat.review.notes") || "Notes"}: ${d.dislikes}` : "",
      "",
      t("aiDrinkChat.confirmPrompt") || "Looks good? Hit **Generate** to create your drink! 🚀",
    ]
      .filter(Boolean)
      .join("\n");

    addBotMessage(lines, undefined, { step: "summary" });
  };

  const handleGenerate = async () => {
    if (!user?.id) {
      toast({ title: "Error", description: "Please log in to generate a drink", variant: "destructive" });
      return;
    }

    addUserMessage(t("aiDrinkChat.letsGo") || "Let's go! 🚀");
    showLoader(t("aiDrinkChat.loaderMessage") || "Mixing the perfect healthy drink for you...");
    trackEvent("button_click", {
      button_name: "generate_drink_submit",
      screen: "generate_drink_chat",
    });

    try {
      const requestData = {
        user_id: user.id,
        drink_name: drinkData.drink_name || `Healthy ${drinkData.type || 'Drink'}`,
        numberPeople: drinkData.numberPeople || 1,
        dietaryRestrictions: drinkData.dietaryRestrictions || [],
        cuisinePreferences: drinkData.cuisinePreferences || [],
        allergiesIntolerance: drinkData.allergiesIntolerance || [],
        dislikes: drinkData.dislikes || "",
        maxCookingTime: drinkData.maxCookingTime || 30,
        cookingSkillLevel: drinkData.cookingSkillLevel || "intermediate",
        budgetRange: drinkData.budgetRange || "medium",
        drinkType: drinkData.type || "smoothie",
        language: getLanguageName(language),
        healthGoals: drinkData.healthGoals || [],
      };

      const apiResponse = await createHealthyDrink(requestData);

      const transformedDrink = {
        name: apiResponse.healthyDrink.name,
        type: apiResponse.healthyDrink.drinkType,
        description: apiResponse.healthyDrink.description,
        prepTime: `${apiResponse.healthyDrink.cookingTime} minutes`,
        servings: drinkData.numberPeople || 1,
        calories: apiResponse.healthyDrink.calories,
        ingredients: apiResponse.healthyDrink.ingredients.map((ing: any) => ({
          name: ing.name,
          amount: `${ing.quantity} ${ing.unit}`,
          category: apiResponse.ingredientsList.find((item: any) => item.name === ing.name)?.classification || 'Other',
          price: `$${(Math.random() * 5 + 1).toFixed(2)}`
        })),
        instructions: apiResponse.healthyDrink.steps,
        nutritionHighlights: [
          apiResponse.healthyDrink.benefits,
          `Rich in vitamins: ${apiResponse.healthyDrink.nutritionalInfo.vitamins.join(', ')}`,
          `${apiResponse.healthyDrink.nutritionalInfo.protein}g protein, ${apiResponse.healthyDrink.nutritionalInfo.fiber}g fiber`
        ],
        tips: [
          apiResponse.healthyDrink.prepTip,
          apiResponse.healthyDrink.instructions,
        ],
        healthGoals: drinkData.healthGoals || [],
        dietaryRestrictions: drinkData.dietaryRestrictions || [],
        servingSize: drinkData.numberPeople || 1,
        apiData: apiResponse,
      };

      hideLoader();
      setGeneratedDrink(transformedDrink);
      setIsGenerating(true);
      toast({ title: "✅", description: t("aiDrinkChat.drinkCreatedSuccess") || "Healthy drink created successfully!" });

    } catch (error: any) {
      hideLoader();
      console.error('Error generating drink:', error);

      if (
        error?.code === "03" ||
        error?.response?.data?.code === "03" ||
        (typeof error?.message === "string" && error.message.includes("No healthy drinks available according to your subscription"))
      ) {
        setShowUpgradeModal(true);
        return;
      }

      toast({
        title: "Error",
        description: t("aiDrinkChat.drinkCreatedError") || "Failed to generate drink. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setDrinkData({
      type: "", drinkType: "", drink_name: "", numberPeople: 1,
      maxCookingTime: 15, cookingSkillLevel: "intermediate", budgetRange: "medium",
      healthGoals: [], dietaryRestrictions: [], cuisinePreferences: [],
      allergiesIntolerance: [], dislikes: "",
    });
    setMultiSelected([]);
    setTextInput("");
    setServings(1);
    setCookingTime(15);
    setCurrentStep("drinkType");
    setIsGenerating(false);
    setGeneratedDrink(null);
    setCustomCuisine("");
    setShowCustomCuisineInput(false);
    setCustomAllergy("");
    setShowCustomAllergyInput(false);
    initializedRef.current = false;
    setTimeout(() => {
      initializedRef.current = true;
      addBotMessage(
        t("aiDrinkChat.welcome") || "👋 Hi! I'm your AI drink assistant. Let's create a healthy drink just for you! What type of drink would you like?",
        drinkTypeOptions
      );
    }, 100);
  };

  // If generated, show the result component directly (skip "Ready to Generate")
  if (isGenerating && generatedDrink) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoaderComponent />
        <AIDrinkGeneration
          data={drinkData}
          onUpdate={(key: string, value: any) => setDrinkData((prev: any) => ({ ...prev, [key]: value }))}
          onDrinkCreated={onDrinkCreated}
          initialDrink={generatedDrink}
        />
      </div>
    );
  }

  const isMultiSelectStep = ["healthGoals", "dietary", "cuisine", "allergies"].includes(currentStep);
  const isTextStep = ["drinkName", "extras"].includes(currentStep);
  const isStepperStep = currentStep === "servings" || currentStep === "cookingTime";
  const isSingleSelectStep = currentStep === "skillLevel" || currentStep === "budgetRange";
  const isSummaryStep = currentStep === "summary";

  const currentMultiOptions =
    currentStep === "healthGoals" ? healthGoalsOptions :
    currentStep === "dietary" ? dietaryOptions :
    currentStep === "cuisine" ? cuisineOptions :
    currentStep === "allergies" ? allergiesOptions : [];

  const currentSingleOptions =
    currentStep === "skillLevel" ? skillOptions :
    currentStep === "budgetRange" ? budgetOptions : [];

  const stepperValue = currentStep === "servings" ? servings : cookingTime;
  const stepperMin = currentStep === "servings" ? 1 : 5;
  const stepperMax = currentStep === "servings" ? 10 : 60;
  const stepperIncrement = currentStep === "servings" ? 1 : 5;
  const stepperLabel = currentStep === "servings"
    ? (t("aiDrinkChat.servingsLabel") || "Servings")
    : (t("aiDrinkChat.prepTimeLabel") || "Time (min)");

  const handleStepperChange = (delta: number) => {
    if (currentStep === "servings") {
      setServings((prev) => Math.max(stepperMin, Math.min(stepperMax, prev + delta)));
    } else {
      setCookingTime((prev) => Math.max(stepperMin, Math.min(stepperMax, prev + delta * stepperIncrement)));
    }
  };

  const handleStepperSubmit = () => {
    if (currentStep === "servings") handleServingsSubmit();
    else handleCookingTimeSubmit();
  };

  // Determine if "Other" custom input should show
  const showOtherInput = (currentStep === "cuisine" && showCustomCuisineInput) || (currentStep === "allergies" && showCustomAllergyInput);
  const otherValue = currentStep === "cuisine" ? customCuisine : customAllergy;
  const otherPlaceholder = currentStep === "cuisine"
    ? (t("aiDrinkChat.cuisine.otherPlaceholder") || "Type your preference...")
    : (t("aiDrinkChat.allergy.otherPlaceholder") || "Type your allergy...");
  const onOtherChange = (val: string) => {
    if (currentStep === "cuisine") setCustomCuisine(val.slice(0, 30));
    else setCustomAllergy(val.slice(0, 30));
  };

  // Count for confirm button
  const getConfirmCount = () => {
    const base = multiSelected.filter(k => k !== "__other__").length;
    if (currentStep === "cuisine" && customCuisine.trim()) return base + 1;
    if (currentStep === "allergies" && customAllergy.trim()) return base + 1;
    return base;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full max-h-[100dvh] flex flex-col">
      <LoaderComponent />
      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          window.location.hash = 'profile';
        }}
        featureType="drinks"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white/80 hover:text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("aiDrinkChat.back") || "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
            <Wine className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white">
            {t("aiDrinkChat.title") || "AI Drink Creator"}
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
                msg.role === "bot"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-white/20"
              }`}>
                {msg.role === "bot" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
              </div>

              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "bot"
                  ? "bg-white/95 text-gray-800 rounded-tl-sm shadow-md"
                  : "bg-emerald-500 text-white rounded-tr-sm shadow-md"
              }`}>
                {msg.text}

                {msg.options && !msg.multiSelect && msg.role === "bot" && currentStep === "drinkType" && (
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
                  {currentMultiOptions.map((opt) => {
                    const isOtherActive = opt.key === "__other__" && (
                      (currentStep === "cuisine" && showCustomCuisineInput) ||
                      (currentStep === "allergies" && showCustomAllergyInput)
                    );
                    const isSelected = multiSelected.includes(opt.key) || isOtherActive;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => toggleMultiSelect(opt.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          isSelected
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected && <Check className="inline h-3 w-3 mr-1" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {/* Custom input for "Other" */}
                {showOtherInput && (
                  <div className="flex gap-2 mt-2 mb-2">
                    <input
                      value={otherValue}
                      onChange={(e) => onOtherChange(e.target.value)}
                      placeholder={otherPlaceholder}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-emerald-400"
                      maxLength={30}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleMultiSelectConfirm}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-full px-4"
                  >
                    {getConfirmCount() > 0
                      ? `${t("aiDrinkChat.confirm") || "Confirm"} (${getConfirmCount()})`
                      : t("aiDrinkChat.skip") || "Skip"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single-select for skill level / budget */}
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
                  <span className="text-2xl font-bold text-gray-800 min-w-[60px] text-center">{stepperValue}</span>
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
                  {t("aiDrinkChat.continue") || "Continue"} →
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
              {t("aiDrinkChat.generate") || "Generate My Drink"}
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
                currentStep === "drinkName"
                  ? (t("aiDrinkChat.drinkNamePlaceholder") || "e.g., Morning Energy Smoothie")
                  : (t("aiDrinkChat.extrasPlaceholder") || "Type here or skip...")
              }
              className="flex-1 bg-transparent outline-none text-base text-gray-800 placeholder:text-gray-400"
              maxLength={currentStep === "drinkName" ? 30 : 60}
            />
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
            {t("aiDrinkChat.skip") || "Skip →"}
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default AIDrinkCreatorStepper;
