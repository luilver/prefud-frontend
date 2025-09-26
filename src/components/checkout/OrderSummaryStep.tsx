import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData } from "@/components/CheckoutFlow";
import { CartItem, useCart } from "@/contexts/CartContext";

interface OrderSummaryStepProps {
  items: CartItem[];
  data: CheckoutData;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const OrderSummaryStep: React.FC<OrderSummaryStepProps> = ({
  items,
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const { t } = useLanguage();
  const { getDisplayQuantity } = useCart();

  useEffect(() => {
    // Calculate costs
    const subtotal = items.reduce((total, item) => {
      // Mock pricing - in real app, this would come from a pricing service
      const basePrice = 2.50; // Base price per item
      return total + (basePrice * item.quantity);
    }, 0);

    const deliveryFee = data.deliveryMethod === 'delivery' ? 4.99 : 0;
    const serviceFee = data.deliveryMethod === 'pickup' ? 1.99 : 0;
    const total = subtotal + deliveryFee + serviceFee;

    onUpdate({
      subtotal,
      deliveryFee,
      serviceFee,
      total
    });
  }, [items, data.deliveryMethod, onUpdate]);

  const handleProcessPayment = () => {
    // In a real app, this would process the payment
    onNext();
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

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
            {t('checkout.summary.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('checkout.summary.subtitle')}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">{t('checkout.summary.items')}</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground ml-2">
                    {getDisplayQuantity(item)} {item.unit}
                  </span>
                </div>
                <span className="font-medium">
                  {formatPrice(2.50 * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery/Pickup Details */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">
            {data.deliveryMethod === 'delivery' 
              ? t('checkout.summary.delivery')
              : t('checkout.summary.pickup')
            }
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{data.store === 'walmart' ? 'Walmart' : 'Target'}</p>
            <p className="text-muted-foreground">{data.address}</p>
            <p className="text-primary font-medium">
              {data.deliveryMethod === 'delivery' 
                ? t('checkout.summary.deliveryTime')
                : t('checkout.summary.pickupTime')
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">{t('checkout.summary.payment')}</h3>
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">
                {data.paymentMethod?.brand} •••• {data.paymentMethod?.last4}
              </p>
              <p className="text-muted-foreground">
                {t('checkout.payment.expires')} {data.paymentMethod?.expiry}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Total */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('checkout.summary.subtotal')}</span>
              <span>{formatPrice(data.subtotal)}</span>
            </div>
            {data.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('checkout.summary.deliveryFee')}</span>
                <span>{formatPrice(data.deliveryFee)}</span>
              </div>
            )}
            {data.serviceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('checkout.summary.serviceFee')}</span>
                <span>{formatPrice(data.serviceFee)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{t('checkout.summary.total')}</span>
              <span>{formatPrice(data.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        className="w-full h-12" 
        onClick={handleProcessPayment}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {t('checkout.summary.processPayment')} {formatPrice(data.total)}
      </Button>
    </div>
  );
};