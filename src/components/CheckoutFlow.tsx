import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { CartItem, useCart } from "@/contexts/CartContext";
import { DeliveryMethodStep } from "@/components/checkout/DeliveryMethodStep";
import { StoreSelectionStep } from "@/components/checkout/StoreSelectionStep";
import { AddressStep } from "@/components/checkout/AddressStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { OrderSummaryStep } from "@/components/checkout/OrderSummaryStep";
import { OrderConfirmationStep } from "@/components/checkout/OrderConfirmationStep";
import { quoteOrder, OrderQuote, UserAddress } from "@/services/addressService";

export type DeliveryMethod = 'pickup' | 'delivery';
export type Store = 'walmart' | 'target';

export interface CheckoutData {
  deliveryMethod: DeliveryMethod | null;
  store: Store | null;
  address: string | null;
  /** Full structured address object from the address step */
  selectedAddress: UserAddress | null;
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
  const { getDisplayQuantity, isUnitItem } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    deliveryMethod: null,
    store: null,
    address: null,
    selectedAddress: null,
    paymentMethod: null,
    subtotal: 0,
    deliveryFee: 0,
    serviceFee: 0,
    total: 0
  });

  // Quote state — populated when user advances from Payment → Summary
  const [quoteData, setQuoteData] = useState<OrderQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: t('checkout.steps.deliveryMethod') },
    { id: 2, title: t('checkout.steps.storeSelection') },
    { id: 3, title: t('checkout.steps.address') },
    { id: 4, title: t('checkout.steps.payment') },
    { id: 5, title: t('checkout.steps.summary') },
    { id: 6, title: t('checkout.steps.confirmation') }
  ];

  const updateCheckoutData = useCallback((data: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...data }));
  }, []);

  /**
   * Called when the user clicks Continue on the Payment step (step 4).
   * Fires the quote endpoint, then advances to the Order Summary step.
   */
  const handlePaymentNext = async () => {
    if (!checkoutData.store || !checkoutData.deliveryMethod) {
      setCurrentStep(5);
      return;
    }

    setIsQuoting(true);
    setQuoteError(null);

    try {
      // Build ingredients from cart items
      const ingredients = items.map((item) => ({
        name: item.name,
        quantity: isUnitItem(item.unit)
          ? item.quantity
          : (item.baseQuantity || 0) * item.quantity,
        unit: item.unit,
      }));

      /**
       * Build address block from the structured UserAddress selected in step 3.
       * Field mapping: UserAddress → StoreAddressDto / AddressDto
       *   line1        → address_line1
       *   line2        → address_line2
       *   city         → city
       *   state        → state
       *   zipcode      → zip_code
       *   country_code → country
       */
      const addr = checkoutData.selectedAddress;
      const addressBlock = addr
        ? {
            address_line1: addr.line1,
            address_line2: addr.line2 || '',
            city: addr.city,
            state: addr.state,
            zip_code: addr.zipcode,
            country: addr.country_code,
          }
        : undefined;

      const payload = {
        ingredients,
        retailer: checkoutData.store,
        fulfillmentType: checkoutData.deliveryMethod,
        shippingMethod: 'cheapest',
        // pickupStoreAddress is required by the DTO for pickup;
        // we also include it for delivery when an address is available
        // so the backend can resolve store proximity / delivery zone.
        ...(addressBlock && { pickupStoreAddress: addressBlock }),
      };

      const quote = await quoteOrder(payload);
      setQuoteData(quote);

      // Update checkout totals from the quote response
      const productCost = quote.productCostCents / 100;
      const total = quote.totalAmountCents / 100;
      const deliveryFee = total - productCost;

      updateCheckoutData({
        subtotal: productCost,
        deliveryFee: deliveryFee > 0 ? deliveryFee : 0,
        serviceFee: 0,
        total,
      });
    } catch (error: any) {
      console.error('Quote error:', error);
      setQuoteError(error?.response?.data?.message || 'Failed to get quote. Please try again.');
      // Still allow advancing even if quote fails — summary will show fallback
    } finally {
      setIsQuoting(false);
      setCurrentStep(5);
    }
  };

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
            onNext={handlePaymentNext}
            onBack={goToPreviousStep}
            isQuoting={isQuoting}
          />
        );
      case 5:
        return (
          <OrderSummaryStep
            items={items}
            data={checkoutData}
            quoteData={quoteData}
            quoteError={quoteError}
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
      <DialogContent className="max-w-md h-[90dvh] flex flex-col p-0">
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