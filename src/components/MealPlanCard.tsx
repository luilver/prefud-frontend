import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Users, ChefHat, Clock, Baby, UserRound } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MealPlanCardProps {
  plan: any;
  onClick: (plan: any) => void;
}

const MealPlanCard = ({ plan, onClick }: MealPlanCardProps) => {
  const { t } = useLanguage();

  const daysCount = plan.duration
    ? parseInt(plan.duration.replace(' days', ''))
    : plan.preferences?.numberOfWeeks
      ? plan.preferences.numberOfWeeks * 7
      : 7;
  const peopleCount = plan.preferences?.numberOfPersons || plan.preferences?.people || 'N/A';
  const mealsCount = plan.preferences?.mealsPerDay || '3';
  const kidsUnder5 = plan.numberKidsLessThan5 || plan.preferences?.numberKidsLessThan5 || 0;
  const kids5to12 = plan.numberKids5To12 || plan.preferences?.numberKids5To12 || 0;

  return (
    <Card
      className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden group relative"
      onClick={() => onClick(plan)}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
          <span className="truncate">{plan.name}</span>
        </CardTitle>
        <CardDescription className="text-gray-500 text-xs">
          {plan.startDate} - {new Date(plan.endDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Key stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col items-center bg-emerald-50 rounded-lg py-2 px-1">
            <Calendar className="h-3.5 w-3.5 text-emerald-600 mb-1" />
            <span className="text-sm font-semibold text-gray-800">{daysCount}</span>
            <span className="text-[10px] text-gray-500">{t('mealPlanner.days') || 'Days'}</span>
          </div>
          <div className="flex flex-col items-center bg-teal-50 rounded-lg py-2 px-1">
            <Users className="h-3.5 w-3.5 text-teal-600 mb-1" />
            <span className="text-sm font-semibold text-gray-800">{peopleCount}</span>
            <span className="text-[10px] text-gray-500">{t('mealPlanner.people') || 'People'}</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 rounded-lg py-2 px-1">
            <Clock className="h-3.5 w-3.5 text-blue-600 mb-1" />
            <span className="text-sm font-semibold text-gray-800">{mealsCount}</span>
            <span className="text-[10px] text-gray-500">{t('mealPlanner.mealsDay') || 'Meals/Day'}</span>
          </div>
        </div>

        {/* Kids info */}
        {(kidsUnder5 > 0 || kids5to12 > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {kidsUnder5 > 0 && (
              <div className="flex items-center gap-1.5 bg-pink-50 text-pink-700 rounded-full px-2.5 py-1 text-xs font-medium">
                <Baby className="h-3 w-3" />
                {kidsUnder5} {t('mealPlanner.kidsUnder5') || 'under 5'}
              </div>
            )}
            {kids5to12 > 0 && (
              <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 rounded-full px-2.5 py-1 text-xs font-medium">
                <UserRound className="h-3 w-3" />
                {kids5to12} {t('mealPlanner.kids5to12') || 'ages 5-12'}
              </div>
            )}
          </div>
        )}

        {/* Tags row */}
        <div className="space-y-1.5 mb-3">
          {plan.preferences?.cuisinePreferences && plan.preferences.cuisinePreferences.length > 0 && (
            <div className="text-xs text-emerald-700 font-medium bg-emerald-50 rounded-full px-2.5 py-0.5 inline-block mr-1">
              {plan.preferences.cuisinePreferences.join(', ')}
            </div>
          )}
          {plan.preferences?.dietaryRestrictions && plan.preferences.dietaryRestrictions.length > 0 && (
            <div className="text-xs text-teal-700 font-medium bg-teal-50 rounded-full px-2.5 py-0.5 inline-block mr-1">
              {plan.preferences.dietaryRestrictions.join(', ')}
            </div>
          )}
          {plan.preferences?.cookingSkillLevel && (
            <div className="text-xs text-blue-700 font-medium bg-blue-50 rounded-full px-2.5 py-0.5 inline-block">
              {plan.preferences.cookingSkillLevel}
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>{plan.meals?.length || 0} {t('mealPlanner.totalMealsPlanned') || 'meals'}</span>
          <div className="flex items-center gap-3">
            {plan.shoppingList && plan.shoppingList.length > 0 && (
              <span className="text-orange-600">{plan.shoppingList.length} {t('mealPlanner.ingredients') || 'items'}</span>
            )}
            {plan.totalCarbonFootprint && (
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {plan.totalCarbonFootprint} kg CO₂
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanCard;
