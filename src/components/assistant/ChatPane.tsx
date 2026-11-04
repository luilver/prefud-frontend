import React, { useEffect, useRef, useState } from "react";
import { useAssistant } from "@/contexts/AssistantContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MessageBubble from "./MessageBubble";
import ActionChips from "./ActionChips";
import ChatComposer from "./ChatComposer";
import PayloadRenderer from "./PayloadRenderer";
import AssistantCheckout from "./checkout/AssistantCheckout";
import OrderBubbleRenderer from "./OrderBubbleRenderer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import RecipeDetail from "./widgets/RecipeDetail";
import type { MealBase, IngredientListItem, AssistantPayload, SourceLink } from "@/types/assistant";
import { toast } from "@/hooks/use-toast";
import { Bot, FileText, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const ChatPane: React.FC = () => {
  const { messages, isTyping, sendUserMessage, pickQuestion, openInWorkspace, startCheckout, addToPantry } = useAssistant();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);
  const [sheetMeal, setSheetMeal] = useState<MealBase | null>(null);
  const [mobilePayload, setMobilePayload] = useState<AssistantPayload | null>(null);
  const [sourceLinks, setSourceLinks] = useState<SourceLink[] | null>(null);

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

  const { addItem } = useCart();

  const handleOpenMeal = (meal: MealBase) => {
    if (isMobile) setSheetMeal(meal);
    else openInWorkspace({ type: "specialMeal", data: {
      totalCarbonFootprint: meal.carbonFootprint,
      specialMeal: { specialMeal: meal },
      ingredientsList: (meal.ingredientsList ?? []) as IngredientListItem[],
    } });
  };

  const handleAddToCart = (items: IngredientListItem[]) => {
    items.forEach(item => {
      addItem({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.classification || "General"
      });
    });
    startCheckout(items);
    toast({ title: t("assistant.chat.addedToCart") || "Added to App Cart", description: `${items.length} ${t("assistant.chat.ingredients") || "items"} added` });
  };
  const handleAddToPantry = (items: IngredientListItem[]) => {
    addToPantry(items);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, idx) => (
          <div key={m.id} className="space-y-2">
            {m.text && (
              <MessageBubble role={m.role}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </MessageBubble>
            )}
            {m.order && (
              <div className={m.role === "ai" ? "pl-9 pr-2" : "pr-9 pl-2 flex justify-end"}>
                <OrderBubbleRenderer order={m.order} isLatest={idx === messages.length - 1} />
              </div>
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
            {m.links && m.links.length > 0 && (
              <div className="pl-9 pr-2 pt-1 flex gap-2">
                <Button 
                  variant="default"
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs h-7 px-3 shadow-sm" 
                  onClick={() => setSourceLinks(m.links!)}
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  Source
                </Button>
              </div>
            )}
            {m.role === "ai" && m.questions && m.questions.filter((q) => !q.ask.startsWith("__")).length > 0 && (
              <div className="pl-9 pr-2 mt-1 space-y-2">
                <p className="text-xs font-medium text-muted-foreground ml-1">{t("assistant.chat.questionsForYou")}</p>
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
        <SheetContent side="bottom" className="h-[90dvh] w-full overflow-y-auto rounded-t-2xl pt-12">
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

      <Sheet open={!!sourceLinks} onOpenChange={(o) => !o && setSourceLinks(null)}>
        <SheetContent side="bottom" className="h-[75dvh] w-full overflow-y-auto rounded-t-2xl pt-6">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Sources</h2>
            <div className="flex flex-col gap-4">
              {sourceLinks?.map((link, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-2">
                  <h3 className="font-semibold text-lg">{link.source}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="self-start mt-2 border-primary/20 hover:bg-primary/5" 
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Visit Source
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ChatPane;
