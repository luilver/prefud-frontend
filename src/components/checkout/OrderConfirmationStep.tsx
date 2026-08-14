import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin, Receipt, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData } from "@/components/CheckoutFlow";
import { CartItem } from "@/contexts/CartContext";
import { useOrderSocket } from "@/hooks/useOrderSocket";

interface OrderConfirmationStepProps {
  items: CartItem[];
  data: CheckoutData;
  onComplete: () => void;
}

export const OrderConfirmationStep: React.FC<OrderConfirmationStepProps> = ({
  items,
  data,
  onComplete
}) => {
  const { t } = useLanguage();
  
  // Connect to websocket using the orderId we saved in CheckoutData
  const realtimeStatuses = useOrderSocket(data.orderId ? [data.orderId] : []);
  const currentStatus = (data.orderId ? realtimeStatuses[data.orderId] : null) || 'PENDING';

  
  // Generate a mock order number
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  
  // Mock estimated delivery/pickup time
  const estimatedTime = data.deliveryMethod === 'delivery' 
    ? new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    : new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <div className="p-6 space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        {currentStatus === 'PENDING' || currentStatus === 'PROCESSING' ? (
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : currentStatus === 'FAILED' || currentStatus === 'CANCELLED' ? (
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        ) : (
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        )}
        
        <div>
          <h2 className={`text-xl font-semibold ${
            currentStatus === 'FAILED' ? 'text-red-600' : 
            currentStatus === 'PENDING' ? 'text-blue-600' : 'text-green-600'
          }`}>
            {currentStatus === 'FAILED' ? 'Order Failed' :
             currentStatus === 'PENDING' || currentStatus === 'PROCESSING' ? 'Processing Order...' :
             t('checkout.confirmation.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {currentStatus === 'FAILED' ? 'There was an issue processing your order with the retailer.' :
             currentStatus === 'PENDING' || currentStatus === 'PROCESSING' ? 'Please wait while we confirm your order with the retailer.' :
             t('checkout.confirmation.subtitle')}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-medium">Order Status</h3>
            <span className="font-mono bg-secondary px-2 py-1 rounded text-sm">{currentStatus}</span>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t('checkout.confirmation.orderNumber')}</h3>
            <span className="font-mono text-primary">{orderNumber}</span>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {data.deliveryMethod === 'delivery' 
                  ? t('checkout.confirmation.estimatedDelivery')
                  : t('checkout.confirmation.estimatedPickup')
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {t('checkout.confirmation.today')} {formatTime(estimatedTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {data.deliveryMethod === 'delivery' 
                  ? t('checkout.confirmation.deliveryAddress')
                  : t('checkout.confirmation.pickupLocation')
                }
              </p>
              <p className="text-sm text-muted-foreground">{data.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t('checkout.confirmation.total')}</p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(data.total)} • {items.length} {t('checkout.confirmation.items')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">{t('checkout.confirmation.nextSteps')}</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• {t('checkout.confirmation.step1')}</p>
            <p>• {t('checkout.confirmation.step2')}</p>
            <p>• {t('checkout.confirmation.step3')}</p>
          </div>
        </CardContent>
      </Card>

      <Button 
        className="w-full h-12" 
        onClick={onComplete}
      >
        {t('checkout.confirmation.done')}
      </Button>
    </div>
  );
};