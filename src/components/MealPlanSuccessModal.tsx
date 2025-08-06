
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Clock, Users, ChefHat, Eye, Utensils } from "lucide-react";

interface MealPlanSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewMeal?: () => void;
  meal?: {
    name: string;
    cuisine: string;
    cookingTime: number;
    servings: number;
    difficulty: string;
    description?: string;
  };
}

const MealPlanSuccessModal = ({ isOpen, onClose, onViewMeal, meal }: MealPlanSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            AI Meal Created Successfully! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-600">
            Your personalized AI meal <strong>"{meal?.name}"</strong> has been generated and is ready to cook!
          </p>
          
          {meal && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col items-center space-y-1">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{meal.cookingTime} mins</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{meal.servings} serving{meal.servings > 1 ? 's' : ''}</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Utensils className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{meal.cuisine}</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <ChefHat className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{meal.difficulty}</span>
                </div>
              </div>
              {meal.description && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-purple-700 italic">{meal.description}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="pt-4 space-y-3">
            {onViewMeal && (
              <Button 
                onClick={onViewMeal}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Recipe Details
              </Button>
            )}
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Another Meal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanSuccessModal;
