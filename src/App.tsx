import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { MealPlanJobProvider } from "@/contexts/MealPlanJobContext";
import MealPlanJobIndicator from "@/components/MealPlanJobIndicator";
import MealPlanReadyModal from "@/components/MealPlanReadyModal";
import { DrinkJobProvider } from "@/contexts/DrinkJobContext";
import DrinkJobIndicator from "@/components/DrinkJobIndicator";
import DrinkReadyModal from "@/components/DrinkReadyModal";
import { AIMealJobProvider } from "@/contexts/AIMealJobContext";
import AIMealJobIndicator from "@/components/AIMealJobIndicator";
import AIMealReadyModal from "@/components/AIMealReadyModal";
import { PantryMealsJobProvider } from "@/contexts/PantryMealsJobContext";
import PantryMealsJobIndicator from "@/components/PantryMealsJobIndicator";
import PantryMealsReadyModal from "@/components/PantryMealsReadyModal";
import { AnalyzeImageJobProvider } from "@/contexts/AnalyzeImageJobContext";
import AnalyzeImageJobIndicator from "@/components/AnalyzeImageJobIndicator";
import AnalyzeImageReadyModal from "@/components/AnalyzeImageReadyModal";

import Index from "@/pages/Index";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import Pricing from "@/pages/Pricing";
import WhyPantry from "@/pages/WhyPantry";
import TermsAndConditions from "@/pages/TermsAndConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Favorites from "@/pages/Favorites";
import Cart from "@/pages/Cart";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/Landing";
import { isNativePlatform } from "@/services/revenueCatService";
import Brand from "./pages/Brand";
import Assistant from "@/pages/Assistant";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isLoading, user } = useAuth();
  const isNative = isNativePlatform();


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isNative && !user ? <Navigate to="/signin" replace /> : <Index />}
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/why-pantry" element={<WhyPantry />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/brand" element={<Brand />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <UserProvider>
            <MealPlanJobProvider>
              <DrinkJobProvider>
                <AIMealJobProvider>
                  <PantryMealsJobProvider>
                    <AnalyzeImageJobProvider>
                      <CartProvider>
                        <TooltipProvider>
                          <AppContent />
                          <MealPlanJobIndicator />
                          <MealPlanReadyModal />
                          <DrinkJobIndicator />
                          <DrinkReadyModal />
                          <AIMealJobIndicator />
                          <AIMealReadyModal />
                          <PantryMealsJobIndicator />
                          <PantryMealsReadyModal />
                          <AnalyzeImageJobIndicator />
                          <AnalyzeImageReadyModal />
                          <Toaster />
                        </TooltipProvider>
                      </CartProvider>
                    </AnalyzeImageJobProvider>
                  </PantryMealsJobProvider>
                </AIMealJobProvider>
              </DrinkJobProvider>
            </MealPlanJobProvider>
          </UserProvider>
        </SubscriptionProvider>
      </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
