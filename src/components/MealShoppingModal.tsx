import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Package, Truck, Check, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { updatePantry, type Ingredient } from "@/services/pantryService";

interface MealShoppingModalProps {
  meal: any;
  isOpen: boolean;
  onClose: () => void;
}

const MealShoppingModal = ({ meal, isOpen, onClose }: MealShoppingModalProps) => {
  const { user, pantryItems, setPantryItems } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);

  // Get ingredients with proper structure
  const getIngredientsData = () => {
    // NEW: support ingredientsList (used by AI-created meals)
    if (meal.ingredientsList && Array.isArray(meal.ingredientsList)) {
      return meal.ingredientsList.map((ingredient: any) => ({
        name: ingredient.name,
        quantity: ingredient.quantity ?? 1,
        unit: ingredient.unit ?? 'unit',
        classification: ingredient.classification ?? 'ingredient',
        daysToExpire: ingredient.daysToExpire ?? 7,
        carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste ?? 0.2,
      }));
    }

    if (meal.ingredientsData && Array.isArray(meal.ingredientsData)) {
      return meal.ingredientsData.map((ingredient: any) => ({
        name: ingredient.name || ingredient,
        quantity: ingredient.quantity || 1,
        unit: ingredient.unit || 'unit',
        classification: ingredient.classification || 'ingredient',
        daysToExpire: ingredient.daysToExpire || 7,
        // carbonFootPrintToWaste can come from meal data; if missing, we will default later when creating pantry items
        carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste
      }));
    }
    
    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      return meal.ingredients.map((ingredient: string) => {
        // Parse ingredient string to extract quantity and unit
        const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*(\w+)\s+(.+)$/);
        if (match) {
          return {
            name: match[3],
            quantity: parseFloat(match[1]),
            unit: match[2],
            classification: 'ingredient',
            daysToExpire: 7,
            carbonFootPrintToWaste: undefined
          };
        }
        return {
          name: ingredient,
          quantity: 1,
          unit: 'unit',
          classification: 'ingredient',
          daysToExpire: 7,
          carbonFootPrintToWaste: undefined
        };
      });
    }
    
    return [];
  };

  const ingredients = getIngredientsData();

  const toggleIngredient = (ingredientName: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientName) 
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const addSelectedToPantry = async () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please select ingredients to add to pantry.",
        variant: "destructive"
      });
      return;
    }

    // Build new pantry items with the exact structure required
    const nowISO = new Date().toISOString();
    const selectedData = ingredients.filter(ing => selectedIngredients.includes(ing.name));

    const newPantryItems = selectedData.map((ingredient) => {
      const carbon = ingredient.carbonFootPrintToWaste ?? 0.2; // default if not provided
      const expiryISO = new Date(Date.now() + (ingredient.daysToExpire || 7) * 24 * 60 * 60 * 1000).toISOString();

      return {
        id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || 'ingredient',
        purchased: true,
        purchaseDate: nowISO,
        carbonFootPrintToWaste: carbon,
        daysToExpire: ingredient.daysToExpire || 7,
        expiryDate: expiryISO,
        notes: `Carbon footprint:: ${carbon}`
      };
    });

    // Update backend pantry if user available by converting to Ingredient[] format
    try {
      if (user?.id) {
        const existingAsIngredients: Ingredient[] = (pantryItems || []).map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          classification: item.category || "ingredient",
          carbonFootPrintToWaste: item.carbonFootPrintToWaste ?? 0.2,
          daysToExpire: item.daysToExpire ?? 7,
          dayAdded: typeof item.purchaseDate === 'string'
            ? item.purchaseDate
            : item.purchaseDate?.toISOString() || nowISO,
        }));

        const newAsIngredients: Ingredient[] = newPantryItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          classification: item.category,
          carbonFootPrintToWaste: item.carbonFootPrintToWaste,
          daysToExpire: item.daysToExpire,
          dayAdded: item.purchaseDate,
        }));

        await updatePantry(user.id, [...existingAsIngredients, ...newAsIngredients]);
      }
    } catch (e) {
      console.error("Failed to sync pantry to backend:", e);
      // We still proceed to update local state so the UI reflects the change
    }

    // NEW: Convert ISO strings to Date objects for local PantryItem state typing
    const newPantryItemsForState = newPantryItems.map(item => ({
      ...item,
      purchaseDate: new Date(item.purchaseDate),
      expiryDate: new Date(item.expiryDate),
    }));

    // Merge into local pantry state
    setPantryItems([...(pantryItems || []), ...newPantryItemsForState]);

    toast({
      title: "Added to Pantry!",
      description: `Added ${selectedIngredients.length} ingredients to your pantry.`,
    });

    setSelectedIngredients([]);
  };

  const requestDelivery = () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please select ingredients for delivery.",
        variant: "destructive"
      });
      return;
    }

    setShowDeliveryOptions(true);
  };

  const confirmDelivery = (deliveryTime: string) => {
    toast({
      title: "Delivery Requested!",
      description: `Your ingredients will be delivered ${deliveryTime}. You'll receive a confirmation email shortly.`,
    });
    setShowDeliveryOptions(false);
    setSelectedIngredients([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-800">
            {t("mealShopping.shoppingListTitle") || "Shopping List"} - {meal.name}
          </DialogTitle>
        </DialogHeader>

        {!showDeliveryOptions ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {t("mealShopping.selectIngredients") || "Select ingredients to add to pantry or request delivery"}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedIngredients(ingredients.map(ing => ing.name))}
                  size="sm"
                >
                  {t("mealShopping.selectAll") || "Select All"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedIngredients([])}
                  size="sm"
                >
                  {t("mealShopping.clearAll") || "Clear All"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {ingredients.map((ingredient, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all ${
                    selectedIngredients.includes(ingredient.name) 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => toggleIngredient(ingredient.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedIngredients.includes(ingredient.name)
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedIngredients.includes(ingredient.name) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{ingredient.name}</h4>
                          <p className="text-sm text-gray-500">
                            {ingredient.quantity} {ingredient.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {ingredient.classification}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          Expires in {ingredient.daysToExpire} days
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="flex space-x-3">
              <Button
                onClick={addSelectedToPantry}
                disabled={selectedIngredients.length === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Package className="h-4 w-4 mr-2" />
                {t("mealShopping.addToPantry") || 'Add to Pantry'} ({selectedIngredients.length})
              </Button>
              <Button
                onClick={requestDelivery}
                disabled={selectedIngredients.length === 0}
                variant="outline"
                className="flex-1"
              >
                <Truck className="h-4 w-4 mr-2" />
                {t("mealShopping.requestDelivery") || 'Request Delivery'}  ({selectedIngredients.length})
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("mealShopping.chooseDeliveryTime") || "Choose Delivery Time"}
              </h3>
              <p className="text-gray-600">
                {t("mealShopping.deliveryPrompt") || "When would you like your ingredients delivered?"}
              </p>
            </div>

            <div className="grid gap-3">
              {[
                { label: t("mealShopping.sameDay") || "Same Day (2-4 hours)", time: "today", price: "$12.99" },
                { label: t("mealShopping.nextDay") || "Next Day", time: "tomorrow", price: "$7.99" },
                { label: t("mealShopping.in2to3Days") || "Within 2-3 Days", time: "in 2-3 days", price: "$4.99" },
                { label: t("mealShopping.withinWeek") || "Within a Week", time: "within a week", price: "FREE" }
              ].map((option) => (
                <Card 
                  key={option.time}
                  className="cursor-pointer hover:border-orange-500 transition-all"
                  onClick={() => confirmDelivery(option.time)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-gray-500">
                          {selectedIngredients.length} {t("mealShopping.ingredientCount") || 'ingredients'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{option.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeliveryOptions(false)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                {t("mealShopping.backToIngredients") || "Back to Ingredients"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MealShoppingModal;
