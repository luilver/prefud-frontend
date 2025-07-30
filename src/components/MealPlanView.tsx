
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarDays, Clock, Users, Utensils, Flame, ChevronsDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from '@/contexts/UserContext';
import { Meal } from '@/services/mealPlanService';
import { ShoppingItem } from '@/contexts/UserContext';

interface MealPlanViewProps {
  meal: any;
  weekNumber: number;
  dayOfWeek: string;
  date: string;
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ meal, weekNumber, dayOfWeek, date }) => {
  const { addPantryItem, addToShoppingList } = useUser();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

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
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {meal.name}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">Week {weekNumber}</Badge>
          <Badge variant="outline">{dayOfWeek}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 opacity-70" />
            <span className="text-xs">{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 opacity-70" />
            <span className="text-xs">Prep Time: {meal.prepTime} mins</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 opacity-70" />
            <span className="text-xs">Serves: {meal.servings}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 opacity-70" />
            <span className="text-xs">Calories: {meal.calories}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Utensils className="h-4 w-4 opacity-70" />
            <span className="text-xs">Difficulty: {meal.difficulty}</span>
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
                        <Button variant="outline" size="sm" onClick={() => handleAddToShoppingList(typeof ingredient === 'string' ? ingredient : ingredient.name)}>
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
                    {meal.steps.map((step: string, index: number) => (
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
