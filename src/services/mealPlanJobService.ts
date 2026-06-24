import { io, Socket } from "socket.io-client";
import type { CreateMealPlanRequest } from "./mealPlanService";

const API_BASE_URL = import.meta.env.VITE_PANTRY_URL || "https://pantry-ms-brain.onrender.com";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "wss://pantry-ms-brain.onrender.com";

export interface CreateMealPlanJobResponse {
  jobId: string;
}

export const createMealPlanJob = async (
  planData: CreateMealPlanRequest
): Promise<CreateMealPlanJobResponse> => {
  const response = await fetch(`${API_BASE_URL}/meal-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(planData),
  });

  const data = await response.json();
  console.log("createMealPlanJob response:", data);

  if (data?.code === "03") {
    const error = new Error(
      data.message || "No meal plans available according to your subscription"
    );
    (error as any).code = "03";
    throw error;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Failed to create meal plan: ${response.status}`);
  }

  if (!data?.jobId) {
    throw new Error("Server did not return a jobId");
  }

  return { jobId: data.jobId };
};

export interface JobSocketHandlers {
  onCompleted: (payload: { jobId: string; result: any }) => void;
  onFailed: (payload: { jobId: string; error?: string; message?: string }) => void;
  onConnectError?: (err: Error) => void;
}

export const connectJobSocket = (
  jobId: string,
  handlers: JobSocketHandlers
): (() => void) => {
  const socket: Socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
  });

  const join = () => {
    console.log("[jobSocket] joining job room:", jobId);
    socket.emit("joinJobRoom", { jobId });
  };

  socket.on("connect", join);
  socket.on("reconnect", join);

  socket.on("generationCompleted", (payload: any) => {
    console.log("[jobSocket] generationCompleted", payload);
    if (!payload?.jobId || payload.jobId === jobId) {
      handlers.onCompleted(payload);
    }
  });

  socket.on("generationFailed", (payload: any) => {
    console.log("[jobSocket] generationFailed", payload);
    if (!payload?.jobId || payload.jobId === jobId) {
      handlers.onFailed(payload);
    }
  });

  socket.on("connect_error", (err) => {
    console.warn("[jobSocket] connect_error", err);
    handlers.onConnectError?.(err as Error);
  });

  return () => {
    socket.removeAllListeners();
    socket.disconnect();
  };
};

/**
 * Map socket job result into the ApiMealPlan shape expected by
 * transformApiMealPlanToLocal.
 */
export const transformJobResultToApiMealPlan = (
  result: any,
  requestData: CreateMealPlanRequest,
  jobId: string
): any => {
  return {
    _id: jobId,
    user_id: requestData.user_id,
    plan_name: requestData.plan_name,
    plan_description: requestData.plan_description,
    start_date: requestData.start_date,
    plan: result,
    duration: requestData.duration,
    numberPeople: requestData.numberPeople,
    numberKidsLessThan5: (requestData as any).numberKidsLessThan5 ?? 0,
    numberKids5To12: (requestData as any).numberKids5To12 ?? 0,
    mealsPerDay: requestData.mealsPerDay,
    dietaryRestrictions: requestData.dietaryRestrictions,
    cuisinePreferences: requestData.cuisinePreferences,
    allergiesIntolerance: requestData.allergiesIntolerance,
    dislikes: requestData.dislikes,
    maxCookingTime: requestData.maxCookingTime,
    cookingSkillLevel: requestData.cookingSkillLevel,
    budgetRange: requestData.budgetRange,
    healthGoals: requestData.healthGoals,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};