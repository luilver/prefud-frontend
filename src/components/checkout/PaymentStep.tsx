import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Plus, Loader2, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData } from "@/components/CheckoutFlow";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPaymentMethods,
  UserPaymentMethod,
  createPaymentMethod,
  attachPaymentMethod,
  setDefaultPaymentMethod,
} from "@/services/payments";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Label } from "@/components/ui/label";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY! ||
    "pk_test_51R1tN0QtxIPdrkdTWoyJxB3qmuoh8FVEpRSQFEfCkGQFScfq8TRzCZz4ZJbXxkvhjwTw3vEuyrCizyg1APYcQcrJ00YgxWKyQ5"
);

interface PaymentStepProps {
  data: CheckoutData;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  onBack: () => void;
  /** True while the parent is fetching the order quote */
  isQuoting?: boolean;
}

// Inner add-card form that uses Stripe hooks (must be inside <Elements>)
interface AddCardFormProps {
  customerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddCardForm: React.FC<AddCardFormProps> = ({ customerId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      // Create a Stripe token
      const { token, error: tokenError } = await stripe.createToken(cardElement);
      if (tokenError) {
        setError(tokenError.message || "Failed to tokenize card");
        setIsProcessing(false);
        return;
      }

      // Create payment method from token
      const responsePaymentMethod = await createPaymentMethod(token.id);

      // Attach payment method to customer
      await attachPaymentMethod(responsePaymentMethod.id, customerId);

      // Set as default
      await setDefaultPaymentMethod(responsePaymentMethod.id, customerId);

      onSuccess();
    } catch (err: any) {
      console.error("Error adding card:", err);
      setError(err?.response?.data?.message || "Failed to add card. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="p-3 border rounded-md bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#1a1a1a",
                  "::placeholder": { color: "#9ca3af" },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>Your payment is secured by Stripe</span>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isProcessing || !stripe}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Save Card"
          )}
        </Button>
      </div>
    </form>
  );
};

export const PaymentStep: React.FC<PaymentStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  isQuoting = false,
}) => {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();

  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  const customerId = authUser?.profile?.ruku_client_id || '';

  useEffect(() => {
    if (customerId) {
      fetchPaymentMethods();
    }
  }, [customerId]);

  const fetchPaymentMethods = async () => {
    setIsLoadingMethods(true);
    try {
      const methods = await getUserPaymentMethods(customerId);
      setPaymentMethods(methods);

      // Auto-select the default payment method or first one
      const defaultMethod = methods.find((m) => m.isDefault);
      if (defaultMethod) {
        setSelectedPayment(defaultMethod.id);
        onUpdate({ paymentMethod: defaultMethod });
      } else if (methods.length > 0) {
        setSelectedPayment(methods[0].id);
        onUpdate({ paymentMethod: methods[0] });
      }

      // If no payment methods, show add card form
      if (methods.length === 0) {
        setShowNewCardForm(true);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const handlePaymentSelect = (method: UserPaymentMethod) => {
    setSelectedPayment(method.id);
    onUpdate({ paymentMethod: method });
    setShowNewCardForm(false);
  };

  const handleCardAdded = async () => {
    setShowNewCardForm(false);
    await fetchPaymentMethods();
  };

  const handleContinue = () => {
    if (data.paymentMethod || selectedPayment) {
      onNext();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">
            {t('checkout.payment.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('checkout.payment.subtitle')}
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoadingMethods ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground text-sm">Loading payment methods...</span>
        </div>
      ) : !showNewCardForm ? (
        <>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className={`cursor-pointer transition-colors ${
                  selectedPayment === method.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handlePaymentSelect(method)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium capitalize">
                          {method.brand} •••• {method.last4}
                        </h3>
                        {method.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {t('checkout.payment.default')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('checkout.payment.expires')}{' '}
                        {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setShowNewCardForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('checkout.payment.addNew')}
            </Button>
          </div>

          <Button
            className="w-full h-12"
            onClick={handleContinue}
            disabled={(!selectedPayment && !data.paymentMethod) || isQuoting}
          >
            {isQuoting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting quote…
              </>
            ) : (
              t('common.continue')
            )}
          </Button>
        </>
      ) : (
        /* Add new card form using Stripe Elements — same component as subscription section */
        <div className="space-y-4">
          {paymentMethods.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Add a new payment method to your account.
            </p>
          )}

          {!customerId ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Unable to load payment form. Please try again.
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <AddCardForm
                customerId={customerId}
                onSuccess={handleCardAdded}
                onCancel={() => {
                  if (paymentMethods.length > 0) {
                    setShowNewCardForm(false);
                  }
                }}
              />
            </Elements>
          )}
        </div>
      )}
    </div>
  );
};