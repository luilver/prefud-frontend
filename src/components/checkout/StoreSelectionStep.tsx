import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Store } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData, Store as StoreType } from "@/components/CheckoutFlow";

interface StoreSelectionStepProps {
  data: CheckoutData;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const stores = [
  {
    id: 'walmart' as StoreType,
    name: 'Walmart',
    description: 'Great everyday prices',
    logo: '🏪'
  },
  {
    id: 'target' as StoreType,
    name: 'Target',
    description: 'Expect more, pay less',
    logo: '🎯'
  }
];

export const StoreSelectionStep: React.FC<StoreSelectionStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const { t } = useLanguage();

  const handleStoreSelect = (store: StoreType) => {
    onUpdate({ store });
  };

  const handleContinue = () => {
    if (data.store) {
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
            {t('checkout.storeSelection.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('checkout.storeSelection.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {stores.map((store) => (
          <Card 
            key={store.id}
            className={`cursor-pointer transition-colors ${
              data.store === store.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleStoreSelect(store.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {store.logo}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">
                    {store.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {store.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        className="w-full h-12" 
        onClick={handleContinue}
        disabled={!data.store}
      >
        {t('common.continue')}
      </Button>
    </div>
  );
};