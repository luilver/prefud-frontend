import React from "react";
import { Button } from "@/components/ui/button";
import { useAssistant } from "@/contexts/AssistantContext";
import { computeCartTotal } from "../widgets/CartSummaryWidget";
import ActionChips from "../ActionChips";
import CartSummaryWidget from "../widgets/CartSummaryWidget";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const AssistantCheckout: React.FC = () => {
  const { checkoutStep, checkoutCart, advanceCheckout, resetCheckout } = useAssistant();

  if (checkoutStep === "idle" || checkoutCart.length === 0) return null;
  const total = computeCartTotal(checkoutCart);

  return (
    <div className="border-t border-border bg-muted/40 p-3 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border/50">
        <span className="text-sm font-medium text-foreground">Tu Carrito</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={resetCheckout}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      <CartSummaryWidget items={checkoutCart} />

      {checkoutStep === "summary" && (
        <>
          <p className="text-xs text-muted-foreground">Selecciona una direccion de envio</p>
          <ActionChips
            chips={[{ ask: "Usar direccion guardada" }, { ask: "Nueva direccion" }]}
            onPick={() => advanceCheckout("payment")}
          />
        </>
      )}
      {checkoutStep === "address" && null}
      {checkoutStep === "payment" && (
        <>
          <p className="text-xs text-muted-foreground">Selecciona un metodo de pago</p>
          <ActionChips
            chips={[{ ask: "Apple Pay" }, { ask: "Tarjeta terminada en 4242" }]}
            onPick={() => advanceCheckout("confirm")}
          />
        </>
      )}
      {checkoutStep === "confirm" && (
        <Button
          onClick={() => {
            advanceCheckout("success");
            toast({ title: "Pago confirmado", description: `Total ${total.toFixed(2)} USD` });
            setTimeout(() => resetCheckout(), 2500);
          }}
          className="w-full h-12 text-base font-semibold text-white shadow-lg"
          style={{ backgroundColor: "hsl(0 65% 28%)" }}
        >
          Confirmar y Pagar ${total.toFixed(2)}
        </Button>
      )}
      {checkoutStep === "success" && (
        <div className="rounded-lg border border-primary bg-primary/10 p-3 text-sm text-foreground">
          Pedido confirmado. Recibiras un correo con el detalle.
        </div>
      )}
    </div>
  );
};

export default AssistantCheckout;
