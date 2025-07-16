
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface AIDrinkIngredientsProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
}

const AIDrinkIngredients = ({ data, onUpdate, onNext }: AIDrinkIngredientsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customIngredient, setCustomIngredient] = useState("");

  const commonIngredients = {
    fruits: [
      'Apple', 'Banana', 'Orange', 'Berries', 'Mango', 'Pineapple', 
      'Lemon', 'Lime', 'Kiwi', 'Watermelon', 'Grapes', 'Papaya'
    ],
    vegetables: [
      'Spinach', 'Kale', 'Cucumber', 'Celery', 'Carrots', 'Beets',
      'Ginger', 'Turmeric', 'Parsley', 'Mint', 'Cilantro'
    ],
    supplements: [
      'Protein Powder', 'Collagen', 'Spirulina', 'Chia Seeds', 'Flax Seeds',
      'Hemp Hearts', 'Matcha', 'Coconut Oil', 'Almond Butter', 'Honey'
    ],
    liquids: [
      'Water', 'Coconut Water', 'Almond Milk', 'Oat Milk', 'Green Tea',
      'Herbal Tea', 'Coconut Milk', 'Soy Milk'
    ]
  };

  const filteredIngredients = Object.entries(commonIngredients).reduce((acc, [category, items]) => {
    const filtered = items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const toggleIngredient = (ingredient: string) => {
    const currentIngredients = data.ingredients || [];
    const newIngredients = currentIngredients.includes(ingredient)
      ? currentIngredients.filter((item: string) => item !== ingredient)
      : [...currentIngredients, ingredient];
    onUpdate('ingredients', newIngredients);
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim()) {
      const currentIngredients = data.ingredients || [];
      if (!currentIngredients.includes(customIngredient.trim())) {
        onUpdate('ingredients', [...currentIngredients, customIngredient.trim()]);
      }
      setCustomIngredient("");
    }
  };

  const handleNext = () => {
    if ((data.ingredients || []).length > 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Choose Your Ingredients</h2>
        <p className="text-green-600">Select ingredients for your healthy drink</p>
      </div>

      {/* Search and Add Custom */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
          <Input
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-green-300 focus:border-green-500"
          />
        </div>

        <div className="flex space-x-2">
          <Input
            placeholder="Add custom ingredient..."
            value={customIngredient}
            onChange={(e) => setCustomIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomIngredient()}
            className="border-green-300 focus:border-green-500"
          />
          <Button 
            onClick={addCustomIngredient}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Ingredients */}
      {(data.ingredients || []).length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Selected Ingredients ({(data.ingredients || []).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(data.ingredients || []).map((ingredient: string) => (
                <span 
                  key={ingredient}
                  className="bg-green-600 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-green-700"
                  onClick={() => toggleIngredient(ingredient)}
                >
                  {ingredient} ×
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredient Categories */}
      <div className="space-y-6">
        {Object.entries(filteredIngredients).map(([category, items]) => (
          <Card key={category} className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 capitalize">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((ingredient) => (
                  <div 
                    key={ingredient}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-all ${
                      (data.ingredients || []).includes(ingredient)
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'hover:bg-green-50 border-2 border-transparent'
                    }`}
                    onClick={() => toggleIngredient(ingredient)}
                  >
                    <Checkbox 
                      checked={(data.ingredients || []).includes(ingredient)}
                      onChange={() => toggleIngredient(ingredient)}
                    />
                    <span className="text-sm text-green-700">{ingredient}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={handleNext}
          disabled={!(data.ingredients || []).length}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          Generate Drink with {(data.ingredients || []).length} ingredient{(data.ingredients || []).length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};

export default AIDrinkIngredients;
