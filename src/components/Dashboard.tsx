
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Calendar, ShoppingCart, User, Bell, TrendingUp, Settings, ChefHat, Sparkles, Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import MealPlanner from "./MealPlanner";
import CalorieTracker from "./CalorieTracker";
import IngredientTracker from "./IngredientTracker";
import ShoppingList from "./ShoppingList";
import UserProfile from "./UserProfile";
import SubscriptionManager from "./SubscriptionManager";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("planner");
  const { user, logout } = useUser();

  const handleStartPlanning = () => {
    setActiveTab("planner");
    // Smooth scroll to the meal planner section after a brief delay to ensure tab switch
    setTimeout(() => {
      const mealPlannerSection = document.getElementById("meal-planner-section");
      if (mealPlannerSection) {
        mealPlannerSection.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }
    }, 100);
  };

  const handleAIMealPlan = () => {
    // Smooth scroll to the meal planner section
    setTimeout(() => {
      const mealPlannerSection = document.getElementById("meal-planner-section");
      if (mealPlannerSection) {
        mealPlannerSection.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="icon" className="text-green-700 h-8 w-8 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-green-700 h-8 w-8 sm:h-10 sm:w-10" onClick={() => setActiveTab("subscription")}>
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="ghost" onClick={logout} className="text-green-700 text-sm sm:text-base px-2 sm:px-4">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Welcome Section with Meal Planner Emphasis */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome back, {user?.name || 'User'}!</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            You're on the {user?.subscription.plan} plan with {user?.subscription.planLimits.plansPerMonth - (user?.subscription.planLimits.usedPlans || 0)} meal plans remaining this month.
          </p>
          
          {/* Featured Meal Planner Card */}
          <Card className="bg-gradient-to-r from-green-500/10 via-orange-500/10 to-purple-500/10 border-green-300 mb-4 sm:mb-6">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
                    <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-gray-800">Smart Meal Planning</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600">
                      Plan your week with AI-powered suggestions
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={handleStartPlanning}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Planning
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm text-gray-600">Plans Used</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-700">
                    {user?.subscription.planLimits.usedPlans}/{user?.subscription.planLimits.plansPerMonth}
                  </p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm text-gray-600">Today's Calories</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-700">1,847</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm text-gray-600">Shopping Items</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-700">23</p>
                </div>
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-700">3</p>
                </div>
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Tabs - Reorganized with Meal Planner First */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-white/70 backdrop-blur-sm h-auto p-1">
            <TabsTrigger value="planner" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-orange-500 data-[state=active]:text-white p-2 text-xs sm:text-sm">
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Meal Planner</span>
              <span className="sm:hidden">Planner</span>
            </TabsTrigger>
            <TabsTrigger value="ingredients" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm">
              <Utensils className="h-4 w-4" />
              <span>Pantry</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm">
              <ShoppingCart className="h-4 w-4" />
              <span>Shopping</span>
            </TabsTrigger>
            <TabsTrigger value="calories" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Calories</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="mt-4 sm:mt-6">
            <div id="meal-planner-section" className="space-y-4">
              {/* Mobile-optimized meal planner header with responsive buttons */}
              <div className="flex flex-col space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 w-full text-center sm:text-left" 
                    style={{ width: window.innerWidth < 640 ? '90%' : 'auto', margin: window.innerWidth < 640 ? '0 auto' : '0' }}>
                  Weekly Meal Planner
                </h3>
                {/* Mobile row layout for AI Meal and Add Meal buttons */}
                <div className="flex flex-row gap-2 w-full">
                  <Button 
                    onClick={handleAIMealPlan}
                    variant="outline" 
                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50 h-10 px-3 text-sm"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">AI Meal</span>
                    <span className="xs:hidden">AI</span>
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 h-10 px-3 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">Add Meal</span>
                    <span className="xs:hidden">Add</span>
                  </Button>
                </div>
              </div>
              <MealPlanner />
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-4 sm:mt-6">
            <IngredientTracker />
          </TabsContent>

          <TabsContent value="shopping" className="mt-4 sm:mt-6">
            <ShoppingList />
          </TabsContent>

          <TabsContent value="calories" className="mt-4 sm:mt-6">
            <CalorieTracker />
          </TabsContent>

          <TabsContent value="profile" className="mt-4 sm:mt-6">
            <UserProfile />
          </TabsContent>

          <TabsContent value="subscription" className="mt-4 sm:mt-6">
            <SubscriptionManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
