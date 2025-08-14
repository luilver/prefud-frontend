
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Wine, Clock, Users, Zap, ShoppingCart, Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { updatePantry } from "@/services/pantryService";
import OrderOnlineModal from "./OrderOnlineModal";

interface AIDrinkViewProps {
  drink: any;
  onBack: () => void;
}

const AIDrinkView = ({ drink, onBack }: AIDrinkViewProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isAddingToPantry, setIsAddingToPantry] = useState(false);
  const { toast } = useToast();
  const { pantryItems, setPantryItems, user } = useUser();

  const handleIngredientSelect = (ingredientName: string, checked: boolean) => {
    if (checked) {
      setSelectedIngredients(prev => [...prev, ingredientName]);
    } else {
      setSelectedIngredients(prev => prev.filter(name => name !== ingredientName));
    }
  };

  const handleAddToPantry = async () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please select ingredients to add to pantry.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "User not found",
        description: "Please log in to add ingredients to your pantry.",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToPantry(true);

    try {
      const ingredientsToAdd = drink.ingredients.filter((ingredient: any) =>
        selectedIngredients.includes(ingredient.name)
      );

      // Create pantry items for local state
      const newPantryItems = ingredientsToAdd.map((ingredient: any) => ({
        id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: 'Drinks',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for drinks
        purchaseDate: new Date(),
        location: '',
        notes: `Added from AI drink: ${drink.name}`
      }));

      // Prepare ingredients for API call
      const apiIngredients = ingredientsToAdd.map((ingredient: any) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        classification: 'other',
        carbonFootPrintToWaste: 0.3, // Lower for drinks
        daysToExpire: 30,
        dayAdded: new Date().toISOString().split('T')[0]
      }));

      // Update pantry via API
      await updatePantry(user.id, apiIngredients);

      // Update local state
      setPantryItems([...pantryItems, ...newPantryItems]);

      toast({
        title: "Success!",
        description: `Added ${ingredientsToAdd.length} ingredients to your pantry.`
      });

      setSelectedIngredients([]);
    } catch (error) {
      console.error('Error adding ingredients to pantry:', error);
      toast({
        title: "Error",
        description: "Failed to add ingredients to pantry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingToPantry(false);
    }
  };

  const handleOrderOnline = () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please select ingredients to order online.",
        variant: "destructive"
      });
      return;
    }

    const itemsToOrder = drink.ingredients
      .filter((ingredient: any) => selectedIngredients.includes(ingredient.name))
      .map((ingredient: any) => ({
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        estimatedPrice: 1.99, // Default estimated price for drinks
        mealName: drink.name,
        notes: `From AI drink: ${drink.name}`
      }));

    setShowOrderModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 border-green-200';
      case 'medium': return 'text-yellow-600 border-yellow-200';
      case 'hard': return 'text-red-600 border-red-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getPreparationTimeColor = (time: string) => {
    const minutes = parseInt(time);
    if (minutes <= 5) return 'text-green-600';
    if (minutes <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Drinks</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Drink Image and Basic Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                <Wine className="h-24 w-24 text-blue-600" />
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{drink.name}</h1>
                <p className="text-gray-600 text-sm leading-relaxed">{drink.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="font-semibold">{drink.preparationTime || '5 min'}</p>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="font-semibold">{drink.servings || '1'}</p>
                </div>
                <div className="text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="font-semibold">{drink.calories || '120'}/serving</p>
                </div>
                <div className="text-center">
                  <Wine className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <Badge variant="outline" className={getDifficultyColor(drink.difficulty || 'Easy')}>
                    {drink.difficulty || 'Easy'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About This Drink</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">{drink.description}</p>
                  
                  {drink.healthBenefits && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Health Benefits</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {drink.healthBenefits.map((benefit: string, index: number) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {drink.tags && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {drink.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Ingredients ({drink.ingredients?.length || 0})</span>
                  </CardTitle>
                  <CardDescription>
                    Select ingredients to add to your pantry or order online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {drink.ingredients?.map((ingredient: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                        <Checkbox
                          id={`ingredient-${index}`}
                          checked={selectedIngredients.includes(ingredient.name)}
                          onCheckedChange={(checked) => handleIngredientSelect(ingredient.name, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{ingredient.name}</span>
                            <span className="text-sm text-gray-600">
                              {ingredient.quantity} {ingredient.unit}
                            </span>
                          </div>
                          {ingredient.notes && (
                            <p className="text-sm text-gray-500 mt-1">{ingredient.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAddToPantry}
                      disabled={selectedIngredients.length === 0 || isAddingToPantry}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                    >
                      <Package className="h-4 w-4" />
                      <span>
                        {isAddingToPantry ? 'Adding...' : `Add to Pantry (${selectedIngredients.length})`}
                      </span>
                    </Button>
                    <Button
                      onClick={handleOrderOnline}
                      disabled={selectedIngredients.length === 0}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Order Online ({selectedIngredients.length})</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {drink.instructions?.map((step: string, index: number) => (
                      <div key={index} className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nutritional Information & Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {drink.nutritionalInfo && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Nutrition per serving</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(drink.nutritionalInfo).map(([key, value]) => (
                          <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-semibold text-gray-800">{value as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {drink.healthBenefits && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Health Benefits</h4>
                      <div className="grid gap-3">
                        {drink.healthBenefits.map((benefit: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                            <Zap className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">{benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Online Modal */}
      <OrderOnlineModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        items={drink.ingredients
          ?.filter((ingredient: any) => selectedIngredients.includes(ingredient.name))
          ?.map((ingredient: any) => ({
            id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            estimatedPrice: 1.99,
            mealName: drink.name,
            notes: `From AI drink: ${drink.name}`
          })) || []
        }
        mealPlanName={`AI Drink: ${drink.name}`}
      />
    </div>
  );
};

export default AIDrinkView;
