import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  PartyPopper, 
  Sparkles, 
  ChefHat, 
  Calendar, 
  TrendingUp, 
  Camera, 
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal = ({ onClose }: WelcomeModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  const slides = [
    {
      icon: PartyPopper,
      title: t("welcome.message") || "Welcome to Prefud!",
      description: t("welcome.subtitle") || "Your smart kitchen companion is ready to transform your cooking experience.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
    },
    {
      icon: MessageSquare,
      title: t("welcome.aiChat") || "Your Personal AI Chef",
      description: t("welcome.aiChatDesc") || "Chat with AI to get food advice, generate meal plans, check calories, craft special meals, and buy groceries.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop"
    },
    {
      icon: ChefHat,
      title: t("welcome.aiMealPlanning") || "AI-Powered Meal Planning",
      description: t("welcome.personalizedMeals") || "Get personalized meal suggestions based on your preferences and pantry items.",
      color: "text-green-600",
      bgColor: "bg-green-100",
      image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&h=400&fit=crop"
    },
    {
      icon: Calendar,
      title: t("welcome.weeklyPlanning") || "Weekly Planning Made Easy",
      description: t("welcome.planWeekDescription") || "Plan your entire week with smart suggestions and automated shopping lists.",
      color: "text-rose-600",
      bgColor: "bg-rose-100",
      image: "https://images.unsplash.com/photo-1588514727390-91fd5ebaef81?w=600&h=400&fit=crop"
    },
    {
      icon: Camera,
      title: t("welcome.smartPantry") || "Smart Pantry Scanning",
      description: t("welcome.scanIngredients") || "Use your camera to scan ingredients and automatically add them to your pantry.",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
    },
    {
      icon: TrendingUp,
      title: t("welcome.trackProgress") || "Track Your Progress",
      description: t("welcome.monitorGoals") || "Monitor your nutrition goals and see your healthy habits grow over time.",
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop"
    }
  ];

  const changeSlide = (newIndex: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(newIndex);
      setIsAnimating(false);
    }, 300);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      changeSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      changeSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    onClose();
  };

  const IconComponent = slides[currentSlide].icon;

  return (
    <Dialog open={true} onOpenChange={handleComplete}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg mx-auto p-0 rounded-2xl overflow-hidden border-0 shadow-2xl">
        <Card className="border-0 shadow-none bg-white/95 backdrop-blur-md">
          {/* Top Image Section with Progress Bar */}
          <div className="relative h-48 sm:h-64 overflow-hidden bg-gray-100">
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title}
              className={`w-full h-full object-cover transition-all duration-700 ease-out transform ${
                isAnimating ? "scale-105 opacity-50" : "scale-100 opacity-100"
              }`}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
            
            {/* Minimalist Progress Bar */}
            <div className="absolute top-4 left-0 right-0 px-6 flex space-x-1.5 justify-center z-10">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                    index === currentSlide 
                      ? 'w-8 bg-white shadow-sm' 
                      : index < currentSlide
                        ? 'w-3 bg-white/70'
                        : 'w-3 bg-white/40'
                  }`}
                />
              ))}
            </div>
            
            {/* Floating Icon */}
            <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-xl bg-white flex items-center justify-center transition-all duration-500 transform ${isAnimating ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"}`}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${slides[currentSlide].bgColor} flex items-center justify-center`}>
                <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${slides[currentSlide].color}`} />
              </div>
            </div>
          </div>

          <CardContent className="text-center pt-12 pb-6 px-6 sm:px-8 space-y-6 sm:space-y-8">
            {/* Text Content */}
            <div className={`space-y-3 min-h-[100px] transition-all duration-300 transform ${isAnimating ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"}`}>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {slides[currentSlide].title}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline"
                  onClick={prevSlide}
                  disabled={currentSlide === 0 || isAnimating}
                  className={`flex-1 h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all ${currentSlide === 0 ? "invisible" : ""}`}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <Button 
                  onClick={nextSlide}
                  disabled={isAnimating}
                  className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-200 transition-all active:scale-95"
                >
                  {currentSlide < slides.length - 1 ? (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      <span>Let's Begin</span>
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              
              {/* Skip option */}
              {currentSlide < slides.length - 1 && (
                <button 
                  onClick={handleComplete}
                  className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip Tutorial
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
