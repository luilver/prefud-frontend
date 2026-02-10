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
      <div className="px-4 py-3 border-b bg-card/95 backdrop-blur-sm safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-foreground truncate text-sm leading-tight">
                {meal.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("cookingMode.title") || "Cooking Mode"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isSpeaking && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopSpeaking}
                className="h-8 w-8 p-0 border-destructive/50 text-destructive"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2.5 flex items-center gap-2.5">
          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-primary tabular-nums w-9 text-right">
            {progress}%
          </span>
        </div>
      </div>

      {/* Ingredients - Horizontal scroll */}
      <div className="border-b bg-card/50">
        <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {t("cookingMode.ingredients") || "Ingredients"}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={isSpeaking ? stopSpeaking : speakIngredients}
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {isSpeaking ? (t("cookingMode.stop") || "Stop") : (t("cookingMode.listen") || "Listen")}
          </Button>
        </div>
        <div className="flex overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide snap-x snap-mandatory">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex-shrink-0 snap-start px-3 py-2 rounded-lg bg-primary/5 border border-primary/15 text-xs sm:text-sm text-foreground whitespace-nowrap"
            >
              {ingredient}
            </div>
          ))}
        </div>
      </div>

      {/* Steps section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {t("cookingMode.steps") || "Steps"}
            </h3>
            <span className="ml-1 text-xs bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full tabular-nums">
              {completedSteps.length}/{instructions.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={isSpeaking ? stopSpeaking : speakAllSteps}
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {isSpeaking ? (t("cookingMode.stop") || "Stop") : (t("cookingMode.listenAll") || "Listen All")}
          </Button>
        </div>
        <div className="px-4 pb-4 space-y-2.5">
          {instructions.map((instruction, index) => {
            const isCompleted = completedSteps.includes(index);
            return (
              <div
                key={index}
                onClick={() => toggleStep(index)}
                className={`relative p-3.5 rounded-xl border transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                  isCompleted
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all mt-0.5 ${
                      isCompleted
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-relaxed ${
                        isCompleted
                          ? "line-through text-muted-foreground/70"
                          : "text-foreground"
                      }`}
                    >
                      {instruction.text}
                    </p>
                    {!isCompleted && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                          <Timer className="h-3 w-3 mr-1" />~{instruction.estimatedTime} min
                        </span>
                        <button
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
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

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-card/95 backdrop-blur-sm safe-area-bottom">
        {progress === 100 && instructions.length > 0 ? (
          <div className="text-center p-3 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-primary font-semibold text-sm">
              🎉 {t("cookingMode.completed") || "All steps completed! Enjoy your meal!"}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {completedSteps.length} / {instructions.length} {t("cookingMode.stepsCompleted") || "steps"}
            </span>
            <span className="text-xs font-semibold text-primary tabular-nums">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingMode;
