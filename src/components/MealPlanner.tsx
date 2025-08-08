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
    console.log('New plan created:', newPlan);
    addMealPlan(newPlan);
    setShowCreator(false);
    setIsEditing(false);
    isNavigatingBack.current = false;
    
    // Show success modal with correct plan data
    const successPlanData = {
      name: newPlan.name || 'AI Generated Meal Plan',
      numberOfDays: newPlan.preferences?.numberOfWeeks 
        ? newPlan.preferences.numberOfWeeks * 7 
        : (newPlan.duration ? parseInt(newPlan.duration.replace(' days', '')) : 7),
      numberOfPersons: newPlan.preferences?.numberOfPersons || newPlan.preferences?.people || 1,
      mealsPerDay: newPlan.preferences?.mealsPerDay || 3
    };
    
    console.log('Setting success plan data:', successPlanData);
    setSuccessPlan(successPlanData);
    setShowSuccessModal(true);
    
    // Show success toast
    toast({
      title: "🎉 Meal Plan Created Successfully!",
      description: `Your meal plan "${newPlan.name}" is ready to explore.`,
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
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('mealPlanner.title') || 'Meal Planner'}</h1>
          <p className="text-gray-600 mt-1">{t('mealPlanner.description') || 'Create and manage your weekly meal plans'}</p>
        </div>
        <Button 
          onClick={() => {
            console.log('Creating new meal plan');
            setShowCreator(true);
            setSelectedMealPlan(null);
            setIsEditing(false);
            isNavigatingBack.current = false;
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full sm:w-auto"
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
          <div className="text-sm text-gray-600">
            {t('mealPlanner.showingPage') || 'Showing page'} {currentPage} {t('mealPlanner.of') || 'of'} {totalPages} ({currentPagePlans.length} {t('mealPlanner.plans') || 'plans'})
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingPlans && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p className="text-gray-600">{t('mealPlanner.loadingPlans') || 'Loading your meal plans...'}</p>
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
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-purple-500" />
                      {plan.name}
                    </CardTitle>
                    <CardDescription>
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{daysCount} {t('mealPlanner.day') || 'day'}{daysCount > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{t('mealPlanner.for') || 'For'} {peopleCount} {t('mealPlanner.people') || 'people'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{mealsCount} {t('mealPlanner.mealsPDay') || 'meals per day'}</span>
                      </div>
                      
                      {/* Additional plan details from API */}
                      {plan.preferences?.cuisinePreferences && plan.preferences.cuisinePreferences.length > 0 && (
                        <div className="text-xs text-purple-600">
                          {t('mealPlanner.cuisine') || 'Cuisine'}: {plan.preferences.cuisinePreferences.join(', ')}
                        </div>
                      )}
                      
                      {plan.preferences?.dietaryRestrictions && plan.preferences.dietaryRestrictions.length > 0 && (
                        <div className="text-xs text-green-600">
                          {t('mealPlanner.diet') || 'Diet'}: {plan.preferences.dietaryRestrictions.join(', ')}
                        </div>
                      )}
                      
                      {plan.preferences?.cookingSkillLevel && (
                        <div className="text-xs text-blue-600">
                          {t('mealPlanner.skillLevel') || 'Skill Level'}: {plan.preferences.cookingSkillLevel}
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-gray-500">
                        {plan.meals?.length || 0} {t('mealPlanner.totalMealsPlanned') || 'total meals planned'}
                      </div>
                      
                      {plan.shoppingList && plan.shoppingList.length > 0 && (
                        <div className="text-xs text-orange-600">
                          {plan.shoppingList.length} {t('mealPlanner.ingreNeeded') || 'ingredients needed'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                            className="cursor-pointer"
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
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        !isLoadingPlans && hasLoadedInitialPlans && (
          <Card className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white mt-4"
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
  );
};

export default MealPlanner;
