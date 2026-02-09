
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets, Eye, Wine, Clock, Users, Leaf, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AIDrinkCreatorStepper from "./AIDrinkCreatorStepper";
import AIDrinkView from "./AIDrinkView";
import DrinkDetailView from "./DrinkDetailView";
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
import { getDrinksByUser, ApiDrink } from "@/services/drinkService";
import { useToast } from "@/hooks/use-toast";

const AIDrinkCreator = () => {
  const [showStepper, setShowStepper] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<any>(null);
  const [selectedApiDrink, setSelectedApiDrink] = useState<ApiDrink | null>(null);
  const [apiDrinks, setApiDrinks] = useState<ApiDrink[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { user, aiDrinks, addAIDrink } = useUser();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchUserDrinks(currentPage, pageSize);
    }
  }, [user?.id, currentPage, pageSize]);

  const fetchUserDrinks = async (page: number = 1, limit: number = 5) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('Fetching drinks for user:', user.id, 'page:', page, 'limit:', limit);
      
      const response = await getDrinksByUser(user.id, page, limit);
      setApiDrinks(response.data || []);
      setTotalPages(response.totalPages || 1);
      console.log('Fetched user drinks:', response.data);
    } catch (error) {
      console.error('Failed to fetch user drinks:', error);
      toast({
        title: "Error",
        description: "Failed to load your drinks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Changing to page: ${page}`);
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    console.log(`Changing page size to: ${newSize}`);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleStartCreation = () => {
    setShowStepper(true);
  };

  const handleBackToList = () => {
    setShowStepper(false);
    setSelectedDrink(null);
    setSelectedApiDrink(null);
  };

  const handleDrinkCreated = (drink: any) => {
    const newDrink = {
      ...drink,
      id: Date.now().toString()
    };
    addAIDrink(newDrink);
    setShowStepper(false);
    // Refresh API drinks list and reset to first page
    setCurrentPage(1);
    fetchUserDrinks(1, pageSize);
  };

  const handleViewDrink = (drink: any) => {
    setSelectedDrink(drink);
  };

  const handleViewApiDrink = (drink: ApiDrink) => {
    setSelectedApiDrink(drink);
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

  if (selectedApiDrink) {
    return (
      <DrinkDetailView 
        drink={selectedApiDrink}
        onBack={handleBackToList}
      />
    );
  }

  const totalDrinks = aiDrinks.length + apiDrinks.length;
  const hasApiDrinks = apiDrinks.length > 0;

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
        {/* Header Card */}
        <Card className="bg-black/30 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <Wine className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white drop-shadow-lg">
              {t("aiDrinkCreator.title") || "Create Your Perfect Healthy Drink"}
            </CardTitle>
            <CardDescription className="text-emerald-100/90">
              {t("aiDrinkCreator.desc") || "Let AI help you create delicious and nutritious drinks tailored to your health goals and preferences"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleStartCreation}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 text-lg shadow-lg shadow-emerald-500/30"
            >
              {t("aiDrinkCreator.start") || "Start Creating"}
            </Button>
          </CardContent>
        </Card>

        {/* API Created Drinks List */}
        {loading ? (
          <Card className="bg-white/10 backdrop-blur-sm border-0">
            <CardContent className="py-8 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-emerald-400" />
                <p className="text-emerald-100">{t("aiDrinkCreator.loading") || "Loading your drinks..."}</p>
              </div>
            </CardContent>
          </Card>
        ) : hasApiDrinks ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-black drop-shadow-lg">
              {t("aiDrinkCreator.yourCreatedDrinks") || "Your Created Drinks"}
            </h2>
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
              <PageSizeSelector 
                pageSize={pageSize} 
                onPageSizeChange={handlePageSizeChange}
              />
              <div className="text-sm text-white drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
                {t("aiDrinkCreator.showingPage") || 'Showing page'} {currentPage} {t("aiDrinkCreator.of") || 'of'} {totalPages} ({apiDrinks.length} {t("aiDrinkCreator.drinks") || 'drinks'})
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apiDrinks.map((drink) => (
                <Card key={drink._id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                        <Droplets className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg text-gray-800">{drink.drink_name}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-500">
                      {drink.drinkPlan.healthyDrink.drinkType} • {drink.drinkPlan.healthyDrink.cookingTime} {t("aiDrinkCreator.min") || "min"} • {drink.drinkPlan.healthyDrink.calories} {t("aiDrinkCreator.cal") || "cal"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{drink.drinkPlan.healthyDrink.description}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="h-3 w-3 text-emerald-500" />
                        <span>{drink.drinkPlan.healthyDrink.cookingTime}m</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users className="h-3 w-3 text-emerald-500" />
                        <span>{drink.numberPeople}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Leaf className="h-3 w-3 text-emerald-500" />
                        <span>{drink.drinkPlan.totalCarbonFootprint}kg</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {drink.drinkPlan.healthyDrink.nutritionalInfo.vitamins?.slice(0, 3).map((vitamin, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                        >
                          {t("aiDrinkCreator.vitamin") || "Vit"} {vitamin}
                        </span>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleViewApiDrink(drink)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("aiDrinkCreator.viewRecipe") || "View Recipe"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 || 
                          page === totalPages || 
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
                          (page === currentPage + 2 && currentPage < totalPages - 2)
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
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-emerald-50"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Local AI Drinks List (from context) */}
        {aiDrinks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-black drop-shadow-lg">
              {t("aiDrinkCreator.yourAIDrinks") || "Your AI Created Drinks"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aiDrinks.map((drink, index) => (
                <Card key={index} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500">
                        <Droplets className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg text-gray-800">{drink.name}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-500">
                      {drink.type} • {drink.prepTime} • {drink.calories} cal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{drink.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {drink.nutritionHighlights?.slice(0, 2).map((highlight: string, highlightIndex: number) => (
                        <span 
                          key={highlightIndex}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                        >
                          {highlight.split(' ').slice(0, 2).join(' ')}
                        </span>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleViewDrink(drink)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("aiDrinkCreator.viewRecipe") || "View Recipe"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for no saved drinks */}
        {totalDrinks === 0 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader>
                <CardTitle className="text-gray-800">🥤 {t("aiDrinkCreator.smoothies") || "Smoothies"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("aiDrinkCreator.smoothiesDesc") || "Nutrient-packed smoothies for energy and wellness"}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
              <CardHeader>
                <CardTitle className="text-gray-800">🧃 {t("aiDrinkCreator.juices") || "Fresh Juices"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("aiDrinkCreator.juicesDesc") || "Vitamin-rich fresh juices for detox and health"}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader>
                <CardTitle className="text-gray-800">🍵 {t("aiDrinkCreator.teas") || "Wellness Teas"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("aiDrinkCreator.teasDesc") || "Herbal and wellness teas for relaxation and health"}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDrinkCreator;
