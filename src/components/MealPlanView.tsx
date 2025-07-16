import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { List, ListItem } from "@/components/ui/list";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
}

const MealPlanView = ({ plan, onBack }: MealPlanViewProps) => {
  const { updatePantryFromIngredients } = useUser();
  const navigate = useNavigate();
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');
  const [ingredientCategory, setIngredientCategory] = useState('');

  const handleAddToPantry = (ingredient: any) => {
    const newIngredient = {
      id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category,
      location: 'Pantry',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      purchaseDate: new Date(),
      addedFromShoppingList: true
    };
    
    updatePantryFromIngredients([newIngredient]);
  };

  return (
    <div className="container mx-auto p-4">
      <Button onClick={onBack} className="mb-4">Back to Meal Plans</Button>
      <Card className="bg-white shadow-md rounded-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-2">Ingredients:</h3>
          <List>
            {plan.ingredients && plan.ingredients.map((ingredient: any) => (
              <ListItem key={ingredient.name} className="flex items-center justify-between">
                <span>{ingredient.name} - {ingredient.quantity} {ingredient.unit} ({ingredient.category})</span>
                <Button size="sm" onClick={() => handleAddToPantry(ingredient)}>Add to Pantry</Button>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanView;
