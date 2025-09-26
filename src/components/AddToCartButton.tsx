import React from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
  ingredient: {
    name: string;
    quantity: number;
    unit: string;
    category?: string;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  ingredient,
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const { addItem } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = () => {
    addItem({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category
    });

    toast({
      title: "Added to Cart",
      description: `${ingredient.name} has been added to your shopping cart.`,
      duration: 2000,
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      className={`${className} transition-all duration-200`}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      Add to Cart
    </Button>
  );
};

export default AddToCartButton;