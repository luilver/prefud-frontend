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
      className="fixed left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] animate-in slide-in-from-bottom-4 md:slide-in-from-top-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] md:bottom-auto md:top-[calc(env(safe-area-inset-top,0px)+1.5rem)]"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-2xl">
        <div className="relative flex-shrink-0">
          <ChefHat className="h-6 w-6 text-orange-400" />
          <Loader2 className="absolute -bottom-1 -right-1 h-3 w-3 animate-spin text-orange-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            Cooking your meal plan…
          </p>
          <p className="text-xs text-slate-400 truncate">
            {activeJob.requestData.plan_name || "We'll notify you when it's ready"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MealPlanJobIndicator;