import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChefHat, ArrowLeft, ArrowRight, Wand2, Eye, Salad, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import AIMealCreatorStepper from "./AIMealCreatorStepper";
import AIMealView from "./AIMealView";
import PageSizeSelector from "./PageSizeSelector";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { getSpecialMealsByUser } from "@/services/userMealPlansService";
import { useLanguage } from "@/contexts/LanguageContext"; // <-- Add this line

const AIMealCreator = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [apiMeals, setApiMeals] = useState<any[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { aiMeals, addAIMeal, user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage(); // <-- Add this line

  // Fetch meals from API when component mounts or when pagination changes
  useEffect(() => {
    if (user?.id) {
      fetchUserMeals(currentPage, pageSize);
    }
  }, [user?.id, currentPage, pageSize]);

  const fetchUserMeals = async (page: number = 1, limit: number = 5) => {
    if (!user?.id) return;

    setIsLoadingMeals(true);
    try {
      console.log('Fetching special meals for user:', user.id, 'page:', page, 'limit:', limit);
      
      const response = await getSpecialMealsByUser(user.id, page, limit);
      
      if (response.data && Array.isArray(response.data)) {
        setApiMeals(response.data);
        setTotalPages(response.totalPages || 1);
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

  // Calculate pagination for local AI meals only
  const totalLocalMeals = aiMeals.length;
  const localTotalPages = Math.ceil(totalLocalMeals / pageSize);
  const localStartIndex = (currentPage - 1) * pageSize;
  const localEndIndex = localStartIndex + pageSize;
  const currentPageLocalMeals = aiMeals.slice(localStartIndex, localEndIndex);

  // Combine totals for display
  const totalMealsCount = totalLocalMeals + apiMeals.length;
  const currentPageMealsCount = currentPageLocalMeals.length + apiMeals.length;

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
    // Reset to first page when new meal is added
    setCurrentPage(1);
    // Refresh API meals after creating a new one
    fetchUserMeals(1, pageSize);
  };

  const handleViewMeal = (meal: any) => {
    setSelectedMeal(meal);
  };

  const handleViewApiMeal = (apiMeal: any) => {
    console.log('selected meal ',apiMeal)
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
      ingredients: apiMeal.specialMeal.ingredientsList.map((ing: any) => `${ing.quantity} ${ing.unit} ${ing.name}`) || [],
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
    console.log('this is the transformed meal',transformedMeal)
    setSelectedMeal(transformedMeal);
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= Math.max(localTotalPages, totalPages)) {
      console.log(`Changing to page: ${page}`);
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    console.log(`Changing page size to: ${newSize}`);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
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

  const maxTotalPages = Math.max(localTotalPages, totalPages);

  return (
    <div className="min-h-screen relative">
      {/* Food-themed Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-emerald-800/70 to-teal-900/80" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 bg-black/30 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/30">
              <Salad className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              {t("aiMealCreator.createMealTitle") || "Create a Meal"}
            </h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
            {t("aiMealCreator.createMealDesc") || "Create unique, personalized meals with AI based on your preferences, dietary needs, and available ingredients."}
          </p>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleStartCreation}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 shadow-lg shadow-emerald-500/30"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            {t("aiMealCreator.createAIMealBtn") || "Create AI Meal"}
          </Button>
        </div>

        {!isLoadingMeals && totalMealsCount > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <PageSizeSelector 
              pageSize={pageSize} 
              onPageSizeChange={handlePageSizeChange}
            />
            <div className="text-sm text-white drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
              {t("aiMealCreator.showingPage") || "Showing page"} {currentPage} {t("aiMealCreator.of") || "of"} {maxTotalPages} ({currentPageMealsCount} {t("aiMealCreator.meals") || "meals"})
            </div>
          </div>
        )}

        {isLoadingMeals && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
              <p className="text-emerald-100">{t("aiMealCreator.loadingMeals") || "Loading your meals..."}</p>
            </div>
          </div>
        )}

        {!isLoadingMeals && totalMealsCount > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-white drop-shadow-lg">{t("aiMealCreator.yourAIMealsTitle") || "Your AI Created Meals"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Local AI Meals */}
              {currentPageLocalMeals.map((meal, index) => (
                <Card key={`local-${index}`} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                        <ChefHat className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg text-gray-800">{meal.name}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-500">
                      {meal.cuisine} • {meal.cookingTime} mins • {meal.difficulty}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {meal.tags?.slice(0, 3).map((tag: string, tagIndex: number) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleViewMeal(meal)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("aiMealCreator.viewRecipeBtn") || "View Recipe"}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* API Meals */}
              {apiMeals.map((meal, index) => (
                <Card key={`api-${meal._id || index}`} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500">
                        <ChefHat className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg text-gray-800">{meal.specialMeal.specialMeal.name}</CardTitle>
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                        {t("aiMealCreator.savedLabel") || "Saved"}
                      </span>
                    </div>
                    <CardDescription className="text-gray-500">
                      {meal.cuisinePreferences?.[0] || 'Various'} • {meal.specialMeal.specialMeal.cookingTime || meal.maxCookingTime} {t("aiMealCreator.mins") || "mins"} • {meal.cookingSkillLevel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{meal.specialMeal.specialMeal.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        {meal.mealType}
                      </span>
                      {meal.dietaryRestrictions?.slice(0, 2).map((restriction: string, tagIndex: number) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                        >
                          {restriction}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {meal.specialMeal.specialMeal.calories} cal • {meal.numberPeople} {t("aiMealCreator.peopleLabel") || "people"}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleViewApiMeal(meal)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("aiMealCreator.viewRecipeBtn") || "View Recipe"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {maxTotalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-emerald-50"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: maxTotalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 || 
                          page === maxTotalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === currentPage}
                                className={`cursor-pointer ${page === currentPage ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'hover:bg-emerald-50'}`}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 && currentPage < maxTotalPages - 2)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage >= maxTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-emerald-50"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoadingMeals && totalMealsCount === 0 && (
          <Card className="text-center py-12 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent>
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Salad className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{t("aiMealCreator.noMealsTitle") || "No Meals created yet"}</h3>
                  <p className="text-gray-600 mb-4">
                    {t("aiMealCreator.noMealsDesc") || "Start creating your first AI-powered meal based on your preferences and ingredients."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIMealCreator;
