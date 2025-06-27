
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
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            <Button variant="ghost" size="icon" className="text-green-700 h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-green-700 h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10" onClick={() => setActiveTab("subscription")}>
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button variant="ghost" onClick={logout} className="text-green-700 text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8">
        {/* Welcome Section with Meal Planner Emphasis */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4 lg:mb-6 leading-relaxed">
            You're on the <span className="font-semibold text-green-600">{user?.subscription.plan}</span> plan with <span className="font-semibold text-orange-600">{user?.subscription.planLimits.plansPerMonth - (user?.subscription.planLimits.usedPlans || 0)}</span> meal plans remaining this month.
          </p>
          
          {/* Featured Meal Planner Card */}
          <Card className="bg-gradient-to-r from-green-500/10 via-orange-500/10 to-purple-500/10 border-green-300 mb-3 sm:mb-4 lg:mb-6">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex-shrink-0">
                    <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-800 truncate">Smart Meal Planning</CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base text-gray-600 line-clamp-2">
                      Plan your week with AI-powered suggestions
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={handleStartPlanning}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 flex-shrink-0"
                >
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Start Planning
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex flex-col space-y-1 sm:space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Plans Used</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-green-700">
                    {user?.subscription.planLimits.usedPlans}/{user?.subscription.planLimits.plansPerMonth}
                  </p>
                </div>
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-500 self-end lg:self-auto flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex flex-col space-y-1 sm:space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Today's Calories</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-green-700">1,847</p>
                </div>
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-500 self-end lg:self-auto flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex flex-col space-y-1 sm:space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Shopping Items</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-orange-700">23</p>
                </div>
                <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-orange-500 self-end lg:self-auto flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex flex-col space-y-1 sm:space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Expiring Soon</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-orange-700">3</p>
                </div>
                <Bell className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-orange-500 self-end lg:self-auto flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Tabs - Reorganized with Meal Planner First */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-white/70 backdrop-blur-sm h-auto p-1 gap-1 sm:gap-0">
            <TabsTrigger value="planner" className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-1 lg:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-orange-500 data-[state=active]:text-white p-1.5 sm:p-2 text-xs sm:text-sm lg:text-base min-h-[3rem] sm:min-h-[2.5rem]">
              <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Planner</span>
            </TabsTrigger>
            <TabsTrigger value="ingredients" className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-1 lg:space-x-2 p-1.5 sm:p-2 text-xs sm:text-sm lg:text-base min-h-[3rem] sm:min-h-[2.5rem]">
              <Utensils className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Pantry</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-1 lg:space-x-2 p-1.5 sm:p-2 text-xs sm:text-sm lg:text-base min-h-[3rem] sm:min-h-[2.5rem]">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Shopping</span>
            </TabsTrigger>
            <TabsTrigger value="calories" className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-1 lg:space-x-2 p-1.5 sm:p-2 text-xs sm:text-sm lg:text-base min-h-[3rem] sm:min-h-[2.5rem]">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Calories</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-1 lg:space-x-2 p-1.5 sm:p-2 text-xs sm:text-sm lg:text-base min-h-[3rem] sm:min-h-[2.5rem]">
              <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-1 lg:space-x-2 p-1.5 sm:p-2 text-xs sm:text-sm lg:text-base min-h-[3rem] sm:min-h-[2.5rem]">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="mt-3 sm:mt-4 lg:mt-6">
            <div id="meal-planner-section" className="space-y-3 sm:space-y-4">
              {/* Mobile-optimized meal planner header with responsive buttons */}
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 text-center sm:text-left">
                  Weekly Meal Planner
                </h3>
                {/* Responsive button layout */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                  <Button 
                    onClick={handleAIMealPlan}
                    variant="outline" 
                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm lg:text-base"
                  >
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span>AI Meal Plan</span>
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm lg:text-base"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span>Add Meal</span>
                  </Button>
                </div>
              </div>
              <div className="w-full overflow-x-auto">
                <MealPlanner />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-3 sm:mt-4 lg:mt-6">
            <div className="w-full overflow-x-auto">
              <IngredientTracker />
            </div>
          </TabsContent>

          <TabsContent value="shopping" className="mt-3 sm:mt-4 lg:mt-6">
            <div className="w-full overflow-x-auto">
              <ShoppingList />
            </div>
          </TabsContent>

          <TabsContent value="calories" className="mt-3 sm:mt-4 lg:mt-6">
            <div className="w-full overflow-x-auto">
              <CalorieTracker />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-3 sm:mt-4 lg:mt-6">
            <div className="w-full overflow-x-auto">
              <UserProfile />
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="mt-3 sm:mt-4 lg:mt-6">
            <div className="w-full overflow-x-auto">
              <SubscriptionManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
