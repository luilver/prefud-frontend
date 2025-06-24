
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PartyPopper, Sparkles, ChefHat, Calendar, TrendingUp } from "lucide-react";

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal = ({ onClose }: WelcomeModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: PartyPopper,
      title: "Welcome to Pantry!",
      description: "Your smart kitchen companion is ready to transform your cooking experience.",
      color: "text-purple-600"
    },
    {
      icon: ChefHat,
      title: "AI-Powered Meal Planning",
      description: "Get personalized meal suggestions based on your preferences and pantry items.",
      color: "text-green-600"
    },
    {
      icon: Calendar,
      title: "Weekly Planning Made Easy",
      description: "Plan your entire week with smart suggestions and automated shopping lists.",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Monitor your nutrition goals and see your healthy habits grow over time.",
      color: "text-orange-600"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const IconComponent = slides[currentSlide].icon;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-2">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-orange-100 flex items-center justify-center`}>
              <IconComponent className={`h-8 w-8 ${slides[currentSlide].color}`} />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {slides[currentSlide].title}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              {slides[currentSlide].description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {/* Progress dots */}
            <div className="flex justify-center space-x-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button 
                onClick={nextSlide}
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              >
                {currentSlide < slides.length - 1 ? (
                  <>
                    Continue
                    <Sparkles className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Start Cooking!
                    <ChefHat className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              
              {currentSlide < slides.length - 1 && (
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  Skip Tutorial
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
