import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  connectJobSocket,
  transformJobResultToApiMealPlan,
} from "@/services/mealPlanJobService";
import { transformApiMealPlanToLocal } from "@/services/mealPlanService";
import type { CreateMealPlanRequest } from "@/services/mealPlanService";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface ActiveJob {
  jobId: string;
  requestData: CreateMealPlanRequest;
  startedAt: number;
}

interface MealPlanJobContextValue {
  activeJob: ActiveJob | null;
  isProcessing: boolean;
  startJob: (jobId: string, requestData: CreateMealPlanRequest) => void;
  clearJob: () => void;
}

const STORAGE_KEY = "pantry.activeMealPlanJob";

const MealPlanJobContext = createContext<MealPlanJobContextValue | undefined>(undefined);

export const MealPlanJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ActiveJob) : null;
    } catch {
      return null;
    }
  });
  const { addMealPlan, refreshMealPlans } = useUser();
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

  const startJob = useCallback((jobId: string, requestData: CreateMealPlanRequest) => {
    const job: ActiveJob = { jobId, requestData, startedAt: Date.now() };
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
          const apiPlan = transformJobResultToApiMealPlan(
            payload.result,
            activeJob.requestData,
            activeJob.jobId
          );
          const localPlan = transformApiMealPlanToLocal(apiPlan);
          addMealPlan(localPlan as any);
          refreshMealPlans();
          toast({
            title: "🎉 Meal Plan Ready!",
            description: `${activeJob.requestData.plan_name || "Your meal plan"} is ready to explore.`,
            duration: 8000,
          });
        } catch (err) {
          console.error("Error handling generationCompleted:", err);
          toast({
            title: "Meal Plan Ready",
            description: "Refreshing your meal plans...",
          });
          refreshMealPlans();
        } finally {
          clearJob();
        }
      },
      onFailed: (payload) => {
        toast({
          title: "Meal Plan Generation Failed",
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
    <MealPlanJobContext.Provider
      value={{ activeJob, isProcessing: !!activeJob, startJob, clearJob }}
    >
      {children}
    </MealPlanJobContext.Provider>
  );
};

export const useMealPlanJob = () => {
  const ctx = useContext(MealPlanJobContext);
  if (!ctx) throw new Error("useMealPlanJob must be used within MealPlanJobProvider");
  return ctx;
};