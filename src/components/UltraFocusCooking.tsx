import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Play,
  Pause,
  ChefHat,
  Timer,
  Check,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { speak as ttsSpeak, stopSpeaking as ttsStop } from "@/utils/ttsService";

interface UltraFocusCookingProps {
  mealName: string;
  instructions: { text: string; tip: string; estimatedTime: number }[];
  completedSteps: number[];
  onToggleStep: (index: number) => void;
  onClose: () => void;
}

const UltraFocusCooking = ({
  mealName,
  instructions,
  completedSteps,
  onToggleStep,
  onClose,
}: UltraFocusCookingProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoPlayRef = useRef(false);
  const speakingCancelledRef = useRef(false);
  const { t, language } = useLanguage();

  const speechLang = language === "es" ? "es-ES" : language === "pt" ? "pt-BR" : "en-US";

  // Scroll to current card
  const scrollToCard = useCallback((index: number) => {
    cardRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, []);

  // Auto-play: speak each step, advance, repeat
  const startAutoPlay = useCallback(async () => {
    speakingCancelledRef.current = false;
    autoPlayRef.current = true;
    setIsAutoPlaying(true);
    setIsSpeaking(true);

    let idx = currentIndex;

    const speakNext = async () => {
      if (speakingCancelledRef.current || !autoPlayRef.current) {
        setIsAutoPlaying(false);
        setIsSpeaking(false);
        return;
      }
      if (idx >= instructions.length) {
        setIsAutoPlaying(false);
        setIsSpeaking(false);
        return;
      }

      setCurrentIndex(idx);
      scrollToCard(idx);

      const text = `${t("cookingMode.step") || "Step"} ${idx + 1}. ${instructions[idx].text}`;
      try {
        await ttsSpeak(text, speechLang, 0.9);
      } catch {
        setIsAutoPlaying(false);
        setIsSpeaking(false);
        return;
      }

      if (speakingCancelledRef.current || !autoPlayRef.current) {
        setIsAutoPlaying(false);
        setIsSpeaking(false);
        return;
      }

      idx++;
      await speakNext();
    };

    await ttsStop();
    await speakNext();
  }, [currentIndex, instructions, speechLang, t, scrollToCard]);

  const stopAutoPlay = useCallback(() => {
    autoPlayRef.current = false;
    speakingCancelledRef.current = true;
    ttsStop();
    setIsAutoPlaying(false);
    setIsSpeaking(false);
  }, []);

  // Navigate cards manually
  const goTo = (index: number) => {
    if (index < 0 || index >= instructions.length) return;
    if (isAutoPlaying) stopAutoPlay();
    setCurrentIndex(index);
    scrollToCard(index);
  };

  // Scroll snapping: update currentIndex on scroll end
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (isAutoPlaying) return;
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        let closestIdx = 0;
        let closestDist = Infinity;
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(cardCenter - centerX);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        });
        setCurrentIndex(closestIdx);
      }, 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isAutoPlaying]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      ttsStop();
    };
  }, []);

  // Initial scroll to first card
  useEffect(() => {
    scrollToCard(0);
  }, [scrollToCard]);

  const progress = instructions.length > 0
    ? Math.round((completedSteps.length / instructions.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header */}
      <div className="safe-area-top px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { stopAutoPlay(); onClose(); }}
            className="h-9 w-9 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="h-3.5 w-3.5 text-white/50" />
              <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                Pantry
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-white/50 text-xs font-medium">
                {t("cookingMode.ultraFocus") || "Ultra Focus"}
              </span>
            </div>
            <h2 className="text-white font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md mt-0.5">
              {mealName}
            </h2>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
          className={`h-10 px-4 gap-2 rounded-full transition-all ${
            isAutoPlaying
              ? "bg-white text-black hover:bg-white/90"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isAutoPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              <span className="text-xs font-semibold">{t("cookingMode.stop") || "Stop"}</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span className="text-xs font-semibold">{t("cookingMode.autoPlay") || "Auto"}</span>
            </>
          )}
        </Button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 px-4 py-2">
        {instructions.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-6 h-2 bg-white"
                : completedSteps.includes(i)
                  ? "w-2 h-2 bg-green-400"
                  : "w-2 h-2 bg-white/25"
            }`}
          />
        ))}
      </div>

      {/* Step counter */}
      <div className="text-center py-2">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
          {t("cookingMode.step") || "Step"} {currentIndex + 1} / {instructions.length}
        </span>
      </div>

      {/* Cards area */}
      <div className="flex-1 flex items-center relative">
        {/* Nav arrows - desktop */}
        <button
          onClick={() => goTo(currentIndex - 1)}
          className="hidden md:flex absolute left-4 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-0"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => goTo(currentIndex + 1)}
          className="hidden md:flex absolute right-4 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-0"
          disabled={currentIndex === instructions.length - 1}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory w-full h-full items-center px-[25%] md:px-[30%] gap-4 md:gap-6 scrollbar-hide"
        >
          {instructions.map((instruction, index) => {
            const isActive = index === currentIndex;
            const isCompleted = completedSteps.includes(index);
            return (
              <div
                key={index}
                ref={(el) => { cardRefs.current[index] = el; }}
                onClick={() => goTo(index)}
                className={`flex-shrink-0 snap-center w-[70vw] md:w-[400px] lg:w-[450px] rounded-2xl p-6 md:p-8 transition-all duration-500 cursor-pointer ${
                  isActive
                    ? "bg-white/12 border-2 border-white/30 scale-100 shadow-2xl shadow-white/5"
                    : "bg-white/5 border border-white/10 scale-90 opacity-50"
                }`}
              >
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/50"
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium">
                      <Timer className="h-3 w-3 mr-1" />
                      ~{instruction.estimatedTime} min
                    </span>
                  </div>
                </div>

                {/* Step text */}
                <p
                  className={`text-base md:text-lg leading-relaxed mb-6 ${
                    isCompleted
                      ? "line-through text-white/30"
                      : isActive
                        ? "text-white"
                        : "text-white/40"
                  }`}
                >
                  {instruction.text}
                </p>

                {/* Tip */}
                {instruction.tip && isActive && !isCompleted && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
                    <p className="text-white/50 text-xs leading-relaxed">
                      💡 {instruction.tip}
                    </p>
                  </div>
                )}

                {/* Complete button */}
                {isActive && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStep(index);
                    }}
                    className={`w-full rounded-full h-11 text-sm font-semibold transition-all ${
                      isCompleted
                        ? "bg-white/10 text-white/70 hover:bg-white/20"
                        : "bg-white text-black hover:bg-white/90"
                    }`}
                  >
                    {isCompleted
                      ? (t("cookingMode.undoStep") || "Undo")
                      : (t("cookingMode.markDone") || "Mark as done")}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer progress */}
      <div className="safe-area-bottom px-4 md:px-8 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white/50 text-xs font-semibold tabular-nums">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltraFocusCooking;
