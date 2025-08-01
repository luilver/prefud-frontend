
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Users, Droplets, Leaf, ShoppingCart, Eye } from "lucide-react";
import { ApiDrink } from "@/services/drinkService";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface DrinkDetailViewProps {
  drink: ApiDrink;
  onBack: () => void;
}

const DrinkDetailView = ({ drink, onBack }: DrinkDetailViewProps) => {
  const { addShoppingItem } = useUser();
  const { toast } = useToast();
  const [showIngredients, setShowIngredients] = useState(false);

  const handleCreateShoppingList = () => {
    try {
      drink.drinkPlan.ingredientsList.forEach((ingredient) => {
        addShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.classification || 'drink-ingredient',
          priority: 'medium',
          purchased: false,
          notes: `From drink: ${drink.drink_name}`
        });
      });

      toast({
        title: "Shopping List Created!",
        description: `Added ${drink.drinkPlan.ingredientsList.length} ingredients to your shopping list.`,
      });
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to create shopping list. Please try again.",
        variant: "destructive"
      });
    }
  };

  const healthyDrink = drink.drinkPlan.healthyDrink;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Drinks</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-green-800">{drink.drink_name}</h1>
          <p className="text-green-600">{healthyDrink.name}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">Description & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">Description</h4>
                <p className="text-gray-700">{healthyDrink.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">Health Benefits</h4>
                <p className="text-gray-700">{healthyDrink.benefits}</p>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">Instructions</h4>
                <p className="text-gray-700">{healthyDrink.instructions}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">Preparation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthyDrink.steps.map((step, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Quick Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Prep Time</span>
                </span>
                <span className="font-medium">{healthyDrink.cookingTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Servings</span>
                </span>
                <span className="font-medium">{drink.numberPeople}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center space-x-1">
                  <Droplets className="h-4 w-4" />
                  <span>Calories</span>
                </span>
                <span className="font-medium">{healthyDrink.calories}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center space-x-1">
                  <Leaf className="h-4 w-4" />
                  <span>Carbon Footprint</span>
                </span>
                <span className="font-medium">{drink.drinkPlan.totalCarbonFootprint}kg CO₂</span>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-green-700 mb-2">Drink Type</p>
                <Badge variant="secondary">{healthyDrink.drinkType}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">Nutritional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Protein</span>
                <span className="font-medium">{healthyDrink.nutritionalInfo.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fat</span>
                <span className="font-medium">{healthyDrink.nutritionalInfo.fat}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Carbs</span>
                <span className="font-medium">{healthyDrink.nutritionalInfo.carbohydrates}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fiber</span>
                <span className="font-medium">{healthyDrink.nutritionalInfo.fiber}g</span>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-green-700 mb-2">Vitamins</p>
                <div className="flex flex-wrap gap-1">
                  {healthyDrink.nutritionalInfo.vitamins.map((vitamin, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      Vitamin {vitamin}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center justify-between">
                <span>Ingredients</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowIngredients(!showIngredients)}
                >
                  {showIngredients ? 'Hide' : 'Show'} ({healthyDrink.ingredients.length})
                </Button>
              </CardTitle>
            </CardHeader>
            {showIngredients && (
              <CardContent>
                <div className="space-y-2">
                  {healthyDrink.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-gray-700 capitalize">{ingredient.name}</span>
                      <span className="text-sm text-gray-500">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          <Button 
            onClick={handleCreateShoppingList}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create Shopping List
          </Button>
        </div>
      </div>

      {healthyDrink.prepTip && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Droplets className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Pro Tip</h4>
                <p className="text-blue-700">{healthyDrink.prepTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DrinkDetailView;
