import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { CheckoutFlow } from "@/components/CheckoutFlow";
import cartHero from "@/assets/cart-hero.jpg";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, getDisplayQuantity, isUnitItem } = useCart();
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

  const getUniqueItemsCount = () => items.length;

  return (
    <div className="min-h-screen bg-background lg:flex lg:h-screen lg:overflow-hidden">
      {/* Desktop hero image */}
      <div className="hidden lg:block lg:w-[60%] lg:h-full lg:relative">
        <img
          src={cartHero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </div>

      {/* Cart panel */}
      <div className="w-full lg:w-[40%] lg:h-full lg:overflow-y-auto lg:flex lg:flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b lg:static lg:z-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="mr-3 h-10 w-10 p-0"
                aria-label={t('common.back')}
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
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:bg-destructive/10 h-10 w-10 p-0"
                aria-label={t('cart.clearAll')}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4 lg:flex-1">
          {items.length === 0 ? (
            /* Empty Cart State */
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
          ) : (
            <>
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

                          {/* Controls */}
                          <div className="flex flex-col items-end gap-2 ml-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-muted rounded-full">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0 rounded-full hover:bg-background"
                                aria-label={t('cart.decrease')}
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
                                aria-label={t('cart.increase')}
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
                              aria-label={t('cart.remove')}
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

              {/* Mobile inline checkout */}
              <div className="pt-4 lg:hidden">
                <Button
                  className="w-full h-12"
                  onClick={() => setShowCheckout(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('cart.checkout.proceedToCheckout')}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile floating checkout button */}
        {items.length > 0 && (
          <div className="fixed z-50 lg:hidden" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))', left: '1rem' }}>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => setShowCheckout(true)}
              aria-label={t('cart.checkout.proceedToCheckout')}
            >
              <CreditCard className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Desktop sticky checkout bar */}
        {items.length > 0 && (
          <div className="hidden lg:block sticky bottom-0 bg-background/95 backdrop-blur border-t p-4">
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
        )}
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
