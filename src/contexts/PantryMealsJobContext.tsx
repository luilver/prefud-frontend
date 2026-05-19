import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { connectJobSocket } from "@/services/mealPlanJobService";
import { useToast } from "@/hooks/use-toast";

interface ActivePantryMealsJob {
  jobId: string;
  requestData: any;
  startedAt: number;
}

interface ReadyPantryMeals {
  meals: any[];
  totalCarbonFootprint?: number;
}

interface PantryMealsJobContextValue {
  activeJob: ActivePantryMealsJob | null;
  isProcessing: boolean;
  startJob: (jobId: string, requestData: any) => void;
  clearJob: () => void;
  readyMeals: ReadyPantryMeals | null;
  dismissReadyMeals: () => void;
}

const STORAGE_KEY = "pantry.activePantryMealsJob";

const PantryMealsJobContext = createContext<PantryMealsJobContextValue | undefined>(undefined);

const transformResult = (result: any): ReadyPantryMeals => {
  const generated = result?.generatedMeals || [];
  const meals = generated.map((meal: any) => ({
    id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: meal.name,
    description: meal.description,
    prepTime: meal.cookingTime,
    difficulty: "medium",
    calories: meal.calories,
    type: meal.mealType,
    benefits: meal.benefits,
    prepTip: meal.prepTip,
    carbonFootprint: meal.carbonFootprint,
    ingredients: meal.ingredientsList || [],
    steps: meal.steps || [],
    nutritionalInfo: meal.nutritionalInfo,
    instructions: meal.instructions,
  }));
  return { meals, totalCarbonFootprint: result?.totalCarbonFootprint };
};

export const PantryMealsJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJob, setActiveJob] = useState<ActivePantryMealsJob | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ActivePantryMealsJob) : null;
    } catch {
      return null;
    }
  });
  const [readyMeals, setReadyMeals] = useState<ReadyPantryMeals | null>(null);
  const { toast } = useToast();
  const cleanupRef = useRef<(() => void) | null>(null);

  const clearJob = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    localStorage.removeItem(STORAGE_KEY);
    setActiveJob(null);
  }, []);

  const startJob = useCallback((jobId: string, requestData: any) => {
    const job: ActivePantryMealsJob = { jobId, requestData, startedAt: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
    } catch {}
    setActiveJob(job);
  }, []);

  useEffect(() => {
    if (!activeJob) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const cleanup = connectJobSocket(activeJob.jobId, {
      onCompleted: (payload) => {
        try {
          const transformed = transformResult(payload.result);
          if (transformed.meals.length === 0) {
            toast({
              title: "Pantry Meals Ready",
              description: "No meals were generated.",
            });
          } else {
            setReadyMeals(transformed);
          }
        } catch (err) {
          console.error("Error handling pantry meals generationCompleted:", err);
          toast({
            title: "Pantry Meals Ready",
            description: "Refreshing your suggestions...",
          });
        } finally {
          clearJob();
        }
      },
      onFailed: (payload) => {
        toast({
          title: "Pantry Meals Generation Failed",
          description: payload?.message || payload?.error || "Please try again.",
          variant: "destructive",
        });
        clearJob();
      },
    });

    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJob?.jobId]);

  return (
    <PantryMealsJobContext.Provider
      value={{
        activeJob,
        isProcessing: !!activeJob,
        startJob,
        clearJob,
        readyMeals,
        dismissReadyMeals: () => setReadyMeals(null),
      }}
    >
      {children}
    </PantryMealsJobContext.Provider>
  );
};

export const usePantryMealsJob = () => {
  const ctx = useContext(PantryMealsJobContext);
  if (!ctx) throw new Error("usePantryMealsJob must be used within PantryMealsJobProvider");
  return ctx;
};