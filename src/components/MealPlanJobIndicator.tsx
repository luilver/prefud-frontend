import { ChefHat, Loader2 } from "lucide-react";
import { useMealPlanJob } from "@/contexts/MealPlanJobContext";

const MealPlanJobIndicator = () => {
  const { activeJob, isProcessing } = useMealPlanJob();

  if (!isProcessing || !activeJob) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] animate-in slide-in-from-top-4"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-primary px-4 py-3 shadow-2xl">
        <div className="relative">
          <ChefHat className="h-6 w-6 text-white" />
          <Loader2 className="absolute -bottom-1 -right-1 h-3 w-3 animate-spin text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            Cooking your meal plan…
          </p>
          <p className="text-xs text-primary-foreground truncate">
            {activeJob.requestData.plan_name || "We'll notify you when it's ready"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MealPlanJobIndicator;