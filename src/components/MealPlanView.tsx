
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Package, Star, ShoppingCart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSpecialMealsByUser } from "@/services/userMealPlansService";
import { useQuery } from "@tanstack/react-query";
import OrderOnlineModal from "./OrderOnlineModal";

interface MealPlanViewProps {
  mealPlan?: any;
  plan?: any;
  onClose: () => void;
}

const MealPlanView = ({ mealPlan, plan, onClose }: MealPlanViewProps) => {
  const { t } = useLanguage();
  const { user, addPantryItem } = useUser();
  const { toast } = useToast();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Use either mealPlan or plan prop
  const activePlan = mealPlan || plan;
  const regularMeals = activePlan?.meals || [];
  
  const { data: specialMeals = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['specialMeals', user?.id],
    queryFn: () => getSpecialMealsByUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const addMealToPantry = (meal: any) => {
    if (!meal.ingredients) {
      toast({
        title: t("mealPlanView.noIngredients") || "No Ingredients",
        description: t("mealPlanView.noIngredientsDesc") || "This meal has no ingredients to add.",
        variant: "destructive",
      });
      return;
    }

    meal.ingredients.forEach((ingredient: any) => {
      addPantryItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || 'meal-ingredient',
        expiryDate: new Date(Date.now() + ingredient.daysToExpire * 24 * 60 * 60 * 1000),
        purchaseDate: new Date(),
        notes: `From meal: ${meal.meal_name}`
      });
    });

    toast({
      title: t("mealPlanView.addedToPantry") || "Added to Pantry!",
      description: `${t("mealPlanView.addedAll") || 'Added all'} ${meal.ingredients.length} ${t("mealPlanView.ingredientsToPantry") || 'ingredients to your pantry.'}`,
    });
  };

  const addAllToPantry = () => {
    regularMeals.forEach((meal: any) => {
      addMealToPantry(meal);
    });
  };

  const handleOrderOnline = (meal: any) => {
    const items = meal.ingredients?.map((ingredient: any, index: number) => ({
      id: `${meal.meal_name}-${index}`,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      estimatedPrice: ingredient.estimatedPrice || Math.random() * 10 + 2, // Mock price
      mealName: meal.meal_name,
      notes: ingredient.notes || ''
    })) || [];
    
    setOrderItems(items);
    setShowOrderModal(true);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-800">
            {activePlan?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {regularMeals.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                {t("mealPlanView.regularMeals") || "Regular Meals"}
              </h3>
              <div className="grid gap-4">
                {regularMeals.map((meal: any, index: number) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-gray-800">{meal.meal_name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addMealToPantry(meal)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          {t("mealPlanView.addToPantry") || "Add to Pantry"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        <strong>{t("mealPlanView.ingredients") || "Ingredients"}:</strong>
                      </p>
                      <ul className="list-disc pl-5 mt-2">
                        {meal.ingredients?.map((ingredient: any, i: number) => (
                          <li key={i} className="text-gray-600">
                            {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Special Meals Section */}
          {Array.isArray(specialMeals) && specialMeals.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                {t("mealPlanView.specialMeals") || "Special Meals"}
              </h3>
              <div className="grid gap-4">
                {specialMeals.map((meal: any, index: number) => (
                  <Card key={index} className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-gray-800 flex items-center">
                            {meal.meal_name}
                            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                              {t("mealPlanView.special") || "Special"}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOrderOnline(meal)}
                            className="flex items-center gap-1 border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {t("mealPlanView.orderOnline") || "Order Online"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => addMealToPantry(meal)}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            {t("mealPlanView.addToPantry") || "Add to Pantry"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        <strong>{t("mealPlanView.ingredients") || "Ingredients"}:</strong>
                      </p>
                      <ul className="list-disc pl-5 mt-2">
                        {meal.ingredients?.map((ingredient: any, i: number) => (
                          <li key={i} className="text-gray-600">
                            {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-end">
            <Button onClick={addAllToPantry} className="bg-green-600 hover:bg-green-700 text-white">
              {t("mealPlanView.addAllToPantry") || "Add All to Pantry"}
            </Button>
          </div>
        </div>

        {/* Order Online Modal */}
        <OrderOnlineModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          items={orderItems}
          mealPlanName={activePlan?.name}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanView;
