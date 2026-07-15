import React, { useEffect, useRef, useState } from "react";
import { useAssistant } from "@/contexts/AssistantContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MessageBubble from "./MessageBubble";
import ActionChips from "./ActionChips";
import ChatComposer from "./ChatComposer";
import PayloadRenderer from "./PayloadRenderer";
import AssistantCheckout from "./checkout/AssistantCheckout";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import RecipeDetail from "./widgets/RecipeDetail";
import type { MealBase, IngredientListItem } from "@/types/assistant";
import { toast } from "@/hooks/use-toast";
import { Bot } from "lucide-react";

const ChatPane: React.FC = () => {
  const { messages, isTyping, sendUserMessage, pickQuestion, openInWorkspace, startCheckout } = useAssistant();
  const isMobile = useIsMobile();
  const endRef = useRef<HTMLDivElement>(null);
  const [sheetMeal, setSheetMeal] = useState<MealBase | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const handlePick = (ask: string) => {
    if (ask === "__co_address_saved" || ask === "__co_address_new") return;
    if (/carrito/i.test(ask)) {
      const last = [...messages].reverse().find((m) => m.payload && "ingredientsList" in (m.payload.data as any));
      if (last) {
        const items = (last.payload!.data as any).ingredientsList as IngredientListItem[];
        startCheckout(items);
        return;
      }
    }
    pickQuestion(ask);
  };

  const handleOpenMeal = (meal: MealBase) => {
    if (isMobile) setSheetMeal(meal);
    else openInWorkspace({ type: "specialMeal", data: {
      totalCarbonFootprint: meal.carbonFootprint,
      specialMeal: { specialMeal: meal },
      ingredientsList: (meal.ingredientsList ?? []) as IngredientListItem[],
    } });
  };

  const handleAddToCart = (items: IngredientListItem[]) => startCheckout(items);
  const handleAddToPantry = (items: IngredientListItem[]) => {
    toast({ title: "Anadido a despensa", description: `${items.length} ingredientes` });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">prefud AI</div>
          <div className="text-[11px] text-muted-foreground">Tu asistente de comida saludable</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            {m.text && (
              <MessageBubble role={m.role}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </MessageBubble>
            )}
            {m.payload && (
              <div className="pl-9 pr-2">
                <PayloadRenderer
                  payload={m.payload}
                  onOpenMeal={handleOpenMeal}
                  onAddToCart={handleAddToCart}
                  onAddToPantry={handleAddToPantry}
                />
              </div>
            )}
            {m.role === "ai" && m.questions && m.questions.length > 0 && (
              <div className="pl-9 pr-2">
                <ActionChips chips={m.questions.filter((q) => !q.ask.startsWith("__"))} onPick={handlePick} />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <MessageBubble role="ai">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
            </span>
          </MessageBubble>
        )}
        <div ref={endRef} />
      </div>

      <AssistantCheckout />
      <ChatComposer onSend={sendUserMessage} disabled={isTyping} />

      <Sheet open={!!sheetMeal} onOpenChange={(o) => !o && setSheetMeal(null)}>
        <SheetContent side="bottom" className="h-[90dvh] overflow-y-auto">
          {sheetMeal && <RecipeDetail meal={sheetMeal} />}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ChatPane;
