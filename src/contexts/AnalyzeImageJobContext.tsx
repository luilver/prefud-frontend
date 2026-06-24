import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { connectJobSocket } from "@/services/mealPlanJobService";
import { useToast } from "@/hooks/use-toast";
import type { PantryIngredient } from "@/services/pantryService";

interface ActiveAnalyzeImageJob {
  jobId: string;
  startedAt: number;
}

interface AnalyzeImageJobContextValue {
  activeJob: ActiveAnalyzeImageJob | null;
  isProcessing: boolean;
  startJob: (jobId: string) => void;
  clearJob: () => void;
  readyIngredients: PantryIngredient[] | null;
  dismissReadyIngredients: () => void;
}

const STORAGE_KEY = "pantry.activeAnalyzeImageJob";

const AnalyzeImageJobContext = createContext<AnalyzeImageJobContextValue | undefined>(undefined);

const normalizeIngredients = (result: any): PantryIngredient[] => {
  const list = Array.isArray(result) ? result : Array.isArray(result?.ingredients) ? result.ingredients : [];
  return list.map((it: any) => {
    const purchaseDate = it.purchaseDate || new Date().toISOString();
    let expiryDate = it.expiryDate;
    if (!expiryDate && typeof it.daysToExpire === "number") {
      const d = new Date();
      d.setDate(d.getDate() + it.daysToExpire);
      expiryDate = d.toISOString();
    }
    return {
      id: `pantry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: it.name || "",
      quantity: typeof it.quantity === "number" ? it.quantity : parseFloat(it.quantity) || 1,
      unit: it.unit || "unit",
      category: (it.category || "other").toString().toLowerCase(),
      purchased: it.purchased ?? true,
      purchaseDate,
      carbonFootPrintToWaste:
        typeof it.carbonFootPrintToWaste === "number" ? it.carbonFootPrintToWaste : 0.5,
      daysToExpire: typeof it.daysToExpire === "number" ? it.daysToExpire : 7,
      expiryDate: expiryDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      notes: it.notes || "",
    } as PantryIngredient;
  });
};

export const AnalyzeImageJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJob, setActiveJob] = useState<ActiveAnalyzeImageJob | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ActiveAnalyzeImageJob) : null;
    } catch {
      return null;
    }
  });
  const [readyIngredients, setReadyIngredients] = useState<PantryIngredient[] | null>(null);
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

  const startJob = useCallback((jobId: string) => {
    const job: ActiveAnalyzeImageJob = { jobId, startedAt: Date.now() };
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
          const ingredients = normalizeIngredients(payload.result);
          if (ingredients.length === 0) {
            toast({
              title: "No ingredients detected",
              description: "We couldn't identify any ingredients in the image.",
            });
          } else {
            setReadyIngredients(ingredients);
          }
        } catch (err) {
          console.error("Error handling analyze-image generationCompleted:", err);
          toast({
            title: "Image analyzed",
            description: "We couldn't read the response.",
            variant: "destructive",
          });
        } finally {
          clearJob();
        }
      },
      onFailed: (payload) => {
        toast({
          title: "Image Analysis Failed",
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
    <AnalyzeImageJobContext.Provider
      value={{
        activeJob,
        isProcessing: !!activeJob,
        startJob,
        clearJob,
        readyIngredients,
        dismissReadyIngredients: () => setReadyIngredients(null),
      }}
    >
      {children}
    </AnalyzeImageJobContext.Provider>
  );
};

export const useAnalyzeImageJob = () => {
  const ctx = useContext(AnalyzeImageJobContext);
  if (!ctx) throw new Error("useAnalyzeImageJob must be used within AnalyzeImageJobProvider");
  return ctx;
};