import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getDisplayQuantity, isUnitItem } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-orange-25/60 to-green-75/40 p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="text-green-700 hover:bg-green-100/60"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
              <h1 className="text-2xl font-bold text-green-800">
                {t('cart.title')}
              </h1>
            </div>
          </div>

          {/* Empty Cart State */}
          <Card className="bg-white/70 backdrop-blur-sm border-green-200/50 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {t('cart.empty.title')}
              </h2>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {t('cart.empty.description')}
              </p>
              <Button
                onClick={handleBackToDashboard}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {t('cart.empty.backButton')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-orange-25/60 to-green-75/40 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="text-green-700 hover:bg-green-100/60"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <h1 className="text-2xl font-bold text-green-800">
              {t('cart.title')} ({getUniqueItemsCount()} {t('cart.items')})
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('cart.clearAll')}
          </Button>
        </div>

        {/* Cart Items by Category */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <Card key={category} className="bg-white/70 backdrop-blur-sm border-green-200/50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  {category}
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-green-100">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-green-700">{getDisplayQuantity(item)}</span>
                            <span className="text-sm text-gray-600">{item.unit}</span>
                          </div>
                          {!isUnitItem(item.unit) && (
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              {item.quantity}x
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {t('cart.addedAt')}: {item.addedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 bg-green-50 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0 hover:bg-green-100"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-green-800 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0 hover:bg-green-100"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Actions */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200/50 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-green-800">
              {t('cart.actions.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                onClick={() => {
                  // TODO: Implement add to shopping list functionality
                  console.log('Add to shopping list:', items);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('cart.actions.addToShoppingList')}
              </Button>
              <Button
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 flex-1"
                onClick={() => {
                  // TODO: Implement add to pantry functionality
                  console.log('Add to pantry:', items);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('cart.actions.addToPantry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cart;