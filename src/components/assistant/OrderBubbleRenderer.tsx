import React from 'react';
import { useAssistant } from '@/contexts/AssistantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatOrder } from '@/types/assistant';
import { CheckCircle, AlertCircle, Clock, Package } from 'lucide-react';

interface Props {
  order: ChatOrder;
}

const OrderBubbleRenderer: React.FC<Props> = ({ order }) => {
  const { confirmPurchase, sendUserMessage } = useAssistant();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (order.status === 'QUOTED' && order.cart) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 mt-2 space-y-4 shadow-sm w-full max-w-sm">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          {t("assistant.order.quoteTitle") || "Order Summary"}
        </h3>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
          {order.cart.items.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productTitle} className="w-12 h-12 rounded-md object-cover bg-muted" />
              ) : (
                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productTitle}</p>
                <p className="text-sm text-primary font-semibold">${(item.lineTotalCents / 100).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border">
          <span className="font-medium">{t("assistant.order.total") || "Total"}</span>
          <span className="font-bold text-lg">${(order.cart.totalAmountCents / 100).toFixed(2)}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1" 
            onClick={() => confirmPurchase(order.cart!.quoteId)}
          >
            {t("assistant.order.confirmPurchase") || "Confirm Purchase"}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              sendUserMessage("Cancel my order");
            }}
          >
            {t("assistant.order.cancel") || "Cancel"}
          </Button>
        </div>
      </div>
    );
  }

  if (order.status === 'ORDER_STARTED' || order.status === 'PENDING') {
    return (
      <div className="bg-card border border-border rounded-xl p-4 mt-2 space-y-4 shadow-sm w-full max-w-sm">
        <div className="flex items-center gap-3 text-primary">
          <Clock className="w-6 h-6 animate-pulse" />
          <h3 className="font-semibold text-lg">{t("assistant.order.processing") || "Order Processing"}</h3>
        </div>
        
        {order.steps && order.steps.length > 0 && (
          <div className="space-y-4 pt-2 border-l-2 border-primary/20 ml-3 pl-4 relative">
            {order.steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary" />
                <h4 className="font-medium text-sm">{step.title}</h4>
                {step.description && <p className="text-xs text-muted-foreground mt-1">{step.description}</p>}
                <p className="text-xs text-primary font-medium mt-1 uppercase tracking-wider">{step.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (order.status === 'ORDER_NOT_STARTED' || order.status === 'FAILED') {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mt-2 space-y-3 shadow-sm w-full max-w-sm">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold">{t("assistant.order.failed") || "Order Failed"}</h3>
        </div>
        
        <p className="text-sm">{order.errorCode || t("assistant.order.genericError") || "An error occurred while processing your order."}</p>
        
        {order.errorCode === 'NO_ADDRESS' && (
          <Button className="w-full mt-2" onClick={() => navigate('/profile')}>
            {t("assistant.order.addAddress") || "Add Delivery Address"}
          </Button>
        )}
        
        {order.errorCode === 'NO_DEFAULT_PAYMENT_METHOD' && (
          <Button className="w-full mt-2" onClick={() => navigate('/profile')}>
            {t("assistant.order.addPayment") || "Add Payment Method"}
          </Button>
        )}
      </div>
    );
  }

  if (order.status === 'SUCCESS' || order.status === 'COMPLETED') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mt-2 space-y-3 shadow-sm w-full max-w-sm">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
          <CheckCircle className="w-5 h-5" />
          <h3 className="font-semibold">{t("assistant.order.success") || "Order Completed"}</h3>
        </div>
        <p className="text-sm">{t("assistant.order.successDesc") || "Your groceries will be delivered soon!"}</p>
      </div>
    );
  }

  return null;
};

export default OrderBubbleRenderer;
