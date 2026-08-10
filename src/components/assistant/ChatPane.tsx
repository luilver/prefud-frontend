import React, { useEffect, useRef, useState } from "react";
import { useAssistant } from "@/contexts/AssistantContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MessageBubble from "./MessageBubble";
import ActionChips from "./ActionChips";
import ChatComposer from "./ChatComposer";
import PayloadRenderer from "./PayloadRenderer";
import AssistantCheckout from "./checkout/AssistantCheckout";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import RecipeDetail from "./widgets/RecipeDetail";
import type { MealBase, IngredientListItem, AssistantPayload } from "@/types/assistant";
import { toast } from "@/hooks/use-toast";
import { Bot, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ChatPane: React.FC = () => {
  const { messages, isTyping, sendUserMessage, pickQuestion, openInWorkspace, startCheckout, addToPantry } = useAssistant();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);
  const [sheetMeal, setSheetMeal] = useState<MealBase | null>(null);
  const [mobilePayload, setMobilePayload] = useState<AssistantPayload | null>(null);

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
    addToPantry(items);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">

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
                {m.payload.type === 'subscription_error' ? (
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => navigate('/pricing')}
                  >
                    {t("assistant.errors.upgradeSubscription")}
                  </Button>
                ) : (
                  <div 
                    onClick={() => {
                    if (isMobile) {
                      setMobilePayload(m.payload!);
                    } else {
                      openInWorkspace(m.payload!);
                    }
                  }}
                  className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors shadow-sm"
                >
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">
                      {m.payload.type === 'mealPlan' ? t("assistant.chat.typeMealPlan") : 
                       m.payload.type === 'specialMeal' ? t("assistant.chat.typeSpecialMeal") : 
                       m.payload.type === 'healthyDrink' ? t("assistant.chat.typeHealthyDrink") : 
                       m.payload.type === 'generatedMeals' ? 'Opciones Generadas' :
                       m.payload.type === 'cart' ? t("assistant.chat.typeCart") :
                       m.payload.type === 'pantry' ? t("assistant.chat.typePantry") :
                       'Resultado'}
                    </h4>
                    <p className="text-xs text-muted-foreground">{t("assistant.chat.clickDetails")}</p>
                  </div>
                </div>
                )}
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

      <Sheet open={!!mobilePayload} onOpenChange={(o) => !o && setMobilePayload(null)}>
        <SheetContent side="bottom" className="h-[100dvh] w-full overflow-y-auto rounded-none pt-12">
          {mobilePayload && (
            <PayloadRenderer
              payload={mobilePayload}
              onOpenMeal={handleOpenMeal}
              onAddToCart={handleAddToCart}
              onAddToPantry={handleAddToPantry}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ChatPane;
