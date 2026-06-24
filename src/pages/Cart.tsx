import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { CheckoutFlow } from "@/components/CheckoutFlow";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getDisplayQuantity, isUnitItem } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Get unique items count (count each item as 1 regardless of quantity)
  const getUniqueItemsCount = () => items.length;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="px-4 py-6">
          {/* Mobile Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="mr-3 h-10 w-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">
              {t('cart.title')}
            </h1>
          </div>

          {/* Empty Cart State */}
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">
              {t('cart.empty.title')}
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              {t('cart.empty.description')}
            </p>
            <Button
              onClick={handleBackToDashboard}
              className="w-full max-w-xs"
            >
              {t('cart.empty.backButton')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="mr-3 h-10 w-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                {t('cart.title')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {getUniqueItemsCount()} {t('cart.items')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:bg-destructive/10 h-10 w-10 p-0"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Cart Content */}
      <div className="px-4 py-4 space-y-4">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {category}
              </h2>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground">
                {categoryItems.length}
              </span>
            </div>

            {/* Category Items */}
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div key={item.id} className="bg-card rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-primary">
                            {getDisplayQuantity(item)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.unit}
                          </span>
                        </div>
                        {!isUnitItem(item.unit) && (
                          <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {item.quantity}x
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('cart.addedAt')}: {item.addedAt.toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Mobile-Optimized Controls */}
                    <div className="flex flex-col items-end gap-2 ml-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-muted rounded-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-background"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium text-sm min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-background"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0 rounded-full"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Proceed to Checkout */}
        <div className="pt-4">
          <Button
            className="w-full h-12"
            onClick={() => setShowCheckout(true)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {t('cart.checkout.proceedToCheckout')}
          </Button>
        </div>
      </div>

      {/* Floating Checkout Button */}
      <div className="fixed z-50" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))', left: '1rem' }}>
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setShowCheckout(true)}
        >
          <CreditCard className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden lg:block fixed inset-x-0 bottom-0 bg-background/95 backdrop-blur border-t p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {getUniqueItemsCount()} {t('cart.items')} {t('cart.inCart')}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearCart}>
                {t('cart.clearAll')}
              </Button>
              <Button size="lg" className="px-8" onClick={() => setShowCheckout(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                {t('cart.checkout.proceedToCheckout')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Flow */}
      {showCheckout && (
        <CheckoutFlow
          items={items}
          onClose={() => setShowCheckout(false)}
          onOrderComplete={() => {
            clearCart();
            setShowCheckout(false);
          }}
        />
      )}
    </div>
  );
};

export default Cart;