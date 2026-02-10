import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Volume2,
  VolumeX,
  Check,
  ChefHat,
  BookOpen,
  Flame,
  Timer,
  Repeat,
  ChevronDown,
  ChevronUp,
  Maximize2,
} from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import UltraFocusCooking from "@/components/UltraFocusCooking";
import { speak as ttsSpeak, stopSpeaking as ttsStop } from "@/utils/ttsService";

interface CookingModeProps {
  meal: any;
  ingredients: string[];
  instructions: { text: string; tip: string; estimatedTime: number }[];
  onClose: () => void;
  onMarkAsCooked?: () => void;
  isCooked?: boolean;
}

const CookingMode = ({ meal, ingredients, instructions, onClose, onMarkAsCooked, isCooked }: CookingModeProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingStepIndex, setSpeakingStepIndex] = useState<number | null>(null);
  const [speakingIngredientIndex, setSpeakingIngredientIndex] = useState<number | null>(null);
  const [loopIngredients, setLoopIngredients] = useState(false);
  const [loopSteps, setLoopSteps] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [activeSection, setActiveSection] = useState<"ingredients" | "steps">("ingredients");
  const [showUltraFocus, setShowUltraFocus] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ingredientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ingredientScrollRef = useRef<HTMLDivElement | null>(null);
  const speakingCancelledRef = useRef(false);
  const loopIngredientsRef = useRef(false);
  const loopStepsRef = useRef(false);
  const { t, language } = useLanguage();

  // Map app language to BCP 47 speech lang
  const speechLang = language === "es" ? "es-ES" : language === "pt" ? "pt-BR" : "en-US";

  // Keep refs in sync with state
  useEffect(() => { loopIngredientsRef.current = loopIngredients; }, [loopIngredients]);
  useEffect(() => { loopStepsRef.current = loopSteps; }, [loopSteps]);

  // Request wake lock on mount
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          console.log("Wake Lock acquired");
        }
      } catch (err) {
        console.log("Wake Lock request failed:", err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log("Wake Lock released");
      }
      ttsStop();
    };
  }, []);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const speak = useCallback(async (text: string, stepIndex?: number) => {
    await ttsStop();
    setIsSpeaking(true);
    setSpeakingStepIndex(stepIndex ?? null);
    try {
      await ttsSpeak(text, speechLang, 0.9);
    } catch {
      // speech error or cancelled
    } finally {
      if (!speakingCancelledRef.current) {
        setIsSpeaking(false);
        setSpeakingStepIndex(null);
      }
    }
  }, [speechLang]);

  const stopSpeaking = useCallback(() => {
    speakingCancelledRef.current = true;
    ttsStop();
    setIsSpeaking(false);
    setSpeakingStepIndex(null);
    setSpeakingIngredientIndex(null);
  }, []);

  const speakIngredients = useCallback(async () => {
    speakingCancelledRef.current = false;
    await ttsStop();
    setIsSpeaking(true);

    let currentIdx = 0;
    const speakNext = async () => {
      if (speakingCancelledRef.current) return;
      if (currentIdx >= ingredients.length) {
        if (loopIngredientsRef.current && !speakingCancelledRef.current) {
          currentIdx = 0;
          await speakNext();
          return;
        }
        setIsSpeaking(false);
        setSpeakingIngredientIndex(null);
        return;
      }
      const idx = currentIdx;
      setSpeakingIngredientIndex(idx);
      ingredientRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      try {
        await ttsSpeak(ingredients[idx], speechLang, 0.9);
      } catch {
        setIsSpeaking(false);
        setSpeakingIngredientIndex(null);
        return;
      }
      if (speakingCancelledRef.current) return;
      currentIdx++;
      await speakNext();
    };

    await speakNext();
  }, [ingredients, speechLang]);

  const speakStep = (index: number) => {
    speakingCancelledRef.current = false;
    speak(`${t("cookingMode.step") || "Step"} ${index + 1}. ${instructions[index].text}`, index);
    stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const speakAllSteps = useCallback(async () => {
    speakingCancelledRef.current = false;
    await ttsStop();
    setIsSpeaking(true);

    let currentIdx = 0;
    const speakNext = async () => {
      if (speakingCancelledRef.current) return;
      if (currentIdx >= instructions.length) {
        if (loopStepsRef.current && !speakingCancelledRef.current) {
          currentIdx = 0;
          await speakNext();
          return;
        }
        setIsSpeaking(false);
        setSpeakingStepIndex(null);
        return;
      }
      const idx = currentIdx;
      const text = `${t("cookingMode.step") || "Step"} ${idx + 1}. ${instructions[idx].text}`;
      setSpeakingStepIndex(idx);
      stepRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
      try {
        await ttsSpeak(text, speechLang, 0.9);
      } catch {
        setIsSpeaking(false);
        setSpeakingStepIndex(null);
        return;
      }
      if (speakingCancelledRef.current) return;
      currentIdx++;
      await speakNext();
    };

    await speakNext();
  }, [instructions, t, speechLang]);

  const progress = instructions.length > 0
    ? Math.round((completedSteps.length / instructions.length) * 100)
    : 0;

  return (
    <>
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Branded Header */}
      <div className="bg-primary safe-area-top">
        <div className="px-4 md:px-8 lg:px-12 py-3 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-primary-foreground/70 text-xs md:text-sm font-semibold uppercase tracking-widest">Pantry</span>
                <span className="text-primary-foreground/40 text-xs">•</span>
                <div className="flex items-center gap-1">
                  <ChefHat className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground/70" />
                  <span className="text-primary-foreground/70 text-xs md:text-sm font-medium">
                    {t("cookingMode.title") || "Cooking Mode"}
                  </span>
                </div>
              </div>
              <h2 className="font-bold text-primary-foreground truncate text-base md:text-lg lg:text-xl leading-tight mt-0.5">
                {meal.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              {isSpeaking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeaking}
                  className="h-8 w-8 md:h-9 md:w-9 p-0 border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 md:h-9 md:w-9 p-0 text-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="flex-1 bg-primary-foreground/20 rounded-full h-1.5 md:h-2 overflow-hidden">
              <div
                className="bg-primary-foreground h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs md:text-sm font-semibold text-primary-foreground/90 tabular-nums w-9 text-right">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Ingredients - Horizontal scroll on mobile, wrapping grid on tablet/desktop */}
      <div className="border-b bg-card/50">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 pt-3 md:pt-4 pb-1.5">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider">
                {t("cookingMode.ingredients") || "Ingredients"}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : () => speakIngredients()}
                className="h-7 md:h-8 px-2 md:px-3 text-xs gap-1 text-muted-foreground hover:text-primary"
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {isSpeaking ? (t("cookingMode.stop") || "Stop") : (t("cookingMode.listen") || "Listen")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoopIngredients(!loopIngredients)}
                className={`h-7 md:h-8 w-7 md:w-8 p-0 ${loopIngredients ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"}`}
                title={t("cookingMode.repeat") || "Repeat"}
              >
                <Repeat className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllIngredients(!showAllIngredients)}
                className="h-7 md:h-8 w-7 md:w-8 p-0 md:hidden text-muted-foreground hover:text-primary"
                title={t("cookingMode.viewAll") || "View All"}
              >
                {showAllIngredients ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          {/* Mobile: horizontal scroll or expanded grid */}
          {showAllIngredients ? (
            <div className="flex md:hidden flex-wrap gap-2 px-4 pb-3">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  ref={(el) => { ingredientRefs.current[index] = el; }}
                  className={`px-3 py-2 rounded-lg border text-xs transition-all duration-300 ${
                    speakingIngredientIndex === index
                      ? "bg-accent/20 border-accent ring-2 ring-accent/30 text-accent-foreground font-semibold shadow-md"
                      : "bg-primary/5 border-primary/15 text-foreground"
                  }`}
                >
                  {ingredient}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex md:hidden overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide snap-x snap-mandatory">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  ref={(el) => { ingredientRefs.current[index] = el; }}
                  className={`flex-shrink-0 snap-start px-3 py-2 rounded-lg border text-xs whitespace-nowrap transition-all duration-300 ${
                    speakingIngredientIndex === index
                      ? "bg-accent/20 border-accent ring-2 ring-accent/30 text-accent-foreground font-semibold shadow-md"
                      : "bg-primary/5 border-primary/15 text-foreground"
                  }`}
                >
                  {ingredient}
                </div>
              ))}
            </div>
          )}
          {/* Tablet+: always wrapping grid */}
          <div className="hidden md:flex flex-wrap gap-2 px-8 lg:px-12 pb-4">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className={`px-3.5 py-2 rounded-lg border text-sm transition-all duration-300 ${
                  speakingIngredientIndex === index
                    ? "bg-accent/20 border-accent ring-2 ring-accent/30 text-accent-foreground font-semibold shadow-md"
                    : "bg-primary/5 border-primary/15 text-foreground"
                }`}
              >
                {ingredient}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps section */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 pt-4 pb-2">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-primary" />
              <h3 className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider">
                {t("cookingMode.steps") || "Steps"}
              </h3>
              <span className="ml-1 text-xs bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full tabular-nums">
                {completedSteps.length}/{instructions.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : () => speakAllSteps()}
                className="h-7 md:h-8 px-2 md:px-3 text-xs gap-1 text-muted-foreground hover:text-primary"
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {isSpeaking ? (t("cookingMode.stop") || "Stop") : (t("cookingMode.listenAll") || "Listen All")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoopSteps(!loopSteps)}
                className={`h-7 md:h-8 w-7 md:w-8 p-0 ${loopSteps ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"}`}
                title={t("cookingMode.repeat") || "Repeat"}
              >
                <Repeat className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { stopSpeaking(); setShowUltraFocus(true); }}
                className="h-7 md:h-8 w-7 md:w-8 p-0 text-muted-foreground hover:text-primary"
                title={t("cookingMode.ultraFocus") || "Ultra Focus"}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="px-4 md:px-8 lg:px-12 pb-4 space-y-2.5 md:space-y-3">
            {instructions.map((instruction, index) => {
              const isCompleted = completedSteps.includes(index);
              const isSpeakingThis = speakingStepIndex === index;
              return (
                <div
                  key={index}
                  ref={(el) => { stepRefs.current[index] = el; }}
                  onClick={() => toggleStep(index)}
                  className={`relative p-3.5 md:p-4 lg:p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                    isSpeakingThis
                      ? "bg-accent/20 border-accent ring-2 ring-accent/30 shadow-md"
                      : isCompleted
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div
                      className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0 transition-all mt-0.5 ${
                        isSpeakingThis
                          ? "bg-accent text-accent-foreground shadow-md animate-pulse"
                          : isCompleted
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5 md:h-4 md:w-4" /> : isSpeakingThis ? <Volume2 className="h-3.5 w-3.5 md:h-4 md:w-4" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm md:text-base leading-relaxed ${
                          isCompleted
                            ? "line-through text-muted-foreground/70"
                            : "text-foreground"
                        }`}
                      >
                        {instruction.text}
                      </p>
                      {!isCompleted && (
                        <div className="mt-2 flex items-center gap-2 md:gap-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs md:text-sm font-medium">
                            <Timer className="h-3 w-3 mr-1" />~{instruction.estimatedTime} min
                          </span>
                          <button
                            className="inline-flex items-center gap-1 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              isSpeaking ? stopSpeaking() : speakStep(index);
                            }}
                          >
                            {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            {isSpeaking ? (t("cookingMode.stop") || "Stop") : (t("cookingMode.listen") || "Listen")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card/95 backdrop-blur-sm safe-area-bottom">
        <div className="px-4 md:px-8 lg:px-12 py-3 max-w-5xl mx-auto w-full space-y-2">
          {progress === 100 && instructions.length > 0 ? (
            <div className="text-center p-3 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-primary font-semibold text-sm md:text-base">
                🎉 {t("cookingMode.completed") || "All steps completed! Enjoy your meal!"}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-muted-foreground">
                {completedSteps.length} / {instructions.length} {t("cookingMode.stepsCompleted") || "steps"}
              </span>
              <span className="text-xs md:text-sm font-semibold text-primary tabular-nums">{progress}%</span>
            </div>
          )}
          {onMarkAsCooked && (
            <Button
              onClick={onMarkAsCooked}
              className={`w-full ${isCooked ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
              size="sm"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              {isCooked 
                ? (t("recipeView.markedAsCooked") || "✓ Cooked") 
                : (t("recipeView.markAsCooked") || "Mark as Cooked")}
            </Button>
          )}
        </div>
      </div>
    </div>

      {/* Ultra Focus Mode */}
      {showUltraFocus && (
        <UltraFocusCooking
          mealName={meal.name}
          instructions={instructions}
          completedSteps={completedSteps}
          onToggleStep={toggleStep}
          onClose={() => setShowUltraFocus(false)}
        />
      )}
    </>
  );
};

export default CookingMode;
