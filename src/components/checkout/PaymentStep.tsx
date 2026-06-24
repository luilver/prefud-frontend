import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData } from "@/components/CheckoutFlow";

interface PaymentStepProps {
  data: CheckoutData;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const { t } = useLanguage();
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Mock saved payment methods
  const savedPayments = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      last4: '8888',
      brand: 'Mastercard',
      expiry: '06/24',
      isDefault: false
    }
  ];

  const handlePaymentSelect = (paymentMethod: any) => {
    setSelectedPayment(paymentMethod.id);
    onUpdate({ paymentMethod });
    setShowNewCardForm(false);
  };

  const handleNewCardSubmit = () => {
    const paymentMethod = {
      id: 'new',
      type: 'card',
      last4: newCard.number.slice(-4),
      brand: 'New Card',
      expiry: newCard.expiry,
      isDefault: false
    };
    setSelectedPayment('new');
    onUpdate({ paymentMethod });
    setShowNewCardForm(false);
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

      {!showNewCardForm ? (
        <>
          <div className="space-y-3">
            {savedPayments.map((payment) => (
              <Card 
                key={payment.id}
                className={`cursor-pointer transition-colors ${
                  selectedPayment === payment.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handlePaymentSelect(payment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {payment.brand} •••• {payment.last4}
                        </h3>
                        {payment.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {t('checkout.payment.default')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('checkout.payment.expires')} {payment.expiry}
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
            disabled={!selectedPayment}
          >
            {t('common.continue')}
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardName">{t('checkout.payment.form.name')}</Label>
              <Input
                id="cardName"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">{t('checkout.payment.form.number')}</Label>
              <Input
                id="cardNumber"
                value={newCard.number}
                onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expiry">{t('checkout.payment.form.expiry')}</Label>
                <Input
                  id="expiry"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">{t('checkout.payment.form.cvv')}</Label>
                <Input
                  id="cvv"
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowNewCardForm(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleNewCardSubmit}
              disabled={!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name}
            >
              {t('checkout.payment.form.save')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};