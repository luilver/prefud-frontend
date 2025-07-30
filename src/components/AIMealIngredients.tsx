
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Package } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface AIMealIngredientsProps {
  onDataChange: (data: any) => void;
  initialData: any;
}

const AIMealIngredients = ({ onDataChange, initialData }: AIMealIngredientsProps) => {
  const { pantryItems } = useUser();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    initialData.ingredients || []
  );
  const [customIngredient, setCustomIngredient] = useState("");

  const ingredientCategories = [
    {
      name: "Proteins",
      items: ["Chicken", "Beef", "Pork", "Fish", "Tofu", "Eggs", "Beans", "Lentils"]
    },
    {
      name: "Vegetables",
      items: ["Tomatoes", "Onions", "Garlic", "Carrots", "Broccoli", "Spinach", "Bell Peppers", "Mushrooms"]
    },
    {
      name: "Grains & Starches",
      items: ["Rice", "Pasta", "Bread", "Potatoes", "Quinoa", "Oats", "Flour", "Noodles"]
    },
    {
      name: "Dairy & Alternatives",
      items: ["Milk", "Cheese", "Yogurt", "Butter", "Cream", "Almond Milk", "Coconut Milk"]
    }
  ];

  useEffect(() => {
    onDataChange({ ingredients: selectedIngredients });
  }, [selectedIngredients, onDataChange]);

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      setSelectedIngredients(prev => [...prev, customIngredient.trim()]);
      setCustomIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => prev.filter(item => item !== ingredient));
  };

  // Get pantry items by category for better organization
  const pantryByCategory = pantryItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof pantryItems>);

  return (
    <div className="space-y-6">
      {/* Pantry Items */}
      {pantryItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>From Your Pantry ({pantryItems.length} items)</span>
            </CardTitle>
            <CardDescription>
              Select ingredients you already have in your pantry
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(pantryByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(pantryByCategory).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {items.map((item) => {
                        const isExpiringSoon = new Date(item.expiryDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
                        return (
                          <Button
                            key={item.id}
                            type="button"
                            variant={selectedIngredients.includes(item.name) ? "default" : "outline"}
                            onClick={() => toggleIngredient(item.name)}
                            className={`h-12 text-sm relative ${isExpiringSoon ? 'border-orange-300 bg-orange-50 hover:bg-orange-100' : ''}`}
                            title={`${item.name} - ${item.quantity} ${item.unit}${isExpiringSoon ? ' (Expires soon!)' : ''}`}
                          >
                            <div className="flex flex-col items-center">
                              <span className="truncate max-w-full">{item.name}</span>
                              <span className="text-xs text-gray-500">{item.quantity} {item.unit}</span>
                            </div>
                            {isExpiringSoon && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {pantryItems.slice(0, 12).map((item) => {
                  const isExpiringSoon = new Date(item.expiryDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
                  return (
                    <Button
                      key={item.id}
                      type="button"
                      variant={selectedIngredients.includes(item.name) ? "default" : "outline"}
                      onClick={() => toggleIngredient(item.name)}
                      className={`h-12 text-sm relative ${isExpiringSoon ? 'border-orange-300 bg-orange-50 hover:bg-orange-100' : ''}`}
                      title={`${item.name} - ${item.quantity} ${item.unit}${isExpiringSoon ? ' (Expires soon!)' : ''}`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="truncate max-w-full">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.quantity} {item.unit}</span>
                      </div>
                      {isExpiringSoon && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Common Ingredients */}
      {ingredientCategories.map((category) => (
        <Card key={category.name}>
          <CardHeader>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <CardDescription>
              Select {category.name.toLowerCase()} you'd like to use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {category.items.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={selectedIngredients.includes(item) ? "default" : "outline"}
                  onClick={() => toggleIngredient(item)}
                  className="h-12 text-sm"
                >
                  {item}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Custom Ingredient Input */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Ingredient</CardTitle>
          <CardDescription>
            Add any specific ingredient not listed above
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={customIngredient}
              onChange={(e) => setCustomIngredient(e.target.value)}
              placeholder="Enter ingredient name"
              onKeyPress={(e) => e.key === 'Enter' && addCustomIngredient()}
            />
            <Button onClick={addCustomIngredient} disabled={!customIngredient.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Ingredients ({selectedIngredients.length})</CardTitle>
            <CardDescription>
              These ingredients will be used in your AI-generated meal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <Badge key={ingredient} variant="secondary" className="px-3 py-1">
                  {ingredient}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIMealIngredients;
