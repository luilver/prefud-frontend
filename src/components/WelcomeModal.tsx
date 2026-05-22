
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PartyPopper, Sparkles, ChefHat, Calendar, TrendingUp, Camera } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal = ({ onClose }: WelcomeModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, setLanguage, t } = useLanguage();

  const slides = [
    {
      icon: PartyPopper,
      title: t("welcome.message") || "Welcome to Pantry!",
      description: t("welcome.subtitle") || "Your smart kitchen companion is ready to transform your cooking experience.",
      color: "text-purple-600",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop"
    },
    {
      icon: ChefHat,
      title: t("welcome.aiMealPlanning") || "AI-Powered Meal Planning",
      description: t("welcome.personalizedMeals") || "Get personalized meal suggestions based on your preferences and pantry items.",
      color: "text-green-600",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop"
    },
    {
      icon: Calendar,
      title: t("welcome.weeklyPlanning") || "Weekly Planning Made Easy",
      description: t("welcome.planWeekDescription") || "Plan your entire week with smart suggestions and automated shopping lists.",
      color: "text-blue-600",
      image: "https://images.unsplash.com/photo-1588514727390-91fd5ebaef81?w=400&h=250&fit=crop"
    },
    {
      icon: Camera,
      title: t("welcome.smartPantry") || "Smart Pantry Scanning",
      description: t("welcome.scanIngredients") || "Use your camera to scan ingredients and automatically add them to your pantry.",
      color: "text-orange-600",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop"
    },
    {
      icon: TrendingUp,
      title: t("welcome.trackProgress") || "Track Your Progress",
      description: t("welcome.monitorGoals") || "Monitor your nutrition goals and see your healthy habits grow over time",
      color: "text-orange-600",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    onClose();
  };

  const IconComponent = slides[currentSlide].icon;

  return (
    <Dialog open={true} onOpenChange={handleComplete}>
      <DialogContent className="max-w-sm sm:max-w-lg mx-auto p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r from-green-100 to-orange-100 flex items-center justify-center`}>
              <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${slides[currentSlide].color}`} />
            </div>
            <CardTitle className="text-lg sm:text-2xl font-bold text-gray-800">
              {slides[currentSlide].title}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 mt-2">
              {slides[currentSlide].description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Feature Image */}
            <div className="rounded-lg overflow-hidden">
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                className="w-full h-32 sm:h-48 object-cover"
              />
            </div>

            {/* Progress dots */}
            <div className="flex justify-center space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex space-x-2 sm:space-x-3">
              {currentSlide > 0 && (
                <Button 
                  variant="outline"
                  onClick={prevSlide}
                  className="flex-1 text-sm sm:text-base"
                >
                  Previous
                </Button>
              )}
              
              <Button 
                onClick={nextSlide}
                className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-sm sm:text-base"
              >
                {currentSlide < slides.length - 1 ? (
                  <>
                    Next
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  </>
                ) : (
                  <>
                    Start Cooking!
                    <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  </>
                )}
              </Button>
            </div>
            
            {/* Skip option */}
            {currentSlide < slides.length - 1 && (
              <Button 
                variant="ghost" 
                onClick={handleComplete}
                className="w-full text-gray-600 hover:text-gray-800 text-sm sm:text-base"
              >
                Skip Tutorial
              </Button>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
