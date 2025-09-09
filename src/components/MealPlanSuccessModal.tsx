
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Calendar, Users, Clock, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MealPlanSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlan?: () => void;
  mealPlan?: {
    name: string;
    numberOfDays: number;
    numberOfPersons: number;
    mealsPerDay: number;
  };
}

const MealPlanSuccessModal = ({ isOpen, onClose, onViewPlan, mealPlan }: MealPlanSuccessModalProps) => {
  const { t } = useLanguage();
  console.log('this is the meal plan received ', mealPlan)
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
            {t('mealPlanSuccess.title') || 'Meal Plan Created Successfully! 🎉'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-600">
            {t('mealPlanSuccess.yourPersonalized') || 'Your personalized AI meal plan'} {t('mealPlanSuccess.readyToUse') || 'has been generated and is ready to use!'}
          </p>
          
          {mealPlan && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center space-y-1">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{mealPlan.numberOfDays} {t('mealPlanSuccess.days') || 'Days'}</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{mealPlan.numberOfPersons} {t('mealPlanSuccess.person') || 'Person'}{mealPlan.numberOfPersons > 1 ? 's' : ''}</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{mealPlan.mealsPerDay} {t('mealPlanSuccess.mealsPerDay') || 'Meals/Day'}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 space-y-3">
            {/* {onViewPlan && (
              <Button 
                onClick={onViewPlan}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('mealPlanSuccess.viewDetails') || 'View Meal Plan Details'}
              </Button>
            )} */}
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t('mealPlanSuccess.backToPlans') || 'Back to Meal Plans'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanSuccessModal;
