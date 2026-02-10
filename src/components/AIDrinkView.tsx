import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Droplets, BookOpen, Heart, Share2, Check, Timer, Trash2, Zap, ShoppingCart, Package } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAddToCart } from "@/hooks/useAddToCart";
import { Checkbox } from "@/components/ui/checkbox";

interface AIDrinkViewProps {
  drink: any;
  onBack: () => void;
}

const AIDrinkView = ({ drink, onBack }: AIDrinkViewProps) => {
  const { t } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const { deleteAIDrink } = useUser();
  const { addItem } = useCart();

  const toggleStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(i => i !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };


  const handleDelete = () => {
    deleteAIDrink(drink.id);
    toast.success("AI drink deleted successfully!");
    onBack();
  };

  const handleIngredientToggle = (ingredientName: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((name) => name !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleSelectAllIngredients = () => {
    if (selectedIngredients.length === drink.ingredients.length) {
      setSelectedIngredients([]);
    } else {
      setSelectedIngredients(drink.ingredients.map((ingredient: any) => ingredient.name));
    }
  };

  // Transform ingredients for the hook
  const transformedIngredients = drink.ingredients?.map((ingredient: any) => {
    const amount = ingredient.amount || "1 unit";
    const match = amount.match(/^(\d+(?:\.\d+)?)\s*(\w+)?/);
    const quantity = match ? parseFloat(match[1]) : 1;
    const unit = match && match[2] ? match[2] : "unit";
    
    return {
      name: ingredient.name,
      quantity: quantity,
      unit: unit,
      category: "beverage ingredient"
    };
  }) || [];

  const { handleAddToCart } = useAddToCart({
    ingredients: transformedIngredients,
    selectedIngredients,
    onSuccess: () => setSelectedIngredients([])
  });

  const enhancedInstructions = useMemo(() => {
    const drinkTips = [
      "🥤 Use fresh ingredients for best taste",
      "⏱️ Blend slowly at first, then increase speed", 
      "🧊 Add ice for a refreshing chill",
      "🌟 Taste and adjust sweetness as needed",
      "💡 Serve immediately for optimal freshness",
      "🎯 Perfect consistency is key!",
      "✨ Garnish for extra visual appeal",
      "🏆 Enjoy your healthy creation!"
    ];
    
    return drink.instructions.map((instruction: string, index: number) => ({
      text: instruction,
      tip: drinkTips[index % drinkTips.length],
      estimatedTime: 1 + (index % 3)
    }));
  }, [drink.instructions]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Mobile-first header with sticky positioning */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" onClick={onBack} size="sm" className="p-2">
              ← {t("aiDrinkView.back") || "Back"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-shrink-0 hidden sm:flex">
                <Heart className="h-4 w-4 mr-1" />
                {t("aiDrinkView.save") || "Save"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t("aiDrinkView.delete") || "Delete"}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
          {/* Hero Card - Mobile Optimized */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
              <CardHeader className="relative pb-4">
                <CardTitle className="text-xl md:text-3xl font-bold mb-2 leading-tight">
                  {drink.name}
                </CardTitle>
                <CardDescription className="text-base md:text-lg mb-4">
                  {drink.description}
                </CardDescription>
                
                {/* Stats - Mobile Grid */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg backdrop-blur-sm">
                    <Clock className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs font-medium text-center">{drink.prepTime}</span>
                    <span className="text-xs text-muted-foreground">prep</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg backdrop-blur-sm">
                    <Users className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs font-medium text-center">1</span>
                    <span className="text-xs text-muted-foreground">serving</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg backdrop-blur-sm">
                    <Zap className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs font-medium text-center">{drink.calories}</span>
                    <span className="text-xs text-muted-foreground">cal</span>
                  </div>
                </div>
              </CardHeader>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Mobile-first Tabs */}
              <Tabs defaultValue="recipe" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
                  <TabsTrigger value="recipe" className="text-sm">
                    <BookOpen className="h-4 w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">{t("aiDrinkView.recipeTab") || "Recipe"}</span>
                    <span className="sm:hidden">Recipe</span>
                  </TabsTrigger>
                  <TabsTrigger value="ingredients" className="text-sm">
                    <Package className="h-4 w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Ingredients</span>
                    <span className="sm:hidden">Items</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recipe" className="space-y-6">
                  {/* Ingredients Card - Mobile Optimized */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span>{t("aiDrinkView.ingredients") || "Ingredients"}</span>
                      </CardTitle>
                      <CardDescription>
                        {t("aiDrinkView.ingredientsDesc") || "Everything you need for this drink"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {drink.ingredients.map((ingredient: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 flex justify-between items-center">
                              <span className="text-sm md:text-base leading-relaxed">{ingredient.name}</span>
                              <span className="text-sm font-medium text-primary ml-2">{ingredient.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instructions Card - Mobile Optimized */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <Droplets className="h-5 w-5 text-orange-600" />
                        <span>{t("aiDrinkView.instructions") || "Instructions"}</span>
                      </CardTitle>
                      <CardDescription>
                        {t("aiDrinkView.instructionsDesc") || "Tap each step when completed"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {enhancedInstructions.map((instruction, index) => (
                          <div
                            key={index}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer active:scale-95 ${
                              completedSteps.includes(index)
                                ? "bg-primary/10 border-primary shadow-md"
                                : "bg-background border-border hover:border-primary/50 hover:shadow-lg"
                            }`}
                            onClick={() => toggleStep(index)}
                          >
                            <div className="flex items-start space-x-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0 ${
                                  completedSteps.includes(index)
                                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                    : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
                                }`}
                              >
                                {completedSteps.includes(index) ? (
                                  <Check className="h-5 w-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className={`text-base leading-relaxed transition-all duration-300 break-words ${
                                  completedSteps.includes(index) 
                                    ? 'line-through text-muted-foreground' 
                                    : 'text-foreground'
                                }`}>
                                  {instruction.text}
                                </p>
                                
                                {!completedSteps.includes(index) && (
                                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
                                      <Timer className="h-3 w-3 mr-1" />
                                      ~{instruction.estimatedTime} {t("aiDrinkView.min") || "min"}
                                    </span>
                                    <span className="text-muted-foreground italic">
                                      {instruction.tip}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {completedSteps.includes(index) && (
                              <div className="absolute top-3 right-3">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Health Benefits Card */}
                  {drink.nutritionHighlights && drink.nutritionHighlights.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-primary" />
                          <span>{t("aiDrinkView.healthBenefits") || "Health Benefits"}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {drink.nutritionHighlights.map((benefit: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              <span className="text-sm">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Pro Tips Card */}
                  {drink.tips && drink.tips.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-primary" />
                          <span>{t("aiDrinkView.proTips") || "Pro Tips"}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {drink.tips.map((tip: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-primary mt-1">💡</span>
                              <span className="text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="ingredients" className="space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Package className="h-5 w-5 text-primary" />
                          <span>Ingredients Selector</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllIngredients}
                          className="text-xs"
                        >
                          {selectedIngredients.length === drink.ingredients.length 
                            ? "Deselect All" 
                            : "Select All"
                          }
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Select ingredients to add to your shopping cart
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {drink.ingredients.map((ingredient: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={`ingredient-${index}`}
                              checked={selectedIngredients.includes(ingredient.name)}
                              onCheckedChange={() => handleIngredientToggle(ingredient.name)}
                              className="flex-shrink-0"
                            />
                            <label
                              htmlFor={`ingredient-${index}`}
                              className="flex-1 flex justify-between items-center cursor-pointer"
                            >
                              <span className="text-sm md:text-base">{ingredient.name}</span>
                              <span className="text-sm font-medium text-primary">{ingredient.amount}</span>
                            </label>
                          </div>
                        ))}
                      </div>

                      {selectedIngredients.length > 0 && (
                        <div className="flex justify-center pt-4 border-t mt-6">
                          <Button
                            onClick={() => handleAddToCart()}
                            className="flex-1 bg-primary hover:bg-primary/90 h-12 max-w-xs"
                            size="lg"
                          >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Cart ({selectedIngredients.length})
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </div>

            {/* Sidebar - Mobile Responsive */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("aiDrinkView.nutritionInfo") || "Nutrition Info"}</CardTitle>
                  <CardDescription>{t("aiDrinkView.perServing") || "Per serving"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-1 md:gap-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{t("aiDrinkView.calories") || "Calories"}</span>
                      <span>{drink.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("aiDrinkView.naturalSugars") || "Natural Sugars"}</span>
                      <span>{Math.floor(drink.calories * 0.6 / 4)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("aiDrinkView.vitaminC") || "Vitamin C"}</span>
                      <span>{Math.floor(Math.random() * 50) + 20}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("aiDrinkView.fiber") || "Fiber"}</span>
                      <span>{Math.floor(Math.random() * 5) + 1}g</span>
                    </div>
                    <div className="flex justify-between col-span-2 md:col-span-1">
                      <span>{t("aiDrinkView.antioxidants") || "Antioxidants"}</span>
                      <span>{t("aiDrinkView.high") || "High"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Timer className="h-5 w-5 text-primary" />
                    <span>{t("aiDrinkView.prepProgress") || "Preparation Progress"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {Math.round((completedSteps.length / enhancedInstructions.length) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {completedSteps.length} {t("aiDrinkView.of") || 'of'} {enhancedInstructions.length} {t("aiDrinkView.stepsCompleted") || 'steps completed'}
                    </p>
                    <div className="w-full bg-muted rounded-full h-3 mb-4">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(completedSteps.length / enhancedInstructions.length) * 100}%` }}
                      ></div>
                    </div>
                    {completedSteps.length === enhancedInstructions.length && enhancedInstructions.length > 0 && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary font-medium">{t("aiDrinkView.enjoy") || "🎉 Enjoy your healthy drink!"}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default AIDrinkView;