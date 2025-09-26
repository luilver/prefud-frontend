import React from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

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
  const { handleAddToCart } = useAddToCart({
    ingredients: [ingredient],
    selectedIngredients: [ingredient.name]
  });

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => handleAddToCart()}
      className={`${className} transition-all duration-200`}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      Add to Cart
    </Button>
  );
};

export default AddToCartButton;