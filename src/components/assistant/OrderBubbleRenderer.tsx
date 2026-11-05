import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/contexts/AssistantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChatOrder } from '@/types/assistant';
import { CheckCircle, AlertCircle, Clock, Package, CreditCard, MapPin } from 'lucide-react';
import ChatPaymentMethodModal from './ChatPaymentMethodModal';
import ChatAddressModal from './ChatAddressModal';

interface Props {
  order: ChatOrder;
  isLatest?: boolean;
}

const OrderBubbleRenderer: React.FC<Props> = ({ order, isLatest }) => {
  const { confirmPurchase, sendUserMessage, retryPurchase, proceedWithOrderAfterAddress } = useAssistant();
  const { t } = useLanguage();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [hasAutoOpenedAddress, setHasAutoOpenedAddress] = useState(false);

  const statusUpper = order.status.toUpperCase();

  const isNoAddress =
    order.errorCode === 'NO_ADDRESS' ||
    order.actionRequired === 'ADD_ADDRESS';

  const isNoDefaultPayment =
    order.errorCode === 'NO_DEFAULT_PAYMENT_METHOD' ||
    order.actionRequired === 'ADD_PAYMENT_METHOD';

  const isInsufficientFunds =
    order.errorCode === 'INSUFFICIENT_FUNDS' ||
    Boolean(order.insufficientFunds);

  const isCardDeclined =
    order.errorCode === 'CARD_DECLINED';

  const isPaymentRequired =
    Boolean(order.requiresPaymentMethod) ||
    isNoDefaultPayment ||
    isInsufficientFunds ||
    isCardDeclined ||
    order.actionRequired === 'PROVIDE_ANOTHER_PAYMENT_METHOD';

  useEffect(() => {
    if (isLatest && isPaymentRequired && !hasAutoOpened) {
      setShowPaymentModal(true);
      setHasAutoOpened(true);
    }
  }, [isLatest, isPaymentRequired, hasAutoOpened]);

  useEffect(() => {
    if (isLatest && isNoAddress && !hasAutoOpenedAddress) {
      setShowAddressModal(true);
      setHasAutoOpenedAddress(true);
    }
  }, [isLatest, isNoAddress, hasAutoOpenedAddress]);

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    retryPurchase(order.cart?.quoteId);
  };

  const handleAddressSuccess = () => {
    setShowAddressModal(false);
    proceedWithOrderAfterAddress(order.cart?.quoteId);
  };

  const getErrorMessage = () => {
    if (isNoAddress) {
      return t("assistant.order.noAddress");
    }
    if (isInsufficientFunds) {
      return t("assistant.order.insufficientFunds");
    }
    if (isCardDeclined) {
      return t("assistant.order.cardDeclined");
    }
    if (isNoDefaultPayment) {
      return t("assistant.order.noDefaultPayment");
    }
    return order.errorCode || t("assistant.order.genericError") || "An error occurred while processing your order.";
  };

  if (statusUpper === 'QUOTED' && order.cart) {
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

  if (['ORDER_STARTED', 'PENDING', 'PROCESSING', 'ORDER.STARTED', 'ORDER.TRACKING_RECEIVED'].includes(statusUpper)) {
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

  if (isPaymentRequired || isNoAddress || ['ORDER_NOT_STARTED', 'FAILED', 'ORDER.FAILED', 'CANCELLED'].includes(statusUpper)) {
    const paymentButtonText = isNoDefaultPayment
      ? (t("assistant.order.addPayment") || "Add Payment Method")
      : (t("assistant.order.addAnotherPayment") || "Provide Another Payment Method");

    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mt-2 space-y-3 shadow-sm w-full max-w-sm">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-semibold text-sm sm:text-base">{t("assistant.order.failed") || "Order Failed"}</h3>
        </div>
        
        <p className="text-sm leading-relaxed text-foreground/90">{getErrorMessage()}</p>
        
        {isPaymentRequired ? (
          <>
            <Button
              className="w-full mt-2 font-medium flex items-center justify-center gap-2 shadow-sm"
              onClick={() => setShowPaymentModal(true)}
            >
              <CreditCard className="w-4 h-4" />
              {paymentButtonText}
            </Button>
            <ChatPaymentMethodModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={handlePaymentSuccess}
              title={
                isNoDefaultPayment
                  ? (t("assistant.order.addCardTitle") || "Add Payment Method")
                  : (t("assistant.order.addAnotherPayment") || "Provide Another Payment Method")
              }
              description={getErrorMessage()}
            />
          </>
        ) : isNoAddress ? (
          <>
            <Button
              className="w-full mt-2 font-medium flex items-center justify-center gap-2 shadow-sm"
              onClick={() => setShowAddressModal(true)}
            >
              <MapPin className="w-4 h-4" />
              {t("assistant.order.addAddress") || "Add Delivery Address"}
            </Button>
            <ChatAddressModal
              isOpen={showAddressModal}
              onClose={() => setShowAddressModal(false)}
              onSuccess={handleAddressSuccess}
              title={t("assistant.order.addAddressTitle") || "Add Delivery Address"}
              description={t("assistant.order.noAddress") || "Please add a delivery address to complete your order."}
            />
          </>
        ) : null}
      </div>
    );
  }

  if (['SUCCESS', 'COMPLETED', 'PLACED', 'SHIPPED', 'DELIVERED', 'ORDER.PLACED', 'ORDER.SHIPPED', 'ORDER.DELIVERED'].includes(statusUpper)) {
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
