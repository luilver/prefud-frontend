
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets, Eye, Wine } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import AIDrinkCreatorStepper from "./AIDrinkCreatorStepper";
import AIDrinkView from "./AIDrinkView";

const AIDrinkCreator = () => {
  const [showStepper, setShowStepper] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<any>(null);
  const { aiDrinks, addAIDrink } = useUser();

  const handleStartCreation = () => {
    setShowStepper(true);
  };

  const handleBackToList = () => {
    setShowStepper(false);
    setSelectedDrink(null);
  };

  const handleDrinkCreated = (drink: any) => {
    const newDrink = {
      ...drink,
      id: Date.now().toString()
    };
    addAIDrink(newDrink);
    setShowStepper(false);
  };

  const handleViewDrink = (drink: any) => {
    setSelectedDrink(drink);
  };

  if (showStepper) {
    return (
      <AIDrinkCreatorStepper 
        onBack={handleBackToList}
        onDrinkCreated={handleDrinkCreated}
      />
    );
  }

  if (selectedDrink) {
    return (
      <AIDrinkView 
        drink={selectedDrink}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
     

      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Wine className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-800">Create Your Perfect Healthy Drink</CardTitle>
          <CardDescription className="text-green-600">
            Let AI help you create delicious and nutritious drinks tailored to your health goals and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={handleStartCreation}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Creating
          </Button>
        </CardContent>
      </Card>

      {/* Created Drinks List */}
      {aiDrinks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center text-green-800">Your AI Created Drinks</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aiDrinks.map((drink, index) => (
              <Card key={index} className="border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg text-green-800">{drink.name}</CardTitle>
                  </div>
                  <CardDescription className="text-green-600">
                    {drink.type} • {drink.prepTime} • {drink.calories} cal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-3">{drink.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {drink.nutritionHighlights?.slice(0, 2).map((highlight: string, highlightIndex: number) => (
                      <span 
                        key={highlightIndex}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                      >
                        {highlight.split(' ').slice(0, 2).join(' ')}
                      </span>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => handleViewDrink(drink)}
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

      {/* Empty State for no saved drinks */}
      {aiDrinks.length === 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">🥤 Smoothies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600">Nutrient-packed smoothies for energy and wellness</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">🧃 Fresh Juices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600">Vitamin-rich fresh juices for detox and health</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">🍵 Wellness Teas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600">Herbal and wellness teas for relaxation and health</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AIDrinkCreator;
