
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView = ({ plan, onBack, onEdit }: MealPlanViewProps) => {
  const { updatePantryFromIngredients } = useUser();
  const navigate = useNavigate();
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');
  const [ingredientCategory, setIngredientCategory] = useState('');

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
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <Button onClick={onBack}>Back to Meal Plans</Button>
        <Button onClick={onEdit} variant="outline">Edit Plan</Button>
      </div>
      <Card className="bg-white shadow-md rounded-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-2">Ingredients:</h3>
          <ul className="space-y-2">
            {plan.ingredients && plan.ingredients.map((ingredient: any) => (
              <li key={ingredient.name} className="flex items-center justify-between p-3 border rounded-lg">
                <span>{ingredient.name} - {ingredient.quantity} {ingredient.unit} ({ingredient.category})</span>
                <Button size="sm" onClick={() => handleAddToPantry(ingredient)}>Add to Pantry</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanView;
