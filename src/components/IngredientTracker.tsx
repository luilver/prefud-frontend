import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Package, Calendar, AlertTriangle, Plus, Search, Trash2 } from "lucide-react";
import AddIngredientForm from "./AddIngredientForm";
import AIMealSuggestions from "./AIMealSuggestions";
import { useToast } from "@/hooks/use-toast";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  category: string;
  location?: string;
}

const IngredientTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: "1",
      name: "Chicken Breast",
      quantity: 2,
      unit: "lbs",
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      category: "Meat",
      location: "Refrigerator"
    },
    {
      id: "2",
      name: "Greek Yogurt",
      quantity: 1,
      unit: "container",
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      category: "Dairy",
      location: "Refrigerator"
    },
    {
      id: "3",
      name: "Bananas",
      quantity: 6,
      unit: "pieces",
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      category: "Fruits",
      location: "Counter"
    },
    {
      id: "4",
      name: "Brown Rice",
      quantity: 1,
      unit: "bag",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      category: "Grains",
      location: "Pantry"
    },
    {
      id: "5",
      name: "Milk",
      quantity: 1,
      unit: "gallon",
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      category: "Dairy",
      location: "Refrigerator"
    }
  ]);

  const handleAddIngredient = (newIngredient: Ingredient) => {
    setIngredients(prev => [...prev, newIngredient]);
  };

  const handleDeleteIngredient = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    setIngredients(prev => prev.filter(ing => ing.id !== id));
    toast({
      title: "Ingredient removed",
      description: `${ingredient?.name} has been removed from your pantry.`,
    });
  };

  const handleAddMealFromAI = (meal: any) => {
    // TODO: Add meal to meal plan
    console.log('Adding AI suggested meal to plan:', meal);
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return { status: "expired", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" };
    if (days <= 2) return { status: "urgent", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" };
    if (days <= 7) return { status: "soon", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    return { status: "fresh", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" };
  };

  const formatExpiryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expiringIngredients = ingredients.filter(ingredient => 
    getDaysUntilExpiry(ingredient.expiryDate) <= 7
  );

  const categorizedIngredients = filteredIngredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Meat': '🥩',
      'Dairy': '🥛',
      'Fruits': '🍎',
      'Vegetables': '🥕',
      'Grains': '🌾',
      'Pantry': '🥫'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pantry Tracker</h2>
          <p className="text-gray-600">Keep track of your ingredients and their expiration dates</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <AddIngredientForm 
              onClose={() => setShowAddForm(false)}
              onAdd={handleAddIngredient}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Suggestions */}
      <AIMealSuggestions 
        ingredients={ingredients}
        onAddMeal={handleAddMealFromAI}
      />

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* ... keep existing code (stats cards) */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-green-700">{ingredients.length}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-700">{expiringIngredients.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-blue-700">{Object.keys(categorizedIngredients).length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-red-700">2</p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Expiring Soon Alert */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Expiring Soon</span>
            </CardTitle>
            <CardDescription className="text-orange-600">
              Use these ingredients first to avoid waste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringIngredients.slice(0, 5).map((ingredient) => {
                const expiryInfo = getExpiryStatus(ingredient.expiryDate);
                const daysLeft = getDaysUntilExpiry(ingredient.expiryDate);
                
                return (
                  <div key={ingredient.id} className={`p-3 rounded-lg border ${expiryInfo.bgColor} ${expiryInfo.borderColor}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{ingredient.name}</h4>
                        <p className="text-sm text-gray-600">
                          {ingredient.quantity} {ingredient.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${expiryInfo.color}`}>
                          {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatExpiryDate(ingredient.expiryDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {expiringIngredients.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All ingredients are fresh!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ingredients by Category */}
        <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <span>Your Pantry</span>
            </CardTitle>
            <CardDescription>
              All your ingredients organized by category
            </CardDescription>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-400"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(categorizedIngredients).map(([category, categoryIngredients]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                    <span className="text-sm text-gray-500">({categoryIngredients.length})</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {categoryIngredients.map((ingredient) => {
                      const expiryInfo = getExpiryStatus(ingredient.expiryDate);
                      const daysLeft = getDaysUntilExpiry(ingredient.expiryDate);
                      
                      return (
                        <div key={ingredient.id} className={`p-3 rounded-lg border ${expiryInfo.bgColor} ${expiryInfo.borderColor} group`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{ingredient.name}</h4>
                              <p className="text-sm text-gray-600">
                                {ingredient.quantity} {ingredient.unit}
                              </p>
                              {ingredient.location && (
                                <p className="text-xs text-gray-500">{ingredient.location}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <p className={`text-sm font-medium ${expiryInfo.color}`}>
                                  {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatExpiryDate(ingredient.expiryDate)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteIngredient(ingredient.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {Object.keys(categorizedIngredients).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No ingredients found</p>
                  <p className="text-sm">
                    {searchTerm ? 'Try a different search term' : 'Start by adding some ingredients to your pantry'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IngredientTracker;
