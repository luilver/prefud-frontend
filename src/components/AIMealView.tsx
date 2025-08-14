import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Users, ChefHat, Flame, ShoppingCart, Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { updatePantry } from "@/services/pantryService";
import OrderOnlineModal from "./OrderOnlineModal";

interface AIMealViewProps {
  meal: any;
  onBack: () => void;
}

const AIMealView = ({ meal, onBack }: AIMealViewProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isAddingToPantry, setIsAddingToPantry] = useState(false);
  const { toast } = useToast();
  const { pantryItems, setPantryItems, user } = useUser();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 border-green-200';
      case 'medium': return 'text-yellow-600 border-yellow-200';
      case 'hard': return 'text-red-600 border-red-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getCookingTimeColor = (time: string) => {
    const minutes = parseInt(time);
    if (minutes <= 20) return 'text-green-600';
    if (minutes <= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getServingIcon = (servings: number) => {
    if (servings <= 2) return <Users className="h-4 w-4 inline-block mr-1" />;
    if (servings <= 4) return <Users className="h-4 w-4 inline-block mr-1" />;
    return <Users className="h-4 w-4 inline-block mr-1" />;
  };

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
      const ingredientsToAdd = meal.ingredients.filter((ingredient: any) =>
        selectedIngredients.includes(ingredient.name)
      );

      // Create pantry items for local state
      const newPantryItems = ingredientsToAdd.map((ingredient: any) => ({
        id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || 'ingredient',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        purchaseDate: new Date(),
        location: '',
        notes: `Added from AI meal: ${meal.name}`
      }));

      // Prepare ingredients for API call
      const apiIngredients = ingredientsToAdd.map((ingredient: any) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        classification: ingredient.classification || 'other',
        carbonFootPrintToWaste: 0.5, // Default value
        daysToExpire: 7,
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

    const itemsToOrder = meal.ingredients
      .filter((ingredient: any) => selectedIngredients.includes(ingredient.name))
      .map((ingredient: any) => ({
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        estimatedPrice: 2.99, // Default estimated price
        mealName: meal.name,
        notes: `From AI meal: ${meal.name}`
      }));

    setShowOrderModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Meals</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Meal Image and Basic Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-green-100 rounded-t-lg flex items-center justify-center">
                <ChefHat className="h-24 w-24 text-orange-600" />
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{meal.name}</h1>
                <p className="text-gray-600 text-sm leading-relaxed">{meal.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Cook Time</p>
                  <p className="font-semibold">{meal.cookingTime || '30 min'}</p>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="font-semibold">{meal.servings || '4'}</p>
                </div>
                <div className="text-center">
                  <Flame className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="font-semibold">{meal.calories || '450'}/serving</p>
                </div>
                <div className="text-center">
                  <ChefHat className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <Badge variant="outline" className={getDifficultyColor(meal.difficulty || 'Medium')}>
                    {meal.difficulty || 'Medium'}
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
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About This Meal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">{meal.description}</p>

                  {meal.tags && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {meal.tags.map((tag: string, index: number) => (
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
                    <span>Ingredients ({meal.ingredients?.length || 0})</span>
                  </CardTitle>
                  <CardDescription>
                    Select ingredients to add to your pantry or order online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {meal.ingredients?.map((ingredient: any, index: number) => (
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
                    {meal.instructions?.map((step: string, index: number) => (
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

            <TabsContent value="nutrition" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nutritional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meal.nutritionalInfo && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Nutrition per serving</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(meal.nutritionalInfo).map(([key, value]) => (
                          <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-semibold text-gray-800">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {meal.healthBenefits && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Health benefits</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(meal.healthBenefits).map(([key, value]) => (
                          <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-semibold text-gray-800">{String(value)}</p>
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
        items={meal.ingredients
          ?.filter((ingredient: any) => selectedIngredients.includes(ingredient.name))
          ?.map((ingredient: any) => ({
            id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            estimatedPrice: 2.99,
            mealName: meal.name,
            notes: `From AI meal: ${meal.name}`
          })) || []
        }
        mealPlanName={`AI Meal: ${meal.name}`}
      />
    </div>
  );
};

export default AIMealView;
