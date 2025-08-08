
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChefHat, Utensils, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CookingLoaderProps {
  isVisible: boolean;
  message?: string;
}

const CookingLoaderOverlay = ({ isVisible, message = "Cooking up something delicious..." }: CookingLoaderProps) => {
  const { t } = useLanguage();
  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        {/* Animated Chef Hat */}
        <div className="relative mb-6">
          <div className="relative inline-block">
            <ChefHat className="h-16 w-16 text-purple-600 animate-bounce" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>

        {/* Cooking Animation */}
        <div className="flex justify-center items-center space-x-2 mb-6">
          <Utensils className="h-8 w-8 text-orange-500 animate-[spin_2s_linear_infinite]" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
          </div>
          <Utensils className="h-8 w-8 text-pink-500 animate-[spin_2s_linear_infinite_reverse]" />
        </div>

        {/* Loading Message */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t("useCooking.creatingYourMealPlan") || "Creating Your Meal Plan"}</h3>
        <p className="text-gray-600 text-sm">{message}</p>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const useCookingLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Cooking up something delicious...");

  const showLoader = (customMessage?: string) => {
    if (customMessage) setMessage(customMessage);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
  };

  const LoaderComponent = () => (
    <CookingLoaderOverlay isVisible={isLoading} message={message} />
  );

  return {
    showLoader,
    hideLoader,
    isLoading,
    LoaderComponent
  };
};
