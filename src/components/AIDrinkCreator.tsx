
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Droplets, Eye, Wine, Clock, Users, Leaf, Loader2, CheckCircle2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [allApiDrinks, setAllApiDrinks] = useState<ApiDrink[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { user, aiDrinks, addAIDrink } = useUser();
  const { t } = useLanguage();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      if (isMobile) {
        if (currentPage === 1) {
          fetchUserDrinks(1, 5, true);
        }
      } else {
        fetchUserDrinks(currentPage, pageSize, false);
      }
    }
  }, [user?.id, currentPage, pageSize, isMobile]);

  // Listen for open-drink event to navigate to the generated drink detail
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const drink = ce.detail?.drink;
      if (drink) {
        setShowStepper(false);
        setSelectedApiDrink(null);
        setSelectedDrink(drink);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Refresh the user's drinks list so newly created ones show up
      if (user?.id) {
        setCurrentPage(1);
        setAllApiDrinks([]);
        fetchUserDrinks(1, isMobile ? 5 : pageSize, isMobile);
      }
    };
    window.addEventListener("open-drink", handler);
    return () => window.removeEventListener("open-drink", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isMobile, pageSize]);

  // Infinite scroll observer for mobile
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isLoadingMore && currentPage < totalPages) {
          loadMoreDrinks();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isMobile, loading, isLoadingMore, currentPage, totalPages]);

  const loadMoreDrinks = async () => {
    if (!user?.id || isLoadingMore) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await getDrinksByUser(user.id, nextPage, 5);
      setAllApiDrinks(prev => [...prev, ...(response.data || [])]);
      setCurrentPage(nextPage);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading more drinks:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchUserDrinks = async (page: number = 1, limit: number = 5, isInfiniteScroll: boolean = false) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('Fetching drinks for user:', user.id, 'page:', page, 'limit:', limit);
      
      const response = await getDrinksByUser(user.id, page, limit);
      if (isInfiniteScroll) {
        setAllApiDrinks(response.data || []);
      }
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
    setCurrentPage(1);
    setAllApiDrinks([]);
    fetchUserDrinks(1, isMobile ? 5 : pageSize, isMobile);
  };

  const handleViewDrink = (drink: any) => {
    setSelectedDrink(drink);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewApiDrink = (drink: ApiDrink) => {
    setSelectedApiDrink(drink);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarkAsDone = async (drinkId: string, drinkName: string, isFromApi: boolean = false) => {
    try {
      // TODO: Integrate with backend service when ready
      // await markDrinkAsConsumed(drinkId, isFromApi);
      
      toast({
        title: "✅ " + (t("aiDrinkCreator.markAsDoneSuccess") || "Drink marked as consumed successfully!"),
        description: drinkName,
      });
    } catch (error) {
      console.error('Failed to mark drink as done:', error);
      toast({
        title: t("aiDrinkCreator.markAsDoneError") || "Failed to mark drink as consumed",
        variant: "destructive",
      });
    }
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

  const totalDrinks = aiDrinks.length + (isMobile ? allApiDrinks.length : apiDrinks.length);
  const hasApiDrinks = isMobile ? allApiDrinks.length > 0 : apiDrinks.length > 0;

  return (
    <div className="min-h-screen relative">
      {/* Food-themed Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-accent/80" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header Card */}
        <div className="bg-primary/40 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
              <Wine className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {t("aiDrinkCreator.title") || "Create Your Perfect Healthy Drink"}
              </h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mt-0.5">
                {t("aiDrinkCreator.desc") || "Let AI help you create delicious and nutritious drinks tailored to your health goals and preferences"}
              </p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <Button 
              onClick={handleStartCreation}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white px-6 py-2 shadow-lg shadow-primary/30 w-full sm:w-auto"
            >
              {t("aiDrinkCreator.start") || "Start Creating"}
            </Button>
          </div>
        </div>

        {/* API Created Drinks List */}
        {loading ? (
          <Card className="bg-white/10 backdrop-blur-sm border-0">
            <CardContent className="py-8 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary-foreground/80" />
                <p className="text-primary-foreground">{t("aiDrinkCreator.loading") || "Loading your drinks..."}</p>
              </div>
            </CardContent>
          </Card>
        ) : hasApiDrinks ? (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-2xl font-semibold text-center text-foreground">
              {t("aiDrinkCreator.yourCreatedDrinks") || "Your Created Drinks"}
            </h2>
            
            {/* Pagination Controls - desktop only */}
            {!isMobile && (
              <PageSizeSelector
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                currentPage={currentPage}
                totalPages={totalPages}
                itemCount={apiDrinks.length}
                itemLabel={t("aiDrinkCreator.drinks") || "drinks"}
              />
            )}

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(isMobile ? allApiDrinks : apiDrinks).map((drink) => (
                <Card key={drink.planId || drink._id} className="group bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                  <CardHeader className="pb-2 pt-4 sm:pt-5 px-3 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0">
                          <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <CardTitle className="text-sm sm:text-lg text-foreground truncate">{drink.drink_name}</CardTitle>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 text-primary" />{drink.drinkPlan.healthyDrink.cookingTime}m
                      </span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
                        {drink.drinkPlan.healthyDrink.drinkType}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
                        {drink.drinkPlan.healthyDrink.calories} cal
                      </span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
                        <Users className="w-3 h-3 text-primary" />{drink.numberPeople}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
                        <Leaf className="w-3 h-3 text-primary" />{drink.drinkPlan.totalCarbonFootprint}kg
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 sm:pb-4 px-3 sm:px-6">
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-2">{drink.drinkPlan.healthyDrink.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {drink.drinkPlan.healthyDrink.nutritionalInfo.vitamins?.slice(0, 3).map((vitamin, index) => (
                        <span key={index} className="px-2 py-0.5 bg-primary/10 text-primary-foreground/80 text-[10px] rounded-full">
                          {t("aiDrinkCreator.vitamin") || "Vit"} {vitamin}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button variant="outline" size="sm" className="flex-1 text-xs border-primary/30 text-primary hover:bg-primary/10" onClick={() => handleViewApiDrink(drink)}>
                        <Eye className="h-3.5 w-3.5 mr-1" />{t("aiDrinkCreator.viewRecipe") || "View Recipe"}
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white" onClick={() => handleMarkAsDone(drink.planId || drink._id || '', drink.drink_name, true)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Infinite scroll sentinel for mobile */}
            {isMobile && (
              <>
                <div ref={loadMoreRef} className="h-4" />
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-foreground/80" />
                    <span className="ml-2 text-primary-foreground text-sm">Loading more...</span>
                  </div>
                )}
                {currentPage >= totalPages && allApiDrinks.length > 0 && (
                  <p className="text-center text-white/60 text-sm py-4">
                    {t("aiDrinkCreator.noMoreDrinks") || "You've seen all your drinks"}
                  </p>
                )}
              </>
            )}

            {/* Pagination - desktop only */}
            {!isMobile && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/5"}
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
                                className={`cursor-pointer ${page === currentPage ? 'bg-primary text-white hover:bg-primary' : 'hover:bg-primary/5'}`}
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
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/5"}
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
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-primary">
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
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {highlight.split(' ').slice(0, 2).join(' ')}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-primary/20 text-primary hover:bg-primary/5"
                        onClick={() => handleViewDrink(drink)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("aiDrinkCreator.viewRecipe") || "View Recipe"}
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white"
                        onClick={() => handleMarkAsDone(drink.id || index.toString(), drink.name)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
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
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader>
                <CardTitle className="text-gray-800">🥤 {t("aiDrinkCreator.smoothies") || "Smoothies"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("aiDrinkCreator.smoothiesDesc") || "Nutrient-packed smoothies for energy and wellness"}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
              <CardHeader>
                <CardTitle className="text-gray-800">🧃 {t("aiDrinkCreator.juices") || "Fresh Juices"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("aiDrinkCreator.juicesDesc") || "Vitamin-rich fresh juices for detox and health"}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
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
