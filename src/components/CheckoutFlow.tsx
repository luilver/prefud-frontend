import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CartItem } from "@/contexts/CartContext";
import { DeliveryMethodStep } from "@/components/checkout/DeliveryMethodStep";
import { StoreSelectionStep } from "@/components/checkout/StoreSelectionStep";
import { AddressStep } from "@/components/checkout/AddressStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { OrderSummaryStep } from "@/components/checkout/OrderSummaryStep";
import { OrderConfirmationStep } from "@/components/checkout/OrderConfirmationStep";

export type DeliveryMethod = 'pickup' | 'delivery';
export type Store = 'walmart' | 'target';

export interface CheckoutData {
  deliveryMethod: DeliveryMethod | null;
  store: Store | null;
  address: string | null;
  paymentMethod: any | null;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

interface CheckoutFlowProps {
  items: CartItem[];
  onClose: () => void;
  onOrderComplete: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  items,
  onClose,
  onOrderComplete
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    deliveryMethod: null,
    store: null,
    address: null,
    paymentMethod: null,
    subtotal: 0,
    deliveryFee: 0,
    serviceFee: 0,
    total: 0
  });

  const steps = [
    { id: 1, title: t('checkout.steps.deliveryMethod') },
    { id: 2, title: t('checkout.steps.storeSelection') },
    { id: 3, title: t('checkout.steps.address') },
    { id: 4, title: t('checkout.steps.payment') },
    { id: 5, title: t('checkout.steps.summary') },
    { id: 6, title: t('checkout.steps.confirmation') }
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...data }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DeliveryMethodStep
            data={checkoutData}
            onUpdate={updateCheckoutData}
            onNext={goToNextStep}
          />
        );
      case 2:
        return (
          <StoreSelectionStep
            data={checkoutData}
            onUpdate={updateCheckoutData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
          <AddressStep
            data={checkoutData}
            onUpdate={updateCheckoutData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 4:
        return (
          <PaymentStep
            data={checkoutData}
            onUpdate={updateCheckoutData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 5:
        return (
          <OrderSummaryStep
            items={items}
            data={checkoutData}
            onUpdate={updateCheckoutData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 6:
        return (
          <OrderConfirmationStep
            items={items}
            data={checkoutData}
            onComplete={onOrderComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {steps[currentStep - 1]?.title}
          </DialogTitle>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            {steps.slice(0, -1).map((step, index) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full ${
                  index + 1 <= currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};