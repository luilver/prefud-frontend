import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { connectJobSocket } from "@/services/mealPlanJobService";
import { useToast } from "@/hooks/use-toast";

interface ActiveAIMealJob {
  jobId: string;
  requestData: any;
  startedAt: number;
}

interface AIMealJobContextValue {
  activeJob: ActiveAIMealJob | null;
  isProcessing: boolean;
  startJob: (jobId: string, requestData: any) => void;
  clearJob: () => void;
  readyMeal: any | null;
  dismissReadyMeal: () => void;
}

const STORAGE_KEY = "pantry.activeAIMealJob";

const AIMealJobContext = createContext<AIMealJobContextValue | undefined>(undefined);

const transformResultToLocalMeal = (result: any, requestData: any) => {
  // The socket result mirrors the previous synchronous createAIMeal response shape.
  const sm = result?.specialMeal?.specialMeal || result?.specialMeal || result;
  const ingredientsList = result?.specialMeal?.ingredientsList || result?.ingredientsList;
  const totalCarbonFootprint =
    result?.specialMeal?.totalCarbonFootprint ?? result?.totalCarbonFootprint;

  const tags: string[] = [];
  if (requestData?.healthGoals?.length) tags.push(...requestData.healthGoals.slice(0, 2));
  if (requestData?.dietaryRestrictions?.length)
    tags.push(...requestData.dietaryRestrictions.slice(0, 2));
  tags.push("AI Generated");

  return {
    id: Date.now().toString(),
    name: sm?.name,
    description: sm?.description,
    cookingTime: sm?.cookingTime,
    servings: requestData?.numberPeople || 2,
    difficulty: requestData?.cookingSkillLevel || "intermediate",
    cuisine: requestData?.cuisinePreferences?.[0] || "Fusion",
    calories: sm?.calories,
    ingredients: sm?.ingredients || [],
    instructions: sm?.steps || [],
    nutritionalInfo: sm?.nutritionalInfo,
    tags: [...new Set(tags)].slice(0, 4),
    benefits: sm?.benefits,
    prepTip: sm?.prepTip,
    carbonFootprint: totalCarbonFootprint,
    ingredientsList,
  };
};

export const AIMealJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJob, setActiveJob] = useState<ActiveAIMealJob | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ActiveAIMealJob) : null;
    } catch {
      return null;
    }
  });
  const [readyMeal, setReadyMeal] = useState<any | null>(null);
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
    const job: ActiveAIMealJob = { jobId, requestData, startedAt: Date.now() };
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
          const localMeal = transformResultToLocalMeal(
            payload.result,
            activeJob.requestData
          );
          setReadyMeal(localMeal);
        } catch (err) {
          console.error("Error handling AI meal generationCompleted:", err);
          toast({
            title: "AI Meal Ready",
            description: "Refreshing your meals...",
          });
        } finally {
          clearJob();
        }
      },
      onFailed: (payload) => {
        toast({
          title: "AI Meal Generation Failed",
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
    <AIMealJobContext.Provider
      value={{
        activeJob,
        isProcessing: !!activeJob,
        startJob,
        clearJob,
        readyMeal,
        dismissReadyMeal: () => setReadyMeal(null),
      }}
    >
      {children}
    </AIMealJobContext.Provider>
  );
};

export const useAIMealJob = () => {
  const ctx = useContext(AIMealJobContext);
  if (!ctx) throw new Error("useAIMealJob must be used within AIMealJobProvider");
  return ctx;
};