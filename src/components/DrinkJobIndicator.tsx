import { GlassWater, Loader2 } from "lucide-react";
import { useDrinkJob } from "@/contexts/DrinkJobContext";

const DrinkJobIndicator = () => {
  const { activeJob, isProcessing } = useDrinkJob();

  if (!isProcessing || !activeJob) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] animate-in slide-in-from-top-4"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 5rem)" }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-600 to-emerald-700 px-4 py-3 shadow-2xl">
        <div className="relative">
          <GlassWater className="h-6 w-6 text-white" />
          <Loader2 className="absolute -bottom-1 -right-1 h-3 w-3 animate-spin text-teal-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            Mixing your healthy drink…
          </p>
          <p className="text-xs text-teal-100 truncate">
            {activeJob.requestData.drink_name || "We'll notify you when it's ready"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DrinkJobIndicator;