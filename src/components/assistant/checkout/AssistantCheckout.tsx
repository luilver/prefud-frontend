import React from "react";
import { Button } from "@/components/ui/button";
import { useAssistant } from "@/contexts/AssistantContext";
import { computeCartTotal } from "../widgets/CartSummaryWidget";
import ActionChips from "../ActionChips";
import CartSummaryWidget from "../widgets/CartSummaryWidget";
import { toast } from "@/hooks/use-toast";

const AssistantCheckout: React.FC = () => {
  const { checkoutStep, checkoutCart, advanceCheckout, resetCheckout } = useAssistant();

  if (checkoutStep === "idle" || checkoutCart.length === 0) return null;
  const total = computeCartTotal(checkoutCart);

  return (
    <div className="border-t border-border bg-muted/40 p-3 space-y-3">
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
