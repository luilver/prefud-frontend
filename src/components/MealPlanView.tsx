
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarDays, Clock, Users, Utensils, Flame, ChevronsDown, ShoppingCart, ArrowLeft, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from '@/contexts/UserContext';
import { Meal } from '@/services/mealPlanService';
import { ShoppingItem } from '@/contexts/UserContext';

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ plan, onBack, onEdit }) => {
  const { addPantryItem, addToShoppingList } = useUser();

  const handleAddToShoppingList = (ingredientName: string) => {
    const newShoppingItem: ShoppingItem = {
      id: `shopping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ingredientName,
      quantity: 1,
      unit: 'piece',
      category: 'other',
      purchased: false
    };
    addToShoppingList(newShoppingItem);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{plan.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button onClick={onEdit} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Plan
        </Button>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{plan.meals?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Meals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{plan.preferences?.numberOfPersons || 'N/A'}</div>
              <div className="text-sm text-gray-600">People</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{plan.preferences?.mealsPerDay || '3'}</div>
              <div className="text-sm text-gray-600">Meals/Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{plan.shoppingList?.length || 0}</div>
              <div className="text-sm text-gray-600">Ingredients</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Meals</h2>
        <div className="grid gap-4">
          {plan.meals?.map((meal: any, index: number) => (
            <MealCard 
              key={meal.id || index}
              meal={meal} 
              onAddToShoppingList={handleAddToShoppingList}
              addPantryItem={addPantryItem}
            />
          ))}
        </div>
      </div>

      {/* Shopping List */}
      {plan.shoppingList && plan.shoppingList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Shopping List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {plan.shoppingList.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{item.name || item}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddToShoppingList(item.name || item)}
                  >
                    <ShoppingCart className="h-3 w-3 mr-2" />
                    Add
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

interface MealCardProps {
  meal: any;
  onAddToShoppingList: (ingredientName: string) => void;
  addPantryItem: (item: any) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onAddToShoppingList, addPantryItem }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {meal.name}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{meal.mealType || 'Meal'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 opacity-70" />
              <span>Prep: {meal.prepTime || 'N/A'} mins</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 opacity-70" />
              <span>Serves: {meal.servings || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 opacity-70" />
              <span>Calories: {meal.calories || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Utensils className="h-4 w-4 opacity-70" />
              <span>Difficulty: {meal.difficulty || 'N/A'}</span>
            </div>
          </div>
          <div>
            <Button variant="secondary" size="sm" onClick={toggleExpanded} className="w-full">
              Ingredients & Instructions
              <ChevronsDown className={`h-4 w-4 ml-2 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {expanded && (
            <div className="mt-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Ingredients:</h4>
                <ScrollArea className="h-[150px] w-full rounded-md border p-2">
                  <ul className="list-disc pl-4">
                    {(meal.ingredients || meal.detailedIngredients?.map((ing: any) => ing.name) || []).map((ingredient: any, index: number) => (
                      <li key={index} className="text-xs flex items-center justify-between">
                        <span>{typeof ingredient === 'string' ? ingredient : ingredient.name}</span>
                        <Button variant="outline" size="sm" onClick={() => onAddToShoppingList(typeof ingredient === 'string' ? ingredient : ingredient.name)}>
                          <ShoppingCart className="h-3 w-3 mr-2" />
                          Add to List
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Instructions:</h4>
                <ScrollArea className="h-[150px] w-full rounded-md border p-2">
                  <ol className="list-decimal pl-4">
                    {(meal.steps || []).map((step: string, index: number) => (
                      <li key={index} className="text-xs">{step}</li>
                    ))}
                  </ol>
                </ScrollArea>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Add Ingredients to Pantry:</h4>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => {
                  // Add ingredients to pantry
                  const ingredientNames = meal.ingredients || meal.detailedIngredients?.map((ing: any) => ing.name) || [];
                  ingredientNames.forEach((ingredient: any) => {
                    addPantryItem({
                      id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      name: typeof ingredient === 'string' ? ingredient : ingredient.name,
                      quantity: typeof ingredient === 'object' ? ingredient.quantity || 1 : 1,
                      unit: typeof ingredient === 'object' ? ingredient.unit || 'piece' : 'piece',
                      category: typeof ingredient === 'object' ? ingredient.category || 'other' : 'other',
                      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                      purchaseDate: new Date(),
                      notes: 'Added from meal plan'
                    });
                  });
                }}>
                  Add All Ingredients to Pantry
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanView;
