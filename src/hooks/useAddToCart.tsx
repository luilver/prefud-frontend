import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

interface UseAddToCartProps {
  ingredients: Ingredient[];
  selectedIngredients?: string[];
  onSuccess?: () => void;
}

export const useAddToCart = ({ ingredients, selectedIngredients, onSuccess }: UseAddToCartProps) => {
  const { addItem } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = (customIngredients?: Ingredient[]) => {
    let ingredientsToAdd: Ingredient[];

    if (customIngredients) {
      // Use custom ingredients if provided
      ingredientsToAdd = customIngredients;
    } else if (selectedIngredients && selectedIngredients.length > 0) {
      // Filter by selected ingredients
      ingredientsToAdd = ingredients.filter((ingredient: Ingredient) => 
        selectedIngredients.includes(ingredient.name)
      );
    } else {
      // Use all ingredients if no selection
      ingredientsToAdd = ingredients;
    }

    if (ingredientsToAdd.length === 0) {
      toast({
        title: t("common.error") || "Error",
        description: t("common.selectIngredients") || "Please select ingredients to add to cart",
        variant: "destructive",
      });
      return;
    }

    // Add each ingredient to cart
    ingredientsToAdd.forEach((ingredient) => {
      addItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category
      });
    });

    // Show success toast
    const itemText = ingredientsToAdd.length === 1 
      ? ingredientsToAdd[0].name 
      : `${ingredientsToAdd.length} ${t("common.ingredients") || "ingredients"}`;

    toast({
      title: t("common.addedToCart") || "Added to Cart",
      description: `${itemText} ${ingredientsToAdd.length === 1 ? 'has' : 'have'} been added to your cart.`,
      duration: 2000,
    });

    // Call success callback if provided
    onSuccess?.();
  };

  return { handleAddToCart };
};