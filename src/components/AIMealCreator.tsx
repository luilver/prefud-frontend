
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChefHat, ArrowLeft, ArrowRight, Wand2, Eye, Salad, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import AIMealCreatorStepper from "./AIMealCreatorStepper";
import AIMealView from "./AIMealView";
import { useToast } from "@/hooks/use-toast";

const AIMealCreator = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [apiMeals, setApiMeals] = useState<any[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const { aiMeals, addAIMeal, user } = useUser();
  const { toast } = useToast();

  // Fetch meals from API when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchUserMeals();
    }
  }, [user?.id]);

  const fetchUserMeals = async () => {
    if (!user?.id) return;

    setIsLoadingMeals(true);
    try {
      console.log('Fetching meals for user:', user.id);
      
      const response = await fetch(`https://pantry-ms-brain.onrender.com/meal-plan/special/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched API meals:', data);
      
      if (data.data && Array.isArray(data.data)) {
        setApiMeals(data.data);
      }
    } catch (error) {
      console.error('Error fetching user meals:', error);
      toast({
        title: "Error loading meals",
        description: "Failed to load your meals from the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMeals(false);
    }
  };

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
    // Refresh API meals after creating a new one
    fetchUserMeals();
  };

  const handleViewMeal = (meal: any) => {
    setSelectedMeal(meal);
  };

  const handleViewApiMeal = (apiMeal: any) => {
    // Transform API meal data to match the expected format
    const transformedMeal = {
      id: apiMeal._id,
      name: apiMeal.specialMeal.specialMeal.name,
      description: apiMeal.specialMeal.specialMeal.description,
      cuisine: apiMeal.cuisinePreferences?.[0] || 'Various',
      cookingTime: apiMeal.specialMeal.specialMeal.cookingTime || apiMeal.maxCookingTime,
      difficulty: apiMeal.cookingSkillLevel,
      tags: [
        apiMeal.mealType,
        ...(apiMeal.dietaryRestrictions || []),
        ...(apiMeal.cuisinePreferences?.slice(0, 2) || [])
      ],
      ingredients: apiMeal.specialMeal.specialMeal.ingredients?.map((ing: any) => `${ing.quantity} ${ing.unit} ${ing.name}`) || [],
      instructions: apiMeal.specialMeal.specialMeal.steps || [],
      calories: apiMeal.specialMeal.specialMeal.calories,
      prepTime: `${apiMeal.specialMeal.specialMeal.cookingTime || 30} mins`,
      benefits: apiMeal.specialMeal.specialMeal.benefits,
      prepTip: apiMeal.specialMeal.specialMeal.prepTip,
      carbonFootprint: apiMeal.specialMeal.totalCarbonFootprint,
      nutritionalInfo: apiMeal.specialMeal.specialMeal.nutritionalInfo,
      ingredientsList: apiMeal.specialMeal.ingredientsList,
      isFromApi: true
    };
    setSelectedMeal(transformedMeal);
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

  // Combine local AI meals and API meals
  const totalMeals = [...aiMeals, ...apiMeals];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Salad className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create a Meal
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

      {/* Loading State */}
      {isLoadingMeals && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-500" />
            <p className="text-gray-600">Loading your meals...</p>
          </div>
        </div>
      )}

      {/* Created Meals List */}
      {!isLoadingMeals && totalMeals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">Your AI Created Meals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Local AI Meals */}
            {aiMeals.map((meal, index) => (
              <Card key={`local-${index}`} className="hover:shadow-lg transition-shadow">
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

            {/* API Meals */}
            {apiMeals.map((apiMeal, index) => (
              <Card key={`api-${apiMeal._id || index}`} className="hover:shadow-lg transition-shadow border-green-200">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">{apiMeal.specialMeal.specialMeal.name}</CardTitle>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Saved
                    </span>
                  </div>
                  <CardDescription>
                    {apiMeal.cuisinePreferences?.[0] || 'Various'} • {apiMeal.specialMeal.specialMeal.cookingTime || apiMeal.maxCookingTime} mins • {apiMeal.cookingSkillLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{apiMeal.specialMeal.specialMeal.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {apiMeal.mealType}
                    </span>
                    {apiMeal.dietaryRestrictions?.slice(0, 2).map((restriction: string, tagIndex: number) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                      >
                        {restriction}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {apiMeal.specialMeal.specialMeal.calories} cal • {apiMeal.numberPeople} people
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewApiMeal(apiMeal)}
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
      {!isLoadingMeals && totalMeals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Salad className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No Meals created yet</h3>
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
