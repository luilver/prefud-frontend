import { Sparkles, Loader2 } from "lucide-react";
import { usePantryMealsJob } from "@/contexts/PantryMealsJobContext";

const PantryMealsJobIndicator = () => {
  const { activeJob, isProcessing } = usePantryMealsJob();

  if (!isProcessing || !activeJob) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] animate-in slide-in-from-top-4"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 5rem)" }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-accent px-4 py-3 shadow-2xl">
        <div className="relative">
          <Sparkles className="h-6 w-6 text-white" />
          <Loader2 className="absolute -bottom-1 -right-1 h-3 w-3 animate-spin text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            Cooking up meal ideas from your pantry…
          </p>
          <p className="text-xs text-primary-foreground truncate">
            We'll notify you when your suggestions are ready
          </p>
        </div>
      </div>
    </div>
  );
};

export default PantryMealsJobIndicator;