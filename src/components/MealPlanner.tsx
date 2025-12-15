import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Users, ChefHat, Clock, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [hasLoadedInitialPlans, setHasLoadedInitialPlans] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPlan, setSuccessPlan] = useState<any>(null);
  const isNavigatingBack = useRef(false);
  const { user, mealPlans, addMealPlan, getMealPlanById, fetchMealPlansFromAPI } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load meal plans when component mounts, page changes, or page size changes
  useEffect(() => {
    if (user?.id && !showCreator && !selectedMealPlan) {
      loadMealPlans(currentPage, pageSize);
    }
  }, [user?.id, currentPage, pageSize, showCreator, selectedMealPlan]);

  const loadMealPlans = async (page: number, limit: number) => {
    if (!user?.id) return;

    setIsLoadingPlans(true);
    try {
      console.log(`Loading meal plans for page: ${page}, limit: ${limit}`);
      const response = await fetchMealPlansFromAPI(user.id, page, limit);
      console.log('this si the data of meal plans ',response.data)
      // Set the current page plans from the API response
      setCurrentPagePlans(response.data || []);
      setTotalPages(response.totalPages || 1);
      setHasLoadedInitialPlans(true);
      
      console.log('Loaded meal plans for current page:', response);
    } catch (error) {
      console.error('Error loading meal plans:', error);
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
    console.log('New plan created - full object:', newPlan);
    addMealPlan(newPlan);
    setShowCreator(false);
    setIsEditing(false);
    isNavigatingBack.current = false;
    
    // Extract success modal data from the actual plan structure
    // The newPlan should have the transformed structure from the service
    const successPlanData = {
      name: newPlan.name || newPlan.plan_name || newPlan.planName || 'AI Generated Meal Plan',
      numberOfDays: newPlan.duration ? parseInt(newPlan.duration.replace(' days', '')) : 
                   (newPlan.preferences?.numberOfWeeks ? newPlan.preferences.numberOfWeeks * 7 : 7),
      numberOfPersons: newPlan.preferences?.numberOfPersons || 
                      newPlan.preferences?.people || 
                      newPlan.numberPeople || 1,
      mealsPerDay: newPlan.preferences?.mealsPerDay || newPlan.mealsPerDay || 3
    };
    
    console.log('Setting success plan data:', successPlanData);
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
    loadMealPlans(1, pageSize);
  };

  const handleEditPlan = () => {
    setIsEditing(true);
    setShowCreator(true);
    isNavigatingBack.current = false;
  };

  const handleBackToPlanner = () => {
    console.log('Navigating back to meal planner - resetting all states');
    isNavigatingBack.current = true;
    setShowCreator(false);
    setSelectedMealPlan(null);
    setIsEditing(false);
  };

  const handlePlanSelect = (plan: any) => {
    // Get the most up-to-date version of the plan from context
    const updatedPlan = getMealPlanById(plan.id) || plan;
    console.log('this is the updated plan object',updatedPlan);
    console.log('this is the normal plan object',plan);
    console.log('Selecting plan:', updatedPlan);
    setSelectedMealPlan(updatedPlan);
    setShowCreator(false);
    setIsEditing(false);
    isNavigatingBack.current = false;
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
          backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-emerald-800/70 to-teal-900/80" />
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/30 backdrop-blur-sm rounded-xl p-4 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{t('mealPlanner.title') || 'Meal Planner'}</h1>
            <p className="text-white/90 mt-1 drop-shadow-md">{t('mealPlanner.description') || 'Create and manage your weekly meal plans'}</p>
          </div>
          <Button 
            onClick={() => {
              console.log('Creating new meal plan');
              setShowCreator(true);
              setSelectedMealPlan(null);
              setIsEditing(false);
              isNavigatingBack.current = false;
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white w-full sm:w-auto shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('mealPlanner.aiMeal') || 'Create AI Meal Plan'}
          </Button>
        </div>

        {/* Page Size Selector and Results Info */}
        {!isLoadingPlans && hasLoadedInitialPlans && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <PageSizeSelector 
              pageSize={pageSize} 
              onPageSizeChange={handlePageSizeChange}
            />
            <div className="text-sm text-white drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
              {t('mealPlanner.showingPage') || 'Showing page'} {currentPage} {t('mealPlanner.of') || 'of'} {totalPages} ({currentPagePlans.length} {t('mealPlanner.plans') || 'plans'})
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingPlans && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-400" />
              <p className="text-emerald-100">{t('mealPlanner.loadingPlans') || 'Loading your meal plans...'}</p>
            </div>
          </div>
        )}

        {/* Meal Plans Grid */}
        {!isLoadingPlans && currentPagePlans.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPagePlans.map((plan) => {
                // Calculate days from duration string or use preferences
                const daysCount = plan.duration ? parseInt(plan.duration.replace(' days', '')) : 
                                 (plan.preferences?.numberOfWeeks ? plan.preferences.numberOfWeeks * 7 : 7);
                const peopleCount = plan.preferences?.numberOfPersons || plan.preferences?.people || 'N/A';
                const mealsCount = plan.preferences?.mealsPerDay || '3';
                
                return (
                  <Card 
                    key={plan.id} 
                    className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden group"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-gray-800">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                          <ChefHat className="h-5 w-5 text-white" />
                        </div>
                        <span className="truncate">{plan.name}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        {plan.startDate} - {new Date(plan.endDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          <span>{daysCount} {t('mealPlanner.day') || 'day'}{daysCount > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-500" />
                          <span>{t('mealPlanner.for') || 'For'} {peopleCount} {t('mealPlanner.people') || 'people'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          <span>{mealsCount} {t('mealPlanner.mealsPDay') || 'meals per day'}</span>
                        </div>
                        
                        {/* Additional plan details from API */}
                        <div className="pt-2 border-t border-gray-100 space-y-1">
                          {plan.preferences?.cuisinePreferences && plan.preferences.cuisinePreferences.length > 0 && (
                            <div className="text-xs text-emerald-600 font-medium">
                              {t('mealPlanner.cuisine') || 'Cuisine'}: {plan.preferences.cuisinePreferences.join(', ')}
                            </div>
                          )}
                          
                          {plan.preferences?.dietaryRestrictions && plan.preferences.dietaryRestrictions.length > 0 && (
                            <div className="text-xs text-teal-600 font-medium">
                              {t('mealPlanner.diet') || 'Diet'}: {plan.preferences.dietaryRestrictions.join(', ')}
                            </div>
                          )}
                          
                          {plan.preferences?.cookingSkillLevel && (
                            <div className="text-xs text-blue-600 font-medium">
                              {t('mealPlanner.skillLevel') || 'Skill Level'}: {plan.preferences.cookingSkillLevel}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            {plan.meals?.length || 0} {t('mealPlanner.totalMealsPlanned') || 'total meals planned'}
                          </div>
                          
                          {plan.shoppingList && plan.shoppingList.length > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              {plan.shoppingList.length} {t('mealPlanner.ingreNeeded') || 'ingredients needed'}
                            </div>
                          )}
                          {plan.totalCarbonFootprint && (
                            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                              {plan.totalCarbonFootprint} Kg CO2 
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
          </>
        ) : (
          !isLoadingPlans && hasLoadedInitialPlans && (
            <Card className="text-center py-12 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {t('mealPlanner.welcomeToAIMeal') || 'Welcome to AI Meal Planning'}, {user?.name?.split(' ')[0] || 'Chef'}!
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {t('mealPlanner.createYourPersonalized') || 'Create your first personalized meal plan with our AI assistant'}. 
                      {t('mealPlanner.getCustomizedRecipes') || 'Get customized recipes based on your preferences, dietary needs, and cooking skills'}.
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      console.log('Creating first meal plan');
                      setShowCreator(true);
                      setSelectedMealPlan(null);
                      setIsEditing(false);
                      isNavigatingBack.current = false;
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white mt-4 shadow-lg"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t('mealPlanner.createYourFirstAIMeal') || 'Create Your First AI Meal Plan'}
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
