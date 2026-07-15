import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import type { AssistantPayload, ChatMessage, CheckoutStep, IngredientListItem } from "@/types/assistant";
import { mockAssistantResponse } from "@/services/assistantMockService";

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

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "ai",
      text: "Hola, soy prefud AI. Puedo generar planes de comida, recetas especiales, bebidas saludables o sugerir platos con lo que tengas en despensa. En que te ayudo hoy?",
      questions: [
        { ask: "Generame un plan para varios dias" },
        { ask: "Sugiereme una receta especial" },
        { ask: "Crea una bebida saludable" },
        { ask: "Que puedo cocinar con lo que tengo en despensa?" },
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [workspacePayload, setWorkspacePayload] = useState<AssistantPayload | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("idle");
  const [checkoutCart, setCheckoutCart] = useState<IngredientListItem[]>([]);

  const submit = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: uid(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setIsTyping(true);
    const res = await mockAssistantResponse(text);
    setIsTyping(false);
    setMessages((m) => [
      ...m,
      { id: uid(), role: "ai", text: res.response, questions: res.questions, payload: res.payload },
    ]);
  }, []);

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
      text: "Aqui tienes el resumen del carrito. Como deseas recibir tu pedido?",
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
