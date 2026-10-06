import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChefHat, ArrowLeft, ArrowRight, Wand2, Eye, Salad, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { useLanguage } from "@/contexts/LanguageContext";

const AIMealCreator = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [apiMeals, setApiMeals] = useState<any[]>([]);
  const [allApiMeals, setAllApiMeals] = useState<any[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { aiMeals, addAIMeal, user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch meals from API when component mounts or when pagination changes
  useEffect(() => {
    if (user?.id) {
      if (isMobile) {
        if (currentPage === 1) {
          fetchUserMeals(1, 5, true);
        }
      } else {
        fetchUserMeals(currentPage, pageSize, false);
      }
    }
  }, [user?.id, currentPage, pageSize, isMobile]);

  // Infinite scroll observer for mobile
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMeals && !isLoadingMore && currentPage < totalPages) {
          loadMoreMeals();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isMobile, isLoadingMeals, isLoadingMore, currentPage, totalPages]);

  // Listen for open-ai-meal event to navigate to the generated meal detail
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const meal = ce.detail?.meal;
      if (meal) {
        setShowCreator(false);
        setSelectedMeal(meal);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (user?.id) {
        setCurrentPage(1);
        setAllApiMeals([]);
        fetchUserMeals(1, isMobile ? 5 : pageSize, isMobile);
      }
    };
    window.addEventListener("open-ai-meal", handler);
    return () => window.removeEventListener("open-ai-meal", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isMobile, pageSize]);

  const loadMoreMeals = async () => {
    if (!user?.id || isLoadingMore) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await getSpecialMealsByUser(user.id, nextPage, 5);
      if (response.data && Array.isArray(response.data)) {
        setAllApiMeals(prev => [...prev, ...response.data]);
        setCurrentPage(nextPage);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading more meals:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchUserMeals = async (page: number = 1, limit: number = 5, isInfiniteScroll: boolean = false) => {
    if (!user?.id) return;

    setIsLoadingMeals(true);
    try {
      console.log('Fetching special meals for user:', user.id, 'page:', page, 'limit:', limit);
      
      const response = await getSpecialMealsByUser(user.id, page, limit);
      
      if (response.data && Array.isArray(response.data)) {
        if (isInfiniteScroll) {
          setAllApiMeals(response.data);
        }
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
    setShowCreator(false);
    setCurrentPage(1);
    setAllApiMeals([]);
    fetchUserMeals(1, isMobile ? 5 : pageSize, isMobile);
    toast({
      title: t("aiMealGenerator.save") || "Meal saved successfully!",
    });
  };

  const handleViewMeal = (meal: any) => {
    setSelectedMeal(meal);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarkAsDone = async (mealId: string, mealName: string, isFromApi: boolean = false) => {
    try {
      // TODO: Integrate with backend service
      // Example: await markMealAsConsumed(mealId, user?.id);
      console.log('Mark as done:', { mealId, isFromApi, userId: user?.id });
      
      toast({
        title: "✅ " + (t("aiMealCreator.markAsDoneSuccess") || "Meal marked as consumed successfully!"),
        description: mealName,
      });
    } catch (error) {
      console.error('Error marking meal as done:', error);
      toast({
        title: t("aiMealCreator.markAsDoneError") || "Failed to mark meal as consumed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewApiMeal = (apiMeal: any) => {
    console.log('selected meal ',apiMeal)
    const transformedMeal = {
      id: apiMeal.planId || apiMeal._id,
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-accent/90" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="bg-primary/40 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
              <Salad className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {t("aiMealCreator.createMealTitle") || "Create a Meal"}
              </h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mt-0.5">
                {t("aiMealCreator.createMealDesc") || "Create unique, personalized meals with AI based on your preferences, dietary needs, and available ingredients."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleStartCreation}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white px-8 py-3 shadow-lg shadow-primary/30"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            {t("aiMealCreator.createAIMealBtn") || "Create AI Meal"}
          </Button>
        </div>

        {!isMobile && !isLoadingMeals && totalMealsCount > 0 && (
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            currentPage={currentPage}
            totalPages={maxTotalPages}
            itemCount={currentPageMealsCount}
            itemLabel={t("aiMealCreator.meals") || "meals"}
          />
        )}

        {isLoadingMeals && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-foreground/80" />
              <p className="text-primary-foreground">{t("aiMealCreator.loadingMeals") || "Loading your meals..."}</p>
            </div>
          </div>
        )}

        {!isLoadingMeals && totalMealsCount > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-2xl font-semibold text-center text-foreground">{t("aiMealCreator.yourAIMealsTitle") || "Your AI Created Meals"}</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Local AI Meals */}
              {currentPageLocalMeals.map((meal, index) => (
                <Card key={`local-${index}`} className="group bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                  <CardHeader className="pb-2 pt-4 sm:pt-5 px-3 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0">
                          <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <CardTitle className="text-sm sm:text-lg text-foreground truncate">{meal.name}</CardTitle>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 text-primary" />{meal.cookingTime}m
                      </span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">{meal.cuisine}</span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">{meal.difficulty}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 sm:pb-4 px-3 sm:px-6">
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-2">{meal.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {meal.tags?.slice(0, 3).map((tag: string, tagIndex: number) => (
                        <span key={tagIndex} className="px-2 py-0.5 bg-primary/10 text-primary-foreground/80 text-[10px] rounded-full">{tag}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button variant="outline" size="sm" className="flex-1 text-xs border-primary/30 text-primary hover:bg-primary/10" onClick={() => handleViewMeal(meal)}>
                        <Eye className="h-3.5 w-3.5 mr-1" />{t("aiMealCreator.viewRecipeBtn") || "View Recipe"}
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white" onClick={() => handleMarkAsDone(meal.id || index.toString(), meal.name, false)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* API Meals */}
              {(isMobile ? allApiMeals : apiMeals).map((meal, index) => (
                <Card key={`api-${meal.planId || meal._id || index}`} className="group bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-accent to-primary" />
                  <CardHeader className="pb-2 pt-4 sm:pt-5 px-3 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-accent to-primary shrink-0">
                          <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <CardTitle className="text-sm sm:text-lg text-foreground truncate">{meal.specialMeal.specialMeal.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 bg-accent/10 text-accent-foreground text-[10px] rounded-full">{t("aiMealCreator.savedLabel") || "Saved"}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 text-primary" />{meal.specialMeal.specialMeal.cookingTime || meal.maxCookingTime}m
                      </span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">{meal.cuisinePreferences?.[0] || 'Various'}</span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">{meal.cookingSkillLevel}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 sm:pb-4 px-3 sm:px-6">
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-2">{meal.specialMeal.specialMeal.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary-foreground/80 text-[10px] rounded-full">{meal.mealType}</span>
                      {meal.dietaryRestrictions?.slice(0, 2).map((restriction: string, tagIndex: number) => (
                        <span key={tagIndex} className="px-2 py-0.5 bg-accent/10 text-accent-foreground text-[10px] rounded-full">{restriction}</span>
                      ))}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-2">
                      {meal.specialMeal.specialMeal.calories} cal • {meal.numberPeople} {t("aiMealCreator.peopleLabel") || "people"}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button variant="outline" size="sm" className="flex-1 text-xs border-primary/30 text-primary hover:bg-primary/10" onClick={() => handleViewApiMeal(meal)}>
                        <Eye className="h-3.5 w-3.5 mr-1" />{t("aiMealCreator.viewRecipeBtn") || "View Recipe"}
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white" onClick={() => handleMarkAsDone(meal.planId || meal._id, meal.specialMeal.specialMeal.name, true)}>
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
                {currentPage >= totalPages && allApiMeals.length > 0 && (
                  <p className="text-center text-white/60 text-sm py-4">
                    {t("aiMealCreator.noMoreMeals") || "You've seen all your meals"}
                  </p>
                )}
              </>
            )}

            {/* Pagination - desktop only */}
            {!isMobile && maxTotalPages > 1 && (
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
                                className={`cursor-pointer ${page === currentPage ? 'bg-primary text-white hover:bg-primary' : 'hover:bg-primary/5'}`}
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
                          className={currentPage >= maxTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/5"}
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
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
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
