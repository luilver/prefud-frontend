
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/contexts/UserContext";
import { Clock, Users, Calendar, ChefHat, ShoppingCart, Plus, Play, Check, Package } from "lucide-react";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView = ({ plan, onBack, onEdit }: MealPlanViewProps) => {
  const { updatePantryFromIngredients, addShoppingItem } = useUser();
  const [addedIngredients, setAddedIngredients] = useState<Set<string>>(new Set());
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [showShoppingList, setShowShoppingList] = useState(false);

  const handleAddToPantry = (ingredient: any) => {
    const newIngredient = {
      id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category || 'Other',
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
      category: ingredient.category || 'Other',
      purchased: false,
      price: 0,
      store: ''
    };
    
    addShoppingItem(shoppingItem);
  };

  const generateShoppingList = () => {
    if (plan.meals) {
      const allIngredients: any[] = [];
      plan.meals.forEach((meal: any) => {
        if (meal.ingredients) {
          meal.ingredients.forEach((ingredient: any) => {
            allIngredients.push({
              ...ingredient,
              mealName: meal.name,
              category: ingredient.category || 'Other'
            });
          });
        }
      });
      
      // Group ingredients by category
      const categorizedIngredients = allIngredients.reduce((acc, ingredient) => {
        const category = ingredient.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(ingredient);
        return acc;
      }, {});

      setShoppingList(categorizedIngredients);
      setShowShoppingList(true);
    }
  };

  const toggleIngredientCheck = (ingredientName: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };

  const addCheckedToPantry = () => {
    Object.values(shoppingList).flat().forEach((ingredient: any) => {
      if (checkedIngredients.has(ingredient.name)) {
        handleAddToPantry(ingredient);
      }
    });
    setCheckedIngredients(new Set());
  };

  // Group meals by day
  const mealsByDay = plan.meals?.reduce((acc: any, meal: any) => {
    const day = meal.day || 1;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(meal);
    return acc;
  }, {}) || {};

  if (showShoppingList) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button onClick={() => setShowShoppingList(false)} variant="outline" className="mb-3">
              ← Back to Meal Plan
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Shopping List</h1>
            <p className="text-gray-600 mt-1">for {plan.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={addCheckedToPantry} disabled={checkedIngredients.size === 0}>
              <Package className="h-4 w-4 mr-2" />
              Add Checked to Pantry ({checkedIngredients.size})
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {Object.entries(shoppingList).map(([category, ingredients]: [string, any]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  {category} ({ingredients.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ingredients.map((ingredient: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={checkedIngredients.has(ingredient.name)}
                          onCheckedChange={() => toggleIngredientCheck(ingredient.name)}
                        />
                        <div>
                          <span className="font-medium">{ingredient.name}</span>
                          <span className="text-gray-600 ml-2">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                          <p className="text-xs text-gray-500">for {ingredient.mealName}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToPantry(ingredient)}
                        disabled={addedIngredients.has(ingredient.name)}
                      >
                        {addedIngredients.has(ingredient.name) ? 'Added' : 'Add to Pantry'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
          <Button onClick={generateShoppingList} className="bg-blue-500 hover:bg-blue-600">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Generate Shopping List
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

      {/* Meals by Day */}
      {Object.keys(mealsByDay).length > 0 && (
        <div className="space-y-6">
          {Object.entries(mealsByDay)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, meals]: [string, any]) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    Day {day} ({meals.length} meals)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {meals.map((meal: any, index: number) => (
                      <div key={index} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">{meal.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                {meal.type || 'Meal'}
                              </span>
                              {meal.calories && <span>{meal.calories} cal</span>}
                              {meal.prepTime && <span><Clock className="h-3 w-3 inline mr-1" />{meal.prepTime} min</span>}
                              {meal.servings && <span><Users className="h-3 w-3 inline mr-1" />{meal.servings} servings</span>}
                            </div>
                          </div>
                          {meal.difficulty && (
                            <Badge variant={meal.difficulty === 'easy' ? 'secondary' : meal.difficulty === 'medium' ? 'default' : 'destructive'}>
                              {meal.difficulty}
                            </Badge>
                          )}
                        </div>

                        {meal.description && (
                          <p className="text-gray-600">{meal.description}</p>
                        )}

                        {/* Video Section */}
                        {meal.videoUrl && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Play className="h-5 w-5 text-red-500" />
                              <h4 className="font-medium">Cooking Video</h4>
                            </div>
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                              <iframe
                                src={meal.videoUrl}
                                className="w-full h-full rounded-lg"
                                frameBorder="0"
                                allowFullScreen
                                title={`${meal.name} cooking video`}
                              />
                            </div>
                          </div>
                        )}

                        {/* Ingredients Section */}
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <ChefHat className="h-4 w-4" />
                              Ingredients ({meal.ingredients.length})
                            </h4>
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {meal.ingredients.map((ingredient: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <span className="text-sm">
                                      {typeof ingredient === 'string' ? ingredient : `${ingredient.quantity || ''} ${ingredient.unit || ''} ${ingredient.name}`}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAddToShoppingList(typeof ingredient === 'string' ? { name: ingredient, quantity: '1', unit: 'unit' } : ingredient)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Instructions Section */}
                        {meal.instructions && meal.instructions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-3">Cooking Instructions</h4>
                            <div className="bg-blue-50 rounded-lg p-4">
                              <ol className="space-y-3">
                                {meal.instructions.map((instruction: string, idx: number) => (
                                  <li key={idx} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                      {idx + 1}
                                    </span>
                                    <span className="text-gray-700">{instruction}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}

                        {/* Nutrition Info */}
                        {meal.nutrition && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                            {Object.entries(meal.nutrition).map(([key, value]: [string, any]) => (
                              <div key={key} className="text-center">
                                <p className="text-sm text-gray-500 capitalize">{key}</p>
                                <p className="font-medium">{value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default MealPlanView;
