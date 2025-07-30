
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";

interface MealPlanSuccessModalProps {
  isOpen: boolean;
  planName: string;
  onClose: () => void;
  onViewPlan: () => void;
}

const MealPlanSuccessModal = ({ isOpen, planName, onClose, onViewPlan }: MealPlanSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Meal Plan Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Your personalized meal plan "{planName}" has been generated and is ready to view.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-3 mt-6">
          <Button 
            onClick={onViewPlan}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            View Your Meal Plan
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Stay on Planner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanSuccessModal;
