import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, AlertCircle, ShoppingCart, Package, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData } from "@/components/CheckoutFlow";
import { CartItem, useCart } from "@/contexts/CartContext";
import { OrderQuote } from "@/services/addressService";
import { useAuth } from "@/contexts/AuthContext";

interface OrderSummaryStepProps {
  items: CartItem[];
  data: CheckoutData;
  quoteData: OrderQuote | null;
  quoteError: string | null;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const OrderSummaryStep: React.FC<OrderSummaryStepProps> = ({
  items,
  data,
  quoteData,
  quoteError,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { t } = useLanguage();
  const { getDisplayQuantity } = useCart();
  const { user: authUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const productCost = quoteData ? quoteData.productCostCents / 100 : data.subtotal;
  const totalAmount = quoteData ? quoteData.totalAmountCents / 100 : data.total;
  const deliveryFee = quoteData
    ? Math.max(0, quoteData.totalAmountCents - quoteData.productCostCents) / 100
    : data.deliveryFee;

  const handleProcessPayment = async () => {
    if (!data.selectedAddress) {
      setError("Please select a shipping address first");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const itemsPayload = quoteData
        ? quoteData.items.map((item) => ({
            url: item.matchedProduct.product_id.startsWith('http')
              ? item.matchedProduct.product_id
              : `https://www.walmart.com/ip/${item.matchedProduct.product_id}`,
            quantity: Math.ceil(item.quantity)
          }))
        : items.map((item) => ({
            url: `https://www.walmart.com/ip/${item.id}`,
            quantity: Math.ceil(item.amount || 1)
          }));

      const payload = {
        userId: authUser?.userId || "64b9f1e2c3d4a5b6e7f8a9b1",
        max_price: Math.ceil(totalAmount),
        items: itemsPayload,
        shipping_address: {
          first_name: authUser?.profile?.name || "Kevin",
          last_name: authUser?.profile?.lastName || "Morales",
          address_line1: data.selectedAddress.line1,
          address_line2: data.selectedAddress.line2 || "apartment d423",
          city: data.selectedAddress.city,
          state: data.selectedAddress.state,
          postal_code: data.selectedAddress.zipcode,
          phone_number: authUser?.profile?.phone || "+13852250301",
          country: data.selectedAddress.country_code || "US"
        },
        metadata: {
          quote_id: quoteData?.quoteId || "0fe6cfc7-274c-4b38-887a-116ea811769c",
          retailer: quoteData?.retailer || data.store || "walmart",
          shipping_method: "cheapest",
          fulfillment_type: data.deliveryMethod || "delivery"
        }
      };

      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${BASE_URL}/api/v1/orders/checkout-simple`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        
        if (Array.isArray(errData.message)) {
          setErrorMessages(errData.message);
          setShowErrorModal(true);
          return;
        }
        
        throw new Error(errData.message || "Failed to process payment");
      }

      onNext();
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "An error occurred while processing payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{t('checkout.summary.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('checkout.summary.subtitle')}</p>
        </div>
      </div>

      {/* Quote or payment error banner */}
      {(quoteError || error) && (
        <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{quoteError || error}</p>
        </div>
      )}

      {/* Order items — show matched products if quote available, otherwise cart items */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <h3 className="font-medium">{t('checkout.summary.items')}</h3>
          </div>

          <div className="space-y-3">
            {quoteData && quoteData.items.length > 0 ? (
              quoteData.items.map((quoteItem, index) => (
                <div key={`${quoteItem.ingredient}-${index}`} className="flex items-center gap-3">
                  {/* Product image */}
                  {quoteItem.matchedProduct.image_url ? (
                    <img
                      src={quoteItem.matchedProduct.image_url}
                      alt={quoteItem.matchedProduct.title}
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0 border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2">
                      {quoteItem.matchedProduct.title}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {quoteItem.ingredient} · qty {quoteItem.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <span className="text-sm font-semibold flex-shrink-0">
                    {formatCents(quoteItem.matchedProduct.price * quoteItem.quantity)}
                  </span>
                </div>
              ))
            ) : (
              /* Fallback to cart items if no quote */
              items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {getDisplayQuantity(item)} {item.unit}
                    </span>
                  </div>
                  <span className="font-medium text-muted-foreground">—</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery / Pickup Details */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">
            {data.deliveryMethod === 'delivery'
              ? t('checkout.summary.delivery')
              : t('checkout.summary.pickup')}
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium capitalize">
              {quoteData?.retailer || (data.store === 'walmart' ? 'Walmart' : 'Target')}
            </p>
            <p className="text-muted-foreground">{data.address}</p>
            <p className="text-primary font-medium">
              {data.deliveryMethod === 'delivery'
                ? t('checkout.summary.deliveryTime')
                : t('checkout.summary.pickupTime')}
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
              <p className="font-medium capitalize">
                {data.paymentMethod?.brand} •••• {data.paymentMethod?.last4}
              </p>
              <p className="text-muted-foreground">
                {t('checkout.payment.expires')}{' '}
                {data.paymentMethod?.exp_month?.toString().padStart(2, '0')}/
                {data.paymentMethod?.exp_year}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Totals */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('checkout.summary.subtotal')}</span>
              <span className="font-medium">{formatPrice(productCost)}</span>
            </div>

            {/* Delivery fee */}
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('checkout.summary.deliveryFee')}</span>
                <span className="font-medium">{formatPrice(deliveryFee)}</span>
              </div>
            )}

            {/* Service fee (pickup) */}
            {data.serviceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('checkout.summary.serviceFee')}</span>
                <span className="font-medium">{formatPrice(data.serviceFee)}</span>
              </div>
            )}

            <Separator />

            {/* Total */}
            <div className="flex justify-between font-semibold text-base">
              <span>{t('checkout.summary.total')}</span>
              <span className="text-primary">{formatPrice(totalAmount)}</span>
            </div>

            {/* Quote expiry notice */}
            {quoteData?.expiresAt && (
              <p className="text-xs text-muted-foreground pt-1">
                Quote valid until{' '}
                {new Date(quoteData.expiresAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Place Order */}
      <Button className="w-full h-12" onClick={handleProcessPayment} disabled={isProcessing}>
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        {t('checkout.summary.processPayment')} {formatPrice(totalAmount)}
      </Button>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Validation Error
            </DialogTitle>
            <DialogDescription>
              Please correct the following issues before continuing:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {errorMessages.map((msg, index) => (
              <div key={index} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {msg}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowErrorModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};