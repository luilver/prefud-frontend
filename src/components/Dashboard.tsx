
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
      {/* Simplified Header */}
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
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="icon" className="text-green-700 h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button variant="ghost" onClick={logout} className="text-green-700 text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8">
        {/* Welcome Section - Simplified */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              You have <span className="font-semibold text-green-600">{user?.subscription.planLimits.plansPerMonth - (user?.subscription.planLimits.usedPlans || 0)}</span> meal plans remaining this month.
            </p>
          </div>
          
          {/* Main Action Card - Centered and Prominent */}
          <Card className="bg-gradient-to-r from-green-500/10 via-orange-500/10 to-purple-500/10 border-green-300 max-w-2xl mx-auto">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl">
                  <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2">Your Meal Plans</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600">
                    Plan your week with AI-powered suggestions and manage your meals
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <Button 
                    onClick={handleStartPlanning}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    View Plans
                  </Button>
                  <Button 
                    onClick={handleStartPlanning}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Plan
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Compact Stats - Only Essential Info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Plans Used</p>
                  <p className="text-sm sm:text-lg font-bold text-green-700">
                    {user?.subscription.planLimits.usedPlans}/{user?.subscription.planLimits.plansPerMonth}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Today's Calories</p>
                  <p className="text-sm sm:text-lg font-bold text-green-700">1,847</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Shopping Items</p>
                  <p className="text-sm sm:text-lg font-bold text-orange-700">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pantry Items</p>
                  <p className="text-sm sm:text-lg font-bold text-orange-700">45</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simplified Navigation - Meal Planner First */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 bg-white/70 backdrop-blur-sm h-auto p-1 gap-1">
            <TabsTrigger value="planner" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-orange-500 data-[state=active]:text-white p-2 text-xs sm:text-sm min-h-[3rem] sm:min-h-[2.5rem]">
              <ChefHat className="h-4 w-4" />
              <span>Meal Plans</span>
            </TabsTrigger>
            <TabsTrigger value="ingredients" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm min-h-[3rem] sm:min-h-[2.5rem]">
              <Utensils className="h-4 w-4" />
              <span>Pantry</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm min-h-[3rem] sm:min-h-[2.5rem]">
              <ShoppingCart className="h-4 w-4" />
              <span>Shopping</span>
            </TabsTrigger>
            <TabsTrigger value="calories" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm min-h-[3rem] sm:min-h-[2.5rem]">
              <TrendingUp className="h-4 w-4" />
              <span>Calories</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 text-xs sm:text-sm min-h-[3rem] sm:min-h-[2.5rem]">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="mt-4 sm:mt-6">
            <div id="meal-planner-section">
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
            <div className="grid gap-4 sm:gap-6">
              <UserProfile />
              <SubscriptionManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
