
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Users, Coffee, Clock, Sparkles } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import DrinkCreatorStepper from "./DrinkCreatorStepper";
import DrinkView from "./DrinkView";

const HealthyDrinks = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const isNavigatingBack = useRef(false);
  const { user, healthyDrinks, addHealthyDrink, getHealthyDrinkById } = useUser();

  const handleDrinkCreated = (newDrink: any) => {
    console.log('New drink created:', newDrink);
    addHealthyDrink(newDrink);
    setShowCreator(false);
    setSelectedDrink(newDrink);
    setIsEditing(false);
    isNavigatingBack.current = false;
  };

  const handleEditDrink = () => {
    setIsEditing(true);
    setShowCreator(true);
    isNavigatingBack.current = false;
  };

  const handleBackToDrinks = () => {
    console.log('Navigating back to healthy drinks - resetting all states');
    isNavigatingBack.current = true;
    setShowCreator(false);
    setSelectedDrink(null);
    setIsEditing(false);
  };

  const handleDrinkSelect = (drink: any) => {
    // Get the most up-to-date version of the drink from context
    const updatedDrink = getHealthyDrinkById(drink.id) || drink;
    console.log('Selecting drink:', updatedDrink);
    setSelectedDrink(updatedDrink);
    setShowCreator(false);
    setIsEditing(false);
    isNavigatingBack.current = false;
  };

  // Update selected drink when context changes - but only if we're viewing a drink and not navigating back
  useEffect(() => {
    if (selectedDrink && !showCreator && !isNavigatingBack.current) {
      const updatedDrink = getHealthyDrinkById(selectedDrink.id);
      if (updatedDrink) {
        setSelectedDrink(updatedDrink);
      }
    }
  }, [healthyDrinks, selectedDrink?.id, getHealthyDrinkById, showCreator]);

  // Show drink view when a drink is selected and not in creator mode
  if (selectedDrink && !showCreator) {
    return (
      <DrinkView 
        drink={selectedDrink} 
        onBack={handleBackToDrinks}
        onEdit={handleEditDrink}
      />
    );
  }

  // Show creator when in creator mode
  if (showCreator) {
    return (
      <DrinkCreatorStepper
        initialData={isEditing ? selectedDrink : undefined}
        onDrinkCreated={handleDrinkCreated}
        onBack={handleBackToDrinks}
        isEditing={isEditing}
      />
    );
  }

  // Default view: show healthy drinks dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Healthy Drinks</h1>
          <p className="text-gray-600 mt-1">Create and manage your healthy drink recipes</p>
        </div>
        <Button 
          onClick={() => {
            console.log('Creating new healthy drink');
            setShowCreator(true);
            setSelectedDrink(null);
            setIsEditing(false);
            isNavigatingBack.current = false;
          }}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create AI Healthy Drink
        </Button>
      </div>

      {/* Healthy Drinks Grid */}
      {healthyDrinks && healthyDrinks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthyDrinks.map((drink) => (
            <Card 
              key={drink.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleDrinkSelect(drink)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-green-500" />
                  {drink.name}
                </CardTitle>
                <CardDescription>
                  {drink.category || 'Healthy Drink'} • {drink.servings || 1} serving{drink.servings > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{drink.prepTime || '5'} minutes prep</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>For {drink.preferences?.people || 'any'} people</span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {drink.ingredients?.length || 0} ingredients
                  </div>
                  {drink.healthBenefits && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      {drink.healthBenefits.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to AI Healthy Drinks, {user?.name?.split(' ')[0] || 'Friend'}!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Create your first personalized healthy drink recipe with our AI assistant. 
                  Get customized drinks based on your health goals, taste preferences, and dietary needs.
                </p>
              </div>
              <Button 
                onClick={() => {
                  console.log('Creating first healthy drink');
                  setShowCreator(true);
                  setSelectedDrink(null);
                  setIsEditing(false);
                  isNavigatingBack.current = false;
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white mt-4"
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Create Your First AI Healthy Drink
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthyDrinks;
