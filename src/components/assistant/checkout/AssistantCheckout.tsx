import React from "react";
import { Button } from "@/components/ui/button";
import { useAssistant } from "@/contexts/AssistantContext";
import { computeCartTotal } from "../widgets/CartSummaryWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import ActionChips from "../ActionChips";
import CartSummaryWidget from "../widgets/CartSummaryWidget";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const AssistantCheckout: React.FC = () => {
  const { checkoutStep, checkoutCart, advanceCheckout, resetCheckout } = useAssistant();
  const { t } = useLanguage();

  if (checkoutStep === "idle" || checkoutCart.length === 0) return null;
  const total = computeCartTotal(checkoutCart);

  return (
    <div className="border-t border-border bg-muted/40 p-3 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border/50">
        <span className="text-sm font-medium text-foreground">{t("assistant.checkout.yourCart")}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={resetCheckout}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      <CartSummaryWidget items={checkoutCart} />

      {checkoutStep === "summary" && (
        <>
          <p className="text-xs text-muted-foreground">{t("assistant.checkout.selectAddress")}</p>
          <ActionChips
            chips={[{ ask: t("assistant.checkout.savedAddress") }, { ask: t("assistant.checkout.newAddress") }]}
            onPick={() => advanceCheckout("payment")}
          />
        </>
      )}
      {checkoutStep === "address" && null}
      {checkoutStep === "payment" && (
        <>
          <p className="text-xs text-muted-foreground">{t("assistant.checkout.selectPayment")}</p>
          <ActionChips
            chips={[{ ask: t("assistant.checkout.applePay") }, { ask: t("assistant.checkout.cardEnding") }]}
            onPick={() => advanceCheckout("confirm")}
          />
        </>
      )}
      {checkoutStep === "confirm" && (
        <Button
          onClick={() => {
            advanceCheckout("success");
            toast({ title: t("assistant.checkout.paymentConfirmed"), description: `Total ${total.toFixed(2)} USD` });
            setTimeout(() => resetCheckout(), 2500);
          }}
          className="w-full h-12 text-base font-semibold text-white shadow-lg"
          style={{ backgroundColor: "hsl(0 65% 28%)" }}
        >
          {t("assistant.checkout.confirmAndPay")} ${total.toFixed(2)}
        </Button>
      )}
      {checkoutStep === "success" && (
        <div className="rounded-lg border border-primary bg-primary/10 p-3 text-sm text-foreground">
          {t("assistant.checkout.orderConfirmed")}
        </div>
      )}
    </div>
  );
};

export default AssistantCheckout;
