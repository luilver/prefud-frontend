import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  createPaymentMethod,
  attachPaymentMethod,
  setDefaultPaymentMethod,
} from "@/services/payments";
import { authService } from "@/services/authService";
import { toast } from "@/hooks/use-toast";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY! ||
    "pk_test_51R1tN0QtxIPdrkdTWoyJxB3qmuoh8FVEpRSQFEfCkGQFScfq8TRzCZz4ZJbXxkvhjwTw3vEuyrCizyg1APYcQcrJ00YgxWKyQ5"
);

interface ChatPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

interface InnerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const InnerAddCardForm: React.FC<InnerFormProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user: authUser } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();

  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create token from card element
      const { token, error: tokenError } = await stripe.createToken(cardElement, {
        name: cardholderName.trim() || undefined,
      });

      if (tokenError) {
        setError(tokenError.message || "Failed to process card details");
        setIsProcessing(false);
        return;
      }

      if (!token?.id) {
        throw new Error("No token returned from Stripe");
      }

      // Determine customerId (ruku_client_id)
      let customerId =
        authUser?.profile?.ruku_client_id ||
        (user as any)?.customerId ||
        (user as any)?.rukuClientId ||
        "";

      // If missing from session, fetch user profile to retrieve it
      const userId = authUser?.userId || user?.id;
      if (!customerId && userId) {
        try {
          const profile = await authService.getProfile(userId);
          customerId = profile?.ruku_client_id || "";
        } catch (fetchErr) {
          console.warn("Could not retrieve customerId from profile:", fetchErr);
        }
      }

      // 2. Create payment method in Stripe backend
      const responsePaymentMethod = await createPaymentMethod(token.id);

      // 3. Attach and set default if customerId is present
      if (customerId && responsePaymentMethod?.id) {
        await attachPaymentMethod(responsePaymentMethod.id, customerId);
        await setDefaultPaymentMethod(responsePaymentMethod.id, customerId);
      }

      toast({
        title: t("assistant.order.paymentSuccessRetrying") || "Payment method added and set as default!",
        description: t("assistant.chat.orderInProcess") || "Resending order to chat...",
      });

      onSuccess();
    } catch (err: any) {
      console.error("Error adding card and setting as default:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to register payment method. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="cardholder-name" className="text-sm font-medium">
          {t("userProfile.cardholderName") || "Cardholder Name"}
        </Label>
        <Input
          id="cardholder-name"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          disabled={isProcessing}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">
          {t("assistant.order.cardDetails") || "Card Details"}
        </Label>
        <div className="p-3 border rounded-xl bg-card border-border shadow-inner">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "15px",
                  color: "#1a1a1a",
                  "::placeholder": { color: "#9ca3af" },
                },
                invalid: {
                  color: "#ef4444",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <Lock className="h-3.5 w-3.5 text-primary" />
        <span>{t("assistant.order.paymentSecured") || "Your payment is secured by Stripe"}</span>
      </div>

      <div className="flex gap-2.5 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isProcessing}
        >
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground font-semibold shadow-md"
          disabled={isProcessing || !stripe}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("assistant.order.savingCard") || "Saving Card..."}
            </>
          ) : (
            t("assistant.order.saveCardAndRetry") || "Save Card & Retry"
          )}
        </Button>
      </div>
    </form>
  );
};

export const ChatPaymentMethodModal: React.FC<ChatPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] max-w-[95vw] p-5 sm:p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="p-2 rounded-xl bg-primary/10">
              <CreditCard className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              {title || t("assistant.order.addCardTitle") || "Add Payment Method"}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <InnerAddCardForm onSuccess={onSuccess} onCancel={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPaymentMethodModal;

