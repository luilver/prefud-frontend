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
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CookingModeProps {
  meal: any;
  ingredients: string[];
  instructions: { text: string; tip: string; estimatedTime: number }[];
  onClose: () => void;
}

const CookingMode = ({ meal, ingredients, instructions, onClose }: CookingModeProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSection, setActiveSection] = useState<"ingredients" | "steps">("ingredients");
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const { t } = useLanguage();

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

    // Re-acquire on visibility change
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
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speakIngredients = () => {
    const text = ingredients.join(". ");
    speak(`${t("cookingMode.ingredientsList") || "Ingredients list"}. ${text}`);
  };

  const speakStep = (index: number) => {
    speak(`${t("cookingMode.step") || "Step"} ${index + 1}. ${instructions[index].text}`);
  };

  const speakAllSteps = () => {
    const text = instructions
      .map((inst, i) => `${t("cookingMode.step") || "Step"} ${i + 1}. ${inst.text}`)
      .join(". ");
    speak(text);
  };

  const progress = instructions.length > 0
    ? Math.round((completedSteps.length / instructions.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/95 backdrop-blur-sm safe-area-top">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ChefHat className="h-5 w-5 text-primary flex-shrink-0" />
          <h2 className="font-bold text-foreground truncate text-sm sm:text-base">
            {meal.name}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSpeaking ? (
            <Button
              variant="outline"
              size="sm"
              onClick={stopSpeaking}
              className="h-8 w-8 p-0 border-destructive text-destructive"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted h-1.5">
        <div
          className="bg-primary h-1.5 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Section toggle */}
      <div className="flex border-b bg-card/50">
        <button
          onClick={() => setActiveSection("ingredients")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeSection === "ingredients"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          {t("cookingMode.ingredients") || "Ingredients"}
        </button>
        <button
          onClick={() => setActiveSection("steps")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeSection === "steps"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          <Flame className="h-4 w-4" />
          {t("cookingMode.steps") || "Steps"}
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
            {completedSteps.length}/{instructions.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {activeSection === "ingredients" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">
                {t("cookingMode.ingredientsList") || "Ingredients List"}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : speakIngredients}
                className="gap-1.5"
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <span className="text-xs">
                  {isSpeaking
                    ? (t("cookingMode.stop") || "Stop")
                    : (t("cookingMode.listen") || "Listen")}
                </span>
              </Button>
            </div>
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm sm:text-base text-foreground leading-relaxed flex-1">
                  {ingredient}
                </span>
              </div>
            ))}
          </>
        )}

        {activeSection === "steps" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">
                {t("cookingMode.cookingSteps") || "Cooking Steps"}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : speakAllSteps}
                className="gap-1.5"
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <span className="text-xs">
                  {isSpeaking
                    ? (t("cookingMode.stop") || "Stop")
                    : (t("cookingMode.listenAll") || "Listen All")}
                </span>
              </Button>
            </div>
            {instructions.map((instruction, index) => (
              <div
                key={index}
                onClick={() => toggleStep(index)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                  completedSteps.includes(index)
                    ? "bg-primary/10 border-primary/40"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                      completedSteps.includes(index)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {completedSteps.includes(index) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        completedSteps.includes(index)
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {instruction.text}
                    </p>
                    {!completedSteps.includes(index) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          <Timer className="h-3 w-3 mr-1" />~{instruction.estimatedTime} min
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            isSpeaking ? stopSpeaking() : speakStep(index);
                          }}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                          {isSpeaking
                            ? (t("cookingMode.stop") || "Stop")
                            : (t("cookingMode.listen") || "Listen")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-card/95 backdrop-blur-sm safe-area-bottom">
        {progress === 100 && instructions.length > 0 ? (
          <div className="text-center p-3 bg-primary/10 rounded-xl">
            <p className="text-primary font-semibold">
              🎉 {t("cookingMode.completed") || "All steps completed! Enjoy your meal!"}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {completedSteps.length} / {instructions.length} {t("cookingMode.stepsCompleted") || "steps"}
            </span>
            <span className="text-sm font-medium text-primary">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingMode;
