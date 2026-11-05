import React, { useState, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAssistant } from "@/contexts/AssistantContext";
import { Brain, Sparkles, ChefHat, Clock } from "lucide-react";

// Progressive waiting stages that cycle until the answer arrives
const WAITING_STAGES = [
  { key: "thinking", duration: 2500 },
  { key: "reasoning", duration: 3000 },
  { key: "preparingPlan", duration: 3500 },
  { key: "almostReady", duration: 3500 },
];

export const ChatTypingIndicator: React.FC = () => {
  const { t } = useLanguage();
  const { isReady } = useAssistant();
  const [stageIndex, setStageIndex] = useState(0);

  // Cycle and repeat through progressive stages while waiting for the answer
  useEffect(() => {
    if (isReady) return;

    const currentDuration = WAITING_STAGES[stageIndex].duration;
    const timer = setTimeout(() => {
      setStageIndex((prev) => (prev + 1) % WAITING_STAGES.length);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [stageIndex, isReady]);

  const stages = [
    {
      text: t("assistant.loader.thinking") || "Thinking",
      icon: <Brain className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />,
    },
    {
      text: t("assistant.loader.reasoning") || "Reasoning",
      icon: <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />,
    },
    {
      text: t("assistant.loader.preparingPlan") || "Preparing your meal plan",
      icon: <ChefHat className="w-3.5 h-3.5 text-primary animate-bounce shrink-0" />,
    },
    {
      text: t("assistant.loader.almostReady") || "Almost ready",
      icon: <Clock className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />,
    },
  ];

  // When the answer is received, display Voilà! with celebration animations
  if (isReady) {
    return (
      <MessageBubble role="ai">
        <div className="flex items-center gap-2 text-sm text-primary font-semibold select-none min-h-[22px]">
          <span className="flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-spin shrink-0" />
          </span>
          <span className="animate-in zoom-in-95 fade-in-0 duration-300 text-sm tracking-wide font-bold">
            {t("assistant.loader.voila") || "¡Vouallá!"}
          </span>
          <span className="inline-flex items-center gap-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.32s] inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.16s] inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce inline-block" />
          </span>
        </div>
      </MessageBubble>
    );
  }

  const current = stages[stageIndex] || stages[0];

  return (
    <MessageBubble role="ai">
      <div className="flex items-center gap-2 text-sm text-foreground/90 font-medium select-none min-h-[22px]">
        {/* Animated Step Icon */}
        <span className="flex items-center justify-center">
          {current.icon}
        </span>

        {/* Transitioning Step Text */}
        <span
          key={stageIndex}
          className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 text-sm tracking-wide font-medium"
        >
          {current.text}
        </span>

        {/* Moving Wave Dots */}
        <span className="inline-flex items-center gap-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.32s] inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.16s] inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce inline-block" />
        </span>
      </div>
    </MessageBubble>
  );
};

export default ChatTypingIndicator;
