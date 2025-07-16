
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { Clock, Users, Calendar, ChefHat, ShoppingCart, Plus } from "lucide-react";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView = ({ plan, onBack, onEdit }: MealPlanViewProps) => {
  const { updatePantryFromIngredients, addShoppingItem } = useUser();
  const [addedIngredients, setAddedIngredients] = useState<Set<string>>(new Set());

  const handleAddToPantry = (ingredient: any) => {
    const newIngredient = {
      id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category,
      location: 'Pantry',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      purchaseDate: new Date(),
      addedFromShoppingList: true
    };
    
    updatePantryFromIngredients([newIngredient]);
    setAddedIngredients(prev => new Set([...prev, ingredient.name]));
  };

  const handleAddToShoppingList = (ingredient: any) => {
    const shoppingItem = {
      id: `shopping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category,
      purchased: false,
      price: 0,
      store: ''
    };
    
    addShoppingItem(shoppingItem);
  };

  const addAllToShoppingList = () => {
    if (plan.ingredients) {
      plan.ingredients.forEach((ingredient: any) => {
        handleAddToShoppingList(ingredient);
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <Button onClick={onBack} variant="outline" className="mb-3">
            ← Back to Meal Plans
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">{plan.name}</h1>
          <p className="text-gray-600 mt-1">Your personalized meal plan</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline">
            Edit Plan
          </Button>
          <Button onClick={addAllToShoppingList} className="bg-blue-500 hover:bg-blue-600">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add All to Shopping List
          </Button>
        </div>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Plan Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{plan.duration || 'Custom'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">People</p>
                <p className="font-medium">{plan.preferences?.people || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Meals/Day</p>
                <p className="font-medium">{plan.preferences?.mealsPerDay || '3'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Total Meals</p>
                <p className="font-medium">{plan.meals?.length || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Date Range */}
          <Separator className="my-4" />
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{new Date(plan.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{new Date(plan.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Preferences */}
          {plan.preferences && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                {plan.preferences.dietaryRestrictions && plan.preferences.dietaryRestrictions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Dietary Restrictions</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.preferences.dietaryRestrictions.map((restriction: string, index: number) => (
                        <Badge key={index} variant="secondary">{restriction}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {plan.preferences.allergies && plan.preferences.allergies.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.preferences.allergies.map((allergy: string, index: number) => (
                        <Badge key={index} variant="destructive">{allergy}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {plan.preferences.cuisinePreferences && plan.preferences.cuisinePreferences.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Cuisine Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.preferences.cuisinePreferences.map((cuisine: string, index: number) => (
                        <Badge key={index} variant="outline">{cuisine}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ingredients List */}
      {plan.ingredients && plan.ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-green-500" />
                Ingredients ({plan.ingredients.length})
              </span>
              <Button onClick={addAllToShoppingList} variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Shopping
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {plan.ingredients.map((ingredient: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-gray-600 ml-2">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                    {ingredient.category && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {ingredient.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddToShoppingList(ingredient)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Shopping
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToPantry(ingredient)}
                      disabled={addedIngredients.has(ingredient.name)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {addedIngredients.has(ingredient.name) ? 'Added' : 'Pantry'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals Schedule */}
      {plan.meals && plan.meals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Meal Schedule ({plan.meals.length} meals)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.meals.map((meal: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{meal.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{meal.type}</span>
                        {meal.day && <span>Day {meal.day}</span>}
                        {meal.calories && <span>{meal.calories} cal</span>}
                        {meal.prepTime && <span>{meal.prepTime} min</span>}
                      </div>
                    </div>
                    {meal.difficulty && (
                      <Badge variant={meal.difficulty === 'easy' ? 'secondary' : meal.difficulty === 'medium' ? 'default' : 'destructive'}>
                        {meal.difficulty}
                      </Badge>
                    )}
                  </div>
                  
                  {meal.description && (
                    <p className="text-gray-600 text-sm mb-3">{meal.description}</p>
                  )}
                  
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Ingredients:</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.slice(0, 5).map((ingredient: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {meal.ingredients.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{meal.ingredients.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {meal.instructions && meal.instructions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Instructions:</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        {meal.instructions.slice(0, 3).map((instruction: string, idx: number) => (
                          <p key={idx}>• {instruction}</p>
                        ))}
                        {meal.instructions.length > 3 && (
                          <p className="text-xs text-gray-500">... and {meal.instructions.length - 3} more steps</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shopping List */}
      {plan.shoppingList && plan.shoppingList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Shopping List ({plan.shoppingList.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {plan.shoppingList.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span>{item.name} - {item.quantity} {item.unit}</span>
                  <Button size="sm" onClick={() => handleAddToPantry(item)}>
                    Add to Pantry
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanView;
