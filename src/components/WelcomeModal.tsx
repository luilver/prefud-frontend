
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PartyPopper, Sparkles, ChefHat, Calendar, TrendingUp, Camera } from "lucide-react";

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
      color: "text-purple-600",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop"
    },
    {
      icon: ChefHat,
      title: "AI-Powered Meal Planning",
      description: "Get personalized meal suggestions based on your preferences and pantry items.",
      color: "text-green-600",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop"
    },
    {
      icon: Calendar,
      title: "Weekly Planning Made Easy",
      description: "Plan your entire week with smart suggestions and automated shopping lists.",
      color: "text-blue-600",
      image: "https://images.unsplash.com/photo-1588514727390-91fd5ebaef81?w=400&h=250&fit=crop"
    },
    {
      icon: Camera,
      title: "Smart Pantry Scanning",
      description: "Use your camera to scan ingredients and automatically add them to your pantry.",
      color: "text-orange-600",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop"
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Monitor your nutrition goals and see your healthy habits grow over time.",
      color: "text-orange-600",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const IconComponent = slides[currentSlide].icon;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto">
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
            {/* Feature Image */}
            <div className="rounded-lg overflow-hidden">
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                className="w-full h-48 object-cover"
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
            <div className="flex space-x-3">
              {currentSlide > 0 && (
                <Button 
                  variant="outline"
                  onClick={prevSlide}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              
              <Button 
                onClick={nextSlide}
                className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              >
                {currentSlide < slides.length - 1 ? (
                  <>
                    Next
                    <Sparkles className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Start Cooking!
                    <ChefHat className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
            
            {/* Skip option */}
            {currentSlide < slides.length - 1 && (
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full text-gray-600 hover:text-gray-800"
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
