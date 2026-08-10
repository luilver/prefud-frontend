import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import type { AssistantPayload, ChatMessage, CheckoutStep, IngredientListItem } from "@/types/assistant";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

interface AssistantContextValue {
  messages: ChatMessage[];
  isTyping: boolean;
  workspacePayload: AssistantPayload | null;
  checkoutStep: CheckoutStep;
  checkoutCart: IngredientListItem[];
  sendUserMessage: (text: string) => Promise<void>;
  pickQuestion: (ask: string) => Promise<void>;
  openInWorkspace: (payload: AssistantPayload | null) => void;
  startCheckout: (items: IngredientListItem[]) => void;
  advanceCheckout: (step: CheckoutStep) => void;
  resetCheckout: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

import { useLanguage } from "@/contexts/LanguageContext";

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const { t } = useLanguage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [workspacePayload, setWorkspacePayload] = useState<AssistantPayload | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("idle");
  const [checkoutCart, setCheckoutCart] = useState<IngredientListItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      const welcomeMsg: ChatMessage = {
        id: prev[0]?.id || uid(),
        role: "ai",
        text: t("assistant.welcome"),
        questions: [
          { ask: t("assistant.q.plan") },
          { ask: t("assistant.q.recipe") },
          { ask: t("assistant.q.drink") },
          { ask: t("assistant.q.pantry") },
        ],
      };
      
      if (prev.length === 0) {
        return [welcomeMsg];
      }
      
      // Update only if it's still just the welcome message
      if (prev.length === 1 && prev[0].role === "ai") {
        return [welcomeMsg];
      }
      
      // If there are multiple messages, we might want to keep history but update the first message anyway
      const newMessages = [...prev];
      if (newMessages[0].role === "ai") {
         newMessages[0] = welcomeMsg;
      }
      return newMessages;
    });
  }, [t]);

  useEffect(() => {
    // Connect to the NestJS WebSocket Gateway (Ensure URL matches your backend environment)
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || "ws://localhost:3001"); 
    setSocket(socketInstance);

    socketInstance.on("generationCompleted", (data) => {
      console.log("Background job completed successfully!", data);
      setIsTyping(false);
      
      const responseText = data.result?.message?.response || data.result?.response || (typeof data.result === 'string' ? data.result : "Aquí tienes el resultado.");
      const questions = data.result?.message?.questions || data.result?.questions;
      let payload = data.result?.message?.payload || data.result?.payload;
      const genMeals = data.result?.message?.generatedMeals;
      if (genMeals) {
        if (genMeals.mealPlan) {
          payload = {
            type: "mealPlan",
            data: {
              mealPlan: { mealPlan: genMeals.mealPlan },
              totalCarbonFootprint: genMeals.totalCarbonFootprint,
              ingredientsList: genMeals.ingredientsList || [],
            },
          };
        } else if (genMeals.specialMeal) {
          payload = {
            type: "specialMeal",
            data: {
              specialMeal: { specialMeal: genMeals.specialMeal },
              totalCarbonFootprint: genMeals.totalCarbonFootprint,
              ingredientsList: genMeals.ingredientsList || [],
            },
          };
        } else if (genMeals.drinkPlan || genMeals.healthyDrink) {
          payload = {
            type: "healthyDrink",
            data: {
              healthyDrink: { healthyDrink: genMeals.drinkPlan || genMeals.healthyDrink },
              totalCarbonFootprint: genMeals.totalCarbonFootprint,
              ingredientsList: genMeals.ingredientsList || [],
            },
          };
        } else if (genMeals.generatedMeals) {
          payload = {
            type: "generatedMeals",
            data: {
              generatedMeals: genMeals,
              totalCarbonFootprint: genMeals.totalCarbonFootprint,
              ingredientsList: genMeals.ingredientsList || [],
            },
          };
        }
      }

      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "ai",
          text: responseText,
          questions: questions,
          payload: payload,
        },
      ]);
    });

    socketInstance.on("generationFailed", (data) => {
      console.error("Background job failed:", data.error);
      setIsTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "ai",
          text: t("assistant.errors.processRequest"),
        },
      ]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const submit = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: uid(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setIsTyping(true);

    if (socket) {
      const userId = authUser?.userId || "unknown-user";
      
      const formattedHistory = [...messages, userMsg].map(msg => ({
        role: msg.role === "ai" ? "system" : "user",
        content: msg.text
      }));

      socket.emit("sendChatMessage", { user_id: userId, history: formattedHistory }, (response: any) => {
        if (response?.status === "success") {
          console.log(`Job ${response.jobId} started in room ${response.room}`);
        } else {
          console.error("Failed to start job:", response?.message);
          setIsTyping(false);
          setMessages((m) => [
            ...m,
            { id: uid(), role: "ai", text: t("assistant.errors.connectionTask") },
          ]);
        }
      });
    } else {
      setIsTyping(false);
      console.error("Socket not connected");
      setMessages((m) => [
        ...m,
        { id: uid(), role: "ai", text: t("assistant.errors.chatDisconnected") },
      ]);
    }
  }, [socket, messages, authUser]);

  const sendUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    await submit(text.trim());
  }, [submit]);

  const pickQuestion = useCallback(async (ask: string) => {
    await submit(ask);
  }, [submit]);

  const openInWorkspace = useCallback((payload: AssistantPayload | null) => {
    setWorkspacePayload(payload);
  }, []);

  const startCheckout = useCallback((items: IngredientListItem[]) => {
    setCheckoutCart(items);
    setCheckoutStep("summary");
    const chipMsg: ChatMessage = {
      id: uid(),
      role: "ai",
      text: t("assistant.checkout.summaryIntro"),
      questions: [
        { ask: "__co_address_saved" },
        { ask: "__co_address_new" },
      ],
    };
    setMessages((m) => [...m, chipMsg]);
  }, []);

  const advanceCheckout = useCallback((step: CheckoutStep) => {
    setCheckoutStep(step);
  }, []);

  const resetCheckout = useCallback(() => {
    setCheckoutStep("idle");
    setCheckoutCart([]);
  }, []);

  const value = useMemo(
    () => ({
      messages,
      isTyping,
      workspacePayload,
      checkoutStep,
      checkoutCart,
      sendUserMessage,
      pickQuestion,
      openInWorkspace,
      startCheckout,
      advanceCheckout,
      resetCheckout,
    }),
    [messages, isTyping, workspacePayload, checkoutStep, checkoutCart, sendUserMessage, pickQuestion, openInWorkspace, startCheckout, advanceCheckout, resetCheckout]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used inside AssistantProvider");
  return ctx;
}
