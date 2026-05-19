import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { connectJobSocket } from "@/services/mealPlanJobService";
import type { CreateDrinkRequest, ApiDrinkPlan } from "@/services/drinkService";
import { useToast } from "@/hooks/use-toast";

interface ActiveDrinkJob {
  jobId: string;
  requestData: CreateDrinkRequest;
  startedAt: number;
}

interface DrinkJobContextValue {
  activeJob: ActiveDrinkJob | null;
  isProcessing: boolean;
  startJob: (jobId: string, requestData: CreateDrinkRequest) => void;
  clearJob: () => void;
  readyDrink: any | null;
  dismissReadyDrink: () => void;
}

const STORAGE_KEY = "pantry.activeDrinkJob";

const DrinkJobContext = createContext<DrinkJobContextValue | undefined>(undefined);

const transformDrinkResultToLocal = (
  result: ApiDrinkPlan,
  requestData: CreateDrinkRequest
) => {
  return {
    name: result.healthyDrink.name,
    type: result.healthyDrink.drinkType,
    description: result.healthyDrink.description,
    prepTime: `${result.healthyDrink.cookingTime} minutes`,
    servings: requestData.numberPeople || 1,
    calories: result.healthyDrink.calories,
    ingredients: result.healthyDrink.ingredients.map((ing: any) => ({
      name: ing.name,
      amount: `${ing.quantity} ${ing.unit}`,
      category:
        result.ingredientsList.find((item: any) => item.name === ing.name)
          ?.classification || "Other",
    })),
    instructions: result.healthyDrink.steps,
    nutritionHighlights: [
      result.healthyDrink.benefits,
      `Rich in vitamins: ${result.healthyDrink.nutritionalInfo.vitamins.join(", ")}`,
      `${result.healthyDrink.nutritionalInfo.protein}g protein, ${result.healthyDrink.nutritionalInfo.fiber}g fiber`,
    ],
    tips: [result.healthyDrink.prepTip, result.healthyDrink.instructions],
    healthGoals: requestData.healthGoals || [],
    dietaryRestrictions: requestData.dietaryRestrictions || [],
    servingSize: requestData.numberPeople || 1,
    apiData: result,
  };
};

export const DrinkJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJob, setActiveJob] = useState<ActiveDrinkJob | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ActiveDrinkJob) : null;
    } catch {
      return null;
    }
  });
  const [readyDrink, setReadyDrink] = useState<any | null>(null);
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

  const startJob = useCallback((jobId: string, requestData: CreateDrinkRequest) => {
    const job: ActiveDrinkJob = { jobId, requestData, startedAt: Date.now() };
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
          const localDrink = transformDrinkResultToLocal(
            payload.result as ApiDrinkPlan,
            activeJob.requestData
          );
          setReadyDrink(localDrink);
        } catch (err) {
          console.error("Error handling drink generationCompleted:", err);
          toast({
            title: "Healthy Drink Ready",
            description: "Refreshing your drinks...",
          });
        } finally {
          clearJob();
        }
      },
      onFailed: (payload) => {
        toast({
          title: "Drink Generation Failed",
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
    <DrinkJobContext.Provider
      value={{
        activeJob,
        isProcessing: !!activeJob,
        startJob,
        clearJob,
        readyDrink,
        dismissReadyDrink: () => setReadyDrink(null),
      }}
    >
      {children}
    </DrinkJobContext.Provider>
  );
};

export const useDrinkJob = () => {
  const ctx = useContext(DrinkJobContext);
  if (!ctx) throw new Error("useDrinkJob must be used within DrinkJobProvider");
  return ctx;
};