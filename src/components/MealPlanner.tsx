import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Calendar,
  Users,
  ChefHat,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Baby,
  Smile,
  Leaf,
  ShoppingBasket,
  UtensilsCrossed,
  ArrowRight,
  Flame,
  Globe,
  Award,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/contexts/UserContext";
import MealPlanCreatorStepper from "./MealPlanCreatorStepper";
import MealPlanView from "./MealPlanView";
import MealPlanSuccessModal from "./MealPlanSuccessModal";
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
import { useLanguage } from "@/contexts/LanguageContext";

const MealPlanner = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default to 5 items per page
  const [totalPages, setTotalPages] = useState(1);
  const [currentPagePlans, setCurrentPagePlans] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]); // For infinite scroll
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedInitialPlans, setHasLoadedInitialPlans] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPlan, setSuccessPlan] = useState<any>(null);
  const isNavigatingBack = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const {
    user,
    mealPlans,
    addMealPlan,
    getMealPlanById,
    fetchMealPlansFromAPI,
  } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load meal plans when component mounts, page changes, or page size changes
  useEffect(() => {
    if (user?.id && !showCreator && !selectedMealPlan) {
      if (isMobile) {
        // For mobile infinite scroll, only load on mount or reset
        if (currentPage === 1) {
          loadMealPlans(1, 5, true);
        }
      } else {
        loadMealPlans(currentPage, pageSize, false);
      }
    }
  }, [user?.id, currentPage, pageSize, showCreator, selectedMealPlan, isMobile]);

  // Infinite scroll observer for mobile
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingPlans && !isLoadingMore && currentPage < totalPages) {
          loadMorePlans();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isMobile, isLoadingPlans, isLoadingMore, currentPage, totalPages]);

  const loadMorePlans = async () => {
    if (!user?.id || isLoadingMore) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await fetchMealPlansFromAPI(user.id, nextPage, 5);
      setAllPlans(prev => [...prev, ...(response.data || [])]);
      setCurrentPage(nextPage);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error loading more meal plans:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMealPlans = async (page: number, limit: number, isInfiniteScroll: boolean = false) => {
    if (!user?.id) return;

    setIsLoadingPlans(true);
    try {
      console.log(`Loading meal plans for page: ${page}, limit: ${limit}`);
      const response = await fetchMealPlansFromAPI(user.id, page, limit);
      console.log("this si the data of meal plans ", response.data);
      
      if (isInfiniteScroll) {
        setAllPlans(response.data || []);
      }
      setCurrentPagePlans(response.data || []);
      setTotalPages(response.totalPages || 1);
      setHasLoadedInitialPlans(true);

      console.log("Loaded meal plans for current page:", response);
    } catch (error) {
      console.error("Error loading meal plans:", error);
      toast({
        title: "Error loading meal plans",
        description: "Failed to load your meal plans. Please try again.",
        variant: "destructive",
      });
      setCurrentPagePlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handlePlanCreated = (newPlan: any) => {
    console.log("New plan created - full object:", newPlan);
    addMealPlan(newPlan);
    setShowCreator(false);
    setIsEditing(false);
    isNavigatingBack.current = false;

    // Extract success modal data from the actual plan structure
    // The newPlan should have the transformed structure from the service
    const successPlanData = {
      name:
        newPlan.name ||
        newPlan.plan_name ||
        newPlan.planName ||
        "AI Generated Meal Plan",
      numberOfDays: newPlan.duration
        ? parseInt(newPlan.duration.replace(" days", ""))
        : newPlan.preferences?.numberOfWeeks
          ? newPlan.preferences.numberOfWeeks * 7
          : 7,
      numberOfPersons:
        newPlan.preferences?.numberOfPersons ||
        newPlan.preferences?.people ||
        newPlan.numberPeople ||
        1,
      mealsPerDay: newPlan.preferences?.mealsPerDay || newPlan.mealsPerDay || 3,
    };

    console.log("Setting success plan data:", successPlanData);
    setSuccessPlan(successPlanData);
    setShowSuccessModal(true);

    // Show success toast
    toast({
      title: "🎉 Meal Plan Created Successfully!",
      description: `Your meal plan is ready to explore.`,
      duration: 8000,
    });

    // Refresh the first page to show the new plan
    setCurrentPage(1);
    setAllPlans([]);
    loadMealPlans(1, isMobile ? 5 : pageSize, isMobile);
  };

  const handleEditPlan = () => {
    setIsEditing(true);
    setShowCreator(true);
    isNavigatingBack.current = false;
  };

  const handleBackToPlanner = () => {
    console.log("Navigating back to meal planner - resetting all states");
    isNavigatingBack.current = true;
    setShowCreator(false);
    setSelectedMealPlan(null);
    setIsEditing(false);
  };

  const handlePlanSelect = (plan: any) => {
    // Get the most up-to-date version of the plan from context
    const updatedPlan = getMealPlanById(plan.id) || plan;
    console.log("this is the updated plan object", updatedPlan);
    console.log("this is the normal plan object", plan);
    console.log("Selecting plan:", updatedPlan);
    setSelectedMealPlan(updatedPlan);
    setShowCreator(false);
    setIsEditing(false);
    isNavigatingBack.current = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const handleViewSuccessPlan = () => {
    if (successPlan) {
      setShowSuccessModal(false);
      setSelectedMealPlan(successPlan);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessPlan(null);
  };

  // Update selected meal plan when context changes - but only if we're viewing a plan and not navigating back
  useEffect(() => {
    if (selectedMealPlan && !showCreator && !isNavigatingBack.current) {
      const updatedPlan = getMealPlanById(selectedMealPlan.id);
      if (updatedPlan) {
        setSelectedMealPlan(updatedPlan);
      }
    }
  }, [mealPlans, selectedMealPlan?.id, getMealPlanById, showCreator]);

  // Listen for global "open-meal-plan" events (e.g. from MealPlanReadyModal)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const plan = detail?.plan;
      if (!plan) return;
      const updated = getMealPlanById(plan.id) || plan;
      setShowCreator(false);
      setIsEditing(false);
      isNavigatingBack.current = false;
      setSelectedMealPlan(updated);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("open-meal-plan", handler as EventListener);
    return () => window.removeEventListener("open-meal-plan", handler as EventListener);
  }, [getMealPlanById]);

  // Show meal plan view when a plan is selected and not in creator mode
  if (selectedMealPlan && !showCreator) {
    return (
      <MealPlanView
        plan={selectedMealPlan}
        onBack={handleBackToPlanner}
        onEdit={handleEditPlan}
      />
    );
  }

  // Show creator when in creator mode
  if (showCreator) {
    return (
      <MealPlanCreatorStepper
        initialData={isEditing ? selectedMealPlan : undefined}
        onPlanCreated={handlePlanCreated}
        onBack={handleBackToPlanner}
        isEditing={isEditing}
      />
    );
  }

  // Default view: show meal planner dashboard
  return (
    <div className="min-h-screen relative">
      {/* Food-themed Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-accent/80" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Success Modal */}
        {showSuccessModal && successPlan && (
          <MealPlanSuccessModal
            isOpen={showSuccessModal}
            onClose={handleCloseSuccessModal}
            onViewPlan={handleViewSuccessPlan}
            mealPlan={successPlan}
          />
        )}

        {/* Header */}
        <div className="bg-primary/40 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-primary/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">
                  {t("mealPlanner.title") || "Meal Planner"}
                </h1>
                <p className="text-xs sm:text-sm text-primary-foreground/80 mt-0.5">
                  {t("mealPlanner.description") || "Create and manage your weekly meal plans"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                console.log("Creating new meal plan");
                setShowCreator(true);
                setSelectedMealPlan(null);
                setIsEditing(false);
                isNavigatingBack.current = false;
              }}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white w-full sm:w-auto shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("mealPlanner.aiMeal") || "Create AI Meal Plan"}
            </Button>
          </div>
        </div>

        {/* Page Size Selector and Results Info - desktop only */}
        {!isMobile && !isLoadingPlans && hasLoadedInitialPlans && (
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            currentPage={currentPage}
            totalPages={totalPages}
            itemCount={currentPagePlans.length}
            itemLabel={t("mealPlanner.plans") || "plans"}
          />
        )}

        {/* Loading State */}
        {isLoadingPlans && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground/80" />
              <p className="text-primary-foreground">
                {t("mealPlanner.loadingPlans") || "Loading your meal plans..."}
              </p>
            </div>
          </div>
        )}

        {/* Meal Plans Grid */}
        {(isMobile ? !isLoadingPlans && allPlans.length > 0 : !isLoadingPlans && currentPagePlans.length > 0) ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isMobile ? allPlans : currentPagePlans).map((plan) => {
                // Calculate days from duration string or use preferences
                const daysCount = plan.duration
                  ? parseInt(plan.duration.replace(" days", ""))
                  : plan.preferences?.numberOfWeeks
                    ? plan.preferences.numberOfWeeks * 7
                    : 7;

                //kids below 5
                const kidsbelow5Count = plan.preferences?.kidsbelow5 || "0";
                //kids over 5
                const kidsover5Count = plan.preferences?.kidsover5 || "0";
                const peopleCount =
                  plan.preferences?.numberOfPersons ||
                  plan.preferences?.people ||
                  "N/A";
                const mealsCount = plan.preferences?.mealsPerDay || "3";

                // CO2 visual calculation (scale: 0-50kg as max for a meal plan)
                const co2Value = plan.totalCarbonFootprint ? parseFloat(plan.totalCarbonFootprint) : 0;
                const co2Max = 50;
                const co2Percent = Math.min((co2Value / co2Max) * 100, 100);
                const co2Level = co2Percent <= 33 ? 'low' : co2Percent <= 66 ? 'medium' : 'high';
                const co2Color = co2Level === 'low' ? 'text-primary' : co2Level === 'medium' ? 'text-amber-600' : 'text-red-500';
                const co2BarColor = co2Level === 'low' ? 'bg-primary' : co2Level === 'medium' ? 'bg-amber-500' : 'bg-red-500';
                const co2Label = co2Level === 'low' ? (t("mealPlanner.co2Low") || 'Low impact') : co2Level === 'medium' ? (t("mealPlanner.co2Medium") || 'Medium impact') : (t("mealPlanner.co2High") || 'High impact');

                return (
                  <TooltipProvider key={plan.id} delayDuration={300}>
                    <Card
                      className="bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden group relative"
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {/* Top accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary/70" />

                      <CardHeader className="pb-2 pt-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md flex-shrink-0">
                              <ChefHat className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-foreground text-base font-semibold truncate">
                                {plan.name}
                              </CardTitle>
                              <CardDescription className="text-muted-foreground text-xs mt-0.5">
                                {plan.startDate} — {new Date(plan.endDate).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-2 pb-4">
                        {/* Metrics row - icon-driven, compact */}
                        <div className="flex items-center gap-1 flex-wrap mb-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-medium text-foreground">{daysCount}d</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{daysCount} {t("mealPlanner.day") || "days"}</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
                                <Users className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-medium text-foreground">{peopleCount}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{peopleCount} {t("mealPlanner.people") || "people"}</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
                                <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-medium text-foreground">{mealsCount}/d</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{mealsCount} {t("mealPlanner.mealsPDay") || "meals per day"}</TooltipContent>
                          </Tooltip>

                          {parseInt(kidsbelow5Count) > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
                                  <Baby className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs font-medium text-foreground">{kidsbelow5Count}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{kidsbelow5Count} {t("mealPlanner.kidsbelow5") || "kids under 5"}</TooltipContent>
                            </Tooltip>
                          )}

                          {parseInt(kidsover5Count) > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
                                  <Smile className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs font-medium text-foreground">{kidsover5Count}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{kidsover5Count} {t("mealPlanner.kidsover5") || "kids 5-12"}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        {/* Tags: cuisine, diet, skill */}
                        {(plan.preferences?.cuisinePreferences?.length > 0 || plan.preferences?.dietaryRestrictions?.length > 0 || plan.preferences?.cookingSkillLevel) && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {plan.preferences?.cuisinePreferences?.map((c: string) => (
                              <span key={c} className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                                <Globe className="h-2.5 w-2.5" />{c}
                              </span>
                            ))}
                            {plan.preferences?.dietaryRestrictions?.map((d: string) => (
                              <span key={d} className="inline-flex items-center gap-1 text-[10px] font-medium bg-accent/20 text-accent-foreground rounded-full px-2 py-0.5">
                                <Flame className="h-2.5 w-2.5" />{d}
                              </span>
                            ))}
                            {plan.preferences?.cookingSkillLevel && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                                <Award className="h-2.5 w-2.5" />{plan.preferences.cookingSkillLevel}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Bottom stats row */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2.5 mt-1">
                          <div className="flex items-center gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                  <UtensilsCrossed className="h-3 w-3" />
                                  <span className="font-medium">{plan.meals?.length || 0}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{plan.meals?.length || 0} {t("mealPlanner.totalMealsPlanned") || "total meals"}</TooltipContent>
                            </Tooltip>

                            {plan.shoppingList?.length > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-orange-600">
                                    <ShoppingBasket className="h-3 w-3" />
                                    <span className="font-medium">{plan.shoppingList.length}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{plan.shoppingList.length} {t("mealPlanner.ingreNeeded") || "ingredients needed"}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>

                          {/* Visual CO2 indicator */}
                          {co2Value > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 min-w-[100px]">
                                  <Leaf className={`h-3.5 w-3.5 flex-shrink-0 ${co2Color}`} />
                                  <div className="flex-1">
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full transition-all ${co2BarColor}`} style={{ width: `${co2Percent}%` }} />
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-semibold ${co2Color} whitespace-nowrap`}>{co2Value}kg</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <p className="font-medium">{co2Value} kg CO₂</p>
                                  <p className="text-xs opacity-80">{co2Label}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipProvider>
                );
              })}
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
                {currentPage >= totalPages && allPlans.length > 0 && (
                  <p className="text-center text-white/60 text-sm py-4">
                    {t("mealPlanner.noMorePlans") || "You've seen all your meal plans"}
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
                          className={
                            currentPage <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-primary/5"
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
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
                                  className={`cursor-pointer ${page === currentPage ? "bg-primary text-white hover:bg-primary" : "hover:bg-primary/5"}`}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            (page === currentPage - 2 && currentPage > 3) ||
                            (page === currentPage + 2 &&
                              currentPage < totalPages - 2)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        },
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={
                            currentPage >= totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-primary/5"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        ) : (
          !isLoadingPlans &&
          hasLoadedInitialPlans && (
            <Card className="text-center py-12 bg-card backdrop-blur-sm border border-border shadow-xl">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-4 rounded-full shadow-lg">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {t("mealPlanner.welcomeToAIMeal") ||
                        "Welcome to AI Meal Planning"}
                      , {user?.name?.split(" ")[0] || "Chef"}!
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      {t("mealPlanner.createYourPersonalized") ||
                        "Create your first personalized meal plan with our AI assistant"}
                      .
                      {t("mealPlanner.getCustomizedRecipes") ||
                        "Get customized recipes based on your preferences, dietary needs, and cooking skills"}
                      .
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      console.log("Creating first meal plan");
                      setShowCreator(true);
                      setSelectedMealPlan(null);
                      setIsEditing(false);
                      isNavigatingBack.current = false;
                    }}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground mt-4 shadow-lg"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t("mealPlanner.createYourFirstAIMeal") ||
                      "Create Your First AI Meal Plan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
