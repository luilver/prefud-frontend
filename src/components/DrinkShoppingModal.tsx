
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Package, Truck, Check, X } from "lucide-react";
import { ApiDrink } from "@/services/drinkService";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { updatePantry, type Ingredient } from "@/services/pantryService";

interface DrinkShoppingModalProps {
  drink: ApiDrink;
  isOpen: boolean;
  onClose: () => void;
}

const DrinkShoppingModal = ({ drink, isOpen, onClose }: DrinkShoppingModalProps) => {
  const { user, pantryItems, setPantryItems } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);

  const ingredients = drink.drinkPlan.ingredientsList;

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
        title: t("drinkShoppingModal.noIngredientsTitle") || "No ingredients selected",
        description: t("drinkShoppingModal.noIngredientsDesc") || "Please select ingredients to add to pantry.",
        variant: "destructive"
      });
      return;
    }

    const nowISO = new Date().toISOString();
    const selectedData = ingredients.filter(ing => selectedIngredients.includes(ing.name));

    // Build items in the exact structure required (ISO strings for backend)
    const newPantryItems = selectedData.map((ingredient) => {
      const carbon = ingredient.carbonFootPrintToWaste ?? 0.2;
      const days = ingredient.daysToExpire ?? 7;
      const expiryISO = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      return {
        id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || 'drink-ingredient',
        purchased: true,
        purchaseDate: nowISO,
        carbonFootPrintToWaste: carbon,
        daysToExpire: days,
        expiryDate: expiryISO,
        notes: `Carbon footprint:: ${carbon}`
      };
    });

    // Sync with backend pantry (expects Ingredient[] with strings)
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
      // Proceed to update local state regardless to reflect UI changes
    }

    // Convert ISO strings to Date objects for local PantryItem state to satisfy typing
    const newPantryItemsForState = newPantryItems.map(item => ({
      ...item,
      purchaseDate: new Date(item.purchaseDate),
      expiryDate: new Date(item.expiryDate),
    }));

    // Update local pantry state with Date objects
    setPantryItems([...(pantryItems || []), ...newPantryItemsForState]);

    toast({
      title: t("drinkShoppingModal.addedToPantryTitle") || "Added to Pantry!",
      description: `${t("drinkShoppingModal.added") || 'Added'} ${selectedIngredients.length} ${t("drinkShoppingModal.ingredientsToPantry") || 'ingredients to your pantry.'}`,
    });

    setSelectedIngredients([]);
  };

  const requestDelivery = () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: t("drinkShoppingModal.noIngredientsTitle") || "No ingredients selected",
        description: t("drinkShoppingModal.noDeliveryDesc") || "Please select ingredients for delivery.",
        variant: "destructive"
      });
      return;
    }

    setShowDeliveryOptions(true);
  };

  const confirmDelivery = (deliveryTime: string) => {
    toast({
      title: t("drinkShoppingModal.deliveryRequestedTitle") || "Delivery Requested!",
      description: `${t("drinkShoppingModal.yourIngreWill") || 'Your ingredients will be delivered'} ${deliveryTime}. ${t("drinkShoppingModal.youWillReceive") || 'You will receive a confirmation email shortly.'}`,
    });
    setShowDeliveryOptions(false);
    setSelectedIngredients([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-800">
            {t("drinkShoppingModal.shoppingList") || "Shopping List"} - {drink.drink_name}
          </DialogTitle>
        </DialogHeader>

        {!showDeliveryOptions ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {t("drinkShoppingModal.selectIngredients") || "Select ingredients to add to pantry or request delivery"}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedIngredients(ingredients.map(ing => ing.name))}
                  size="sm"
                >
                  {t("drinkShoppingModal.selectAll") || "Select All"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedIngredients([])}
                  size="sm"
                >
                  {t("drinkShoppingModal.clearAll") || "Clear All"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {ingredients.map((ingredient, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all ${
                    selectedIngredients.includes(ingredient.name) 
                      ? 'border-green-500 bg-green-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => toggleIngredient(ingredient.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedIngredients.includes(ingredient.name)
                            ? 'bg-green-500 border-green-500'
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
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Package className="h-4 w-4 mr-2" />
                {t("drinkShoppingModal.addToPantry") || 'Add to Pantry'} ({selectedIngredients.length})
              </Button>
              <Button
                onClick={requestDelivery}
                disabled={selectedIngredients.length === 0}
                variant="outline"
                className="flex-1"
              >
                <Truck className="h-4 w-4 mr-2" />
                {t("drinkShoppingModal.requestDelivery") || 'Request Delivery'} ({selectedIngredients.length})
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("drinkShoppingModal.chooseDeliveryTime") || "Choose Delivery Time"}
              </h3>
              <p className="text-gray-600">
                {t("drinkShoppingModal.whenDelivery") || "When would you like your ingredients delivered?"}
              </p>
            </div>

            <div className="grid gap-3">
              {[
                { label: t("drinkShoppingModal.sameDay") || "Same Day (2-4 hours)", time: "today", price: "$12.99" },
                { label: t("drinkShoppingModal.nextDay") || "Next Day", time: "tomorrow", price: "$7.99" },
                { label: t("drinkShoppingModal.within2to3Days") || "Within 2-3 Days", time: "in 2-3 days", price: "$4.99" },
                { label: t("drinkShoppingModal.withinAWeek") || "Within a Week", time: "within a week", price: "FREE" }
              ].map((option) => (
                <Card 
                  key={option.time}
                  className="cursor-pointer hover:border-green-500 transition-all"
                  onClick={() => confirmDelivery(option.time)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-gray-500">
                          {selectedIngredients.length} {t("drinkShoppingModal.ingredients") || "ingredients"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{option.price}</p>
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
                {t("drinkShoppingModal.backToIngredients") || "Back to Ingredients"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DrinkShoppingModal;
