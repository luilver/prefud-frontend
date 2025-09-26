import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Store } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData, DeliveryMethod } from "@/components/CheckoutFlow";

interface DeliveryMethodStepProps {
  data: CheckoutData;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
}

export const DeliveryMethodStep: React.FC<DeliveryMethodStepProps> = ({
  data,
  onUpdate,
  onNext
}) => {
  const { t } = useLanguage();

  const handleMethodSelect = (method: DeliveryMethod) => {
    onUpdate({ deliveryMethod: method });
  };

  const handleContinue = () => {
    if (data.deliveryMethod) {
      onNext();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">
          {t('checkout.deliveryMethod.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('checkout.deliveryMethod.subtitle')}
        </p>
      </div>

      <div className="space-y-3">
        <Card 
          className={`cursor-pointer transition-colors ${
            data.deliveryMethod === 'delivery' 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:bg-muted/50'
          }`}
          onClick={() => handleMethodSelect('delivery')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">
                  {t('checkout.deliveryMethod.delivery.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('checkout.deliveryMethod.delivery.description')}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  {t('checkout.deliveryMethod.delivery.fee')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            data.deliveryMethod === 'pickup' 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:bg-muted/50'
          }`}
          onClick={() => handleMethodSelect('pickup')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">
                  {t('checkout.deliveryMethod.pickup.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('checkout.deliveryMethod.pickup.description')}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  {t('checkout.deliveryMethod.pickup.fee')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        className="w-full h-12" 
        onClick={handleContinue}
        disabled={!data.deliveryMethod}
      >
        {t('common.continue')}
      </Button>
    </div>
  );
};