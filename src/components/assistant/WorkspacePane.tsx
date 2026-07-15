import React from "react";
import { useAssistant } from "@/contexts/AssistantContext";
import PayloadRenderer from "./PayloadRenderer";
import { Sparkles } from "lucide-react";
import type { IngredientListItem, MealBase } from "@/types/assistant";
import { toast } from "@/hooks/use-toast";

const WorkspacePane: React.FC = () => {
  const { workspacePayload, openInWorkspace, startCheckout } = useAssistant();

  if (!workspacePayload) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">Espacio de trabajo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona un elemento del chat para verlo aqui: planes de comida, recetas, bebidas o despensa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <button
        onClick={() => openInWorkspace(null)}
        className="text-xs text-muted-foreground hover:text-foreground mb-3"
      >
        Cerrar
      </button>
      <PayloadRenderer
        payload={workspacePayload}
        onOpenMeal={(meal: MealBase) =>
          openInWorkspace({
            type: "specialMeal",
            data: {
              totalCarbonFootprint: meal.carbonFootprint,
              specialMeal: { specialMeal: meal },
              ingredientsList: (meal.ingredientsList ?? []) as IngredientListItem[],
            },
          })
        }
        onAddToCart={(items) => startCheckout(items)}
        onAddToPantry={(items) =>
          toast({ title: "Anadido a despensa", description: `${items.length} ingredientes` })
        }
      />
    </div>
  );
};

export default WorkspacePane;
