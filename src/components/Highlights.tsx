
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, ShoppingCart, Utensils } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Highlights = () => {
  const { user } = useUser();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {t('highlights.title')}
        </h2>
        <p className="text-gray-600">
          {t('highlights.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">{t('highlights.plans-used')}</p>
                <p className="text-2xl font-bold text-green-700">
                  {user?.subscription.planLimits.usedPlans}/{user?.subscription.planLimits.plansPerMonth}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">{t('highlights.todays-calories')}</p>
                <p className="text-2xl font-bold text-green-700">1,847</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <ShoppingCart className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">{t('highlights.shopping-items')}</p>
                <p className="text-2xl font-bold text-orange-700">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Utensils className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">{t('highlights.pantry-items')}</p>
                <p className="text-2xl font-bold text-orange-700">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Highlights;
