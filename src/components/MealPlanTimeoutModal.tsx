
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, Sparkles } from "lucide-react";

interface MealPlanTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MealPlanTimeoutModal = ({ isOpen, onClose }: MealPlanTimeoutModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Clock className="h-16 w-16 text-orange-500" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full p-1">
                <Coffee className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Your Meal Plan is Being Created ⏳
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-600">
            Our AI is working hard to create your personalized meal plan! This is taking a bit longer than usual, but don't worry.
          </p>
          
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center space-x-2 text-orange-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              <span className="text-sm font-medium">Processing your preferences...</span>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              You can check back in a few minutes - your meal plan will appear in your meal plans section once ready.
            </p>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Check My Meal Plans
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanTimeoutModal;
