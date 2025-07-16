
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChefHat, ArrowLeft, ArrowRight, Wand2, Eye } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import AIMealCreatorStepper from "./AIMealCreatorStepper";
import AIMealView from "./AIMealView";

const AIMealCreator = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const { aiMeals, addAIMeal } = useUser();

  const handleStartCreation = () => {
    setShowCreator(true);
  };

  const handleBackToList = () => {
    setShowCreator(false);
    setSelectedMeal(null);
  };

  const handleMealCreated = (meal: any) => {
    const newMeal = {
      ...meal,
      id: Date.now().toString()
    };
    addAIMeal(newMeal);
    setShowCreator(false);
  };

  const handleViewMeal = (meal: any) => {
    setSelectedMeal(meal);
  };

  if (showCreator) {
    return (
      <AIMealCreatorStepper 
        onBack={handleBackToList}
        onMealCreated={handleMealCreated}
      />
    );
  }

  if (selectedMeal) {
    return (
      <AIMealView 
        meal={selectedMeal}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Meal Creator
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create unique, personalized meals with AI based on your preferences, dietary needs, and available ingredients.
        </p>
      </div>

      {/* Create New Meal Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleStartCreation}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
        >
          <Wand2 className="mr-2 h-5 w-5" />
          Create AI Meal
        </Button>
      </div>

      {/* Created Meals List */}
      {aiMeals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">Your AI Created Meals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aiMeals.map((meal, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {meal.cuisine} • {meal.cookingTime} mins • {meal.difficulty}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {meal.tags?.slice(0, 3).map((tag: string, tagIndex: number) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewMeal(meal)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {aiMeals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No AI meals created yet</h3>
                <p className="text-gray-600 mb-4">
                  Start creating your first AI-powered meal based on your preferences and ingredients.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIMealCreator;
