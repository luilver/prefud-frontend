import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Truck, ChefHat, TreePine, Calendar, TrendingUp } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";

const CarbonSavingsTracker = () => {
  const [timePeriod, setTimePeriod] = useState("week");
  const { ingredients } = useUser();
  const { t } = useLanguage();

  // Mock calculations - in real app these would come from actual data
  const calculateSavings = () => {
    const baseWeeklySavings = {
      foodWaste: 2.3, // kg CO2 saved from preventing food waste
      mealPrep: 1.8,  // kg CO2 saved from home cooking vs takeout
      total: 4.1
    };

    const multiplier = timePeriod === "month" ? 4.3 : timePeriod === "year" ? 52 : 1;
    
    return {
      foodWaste: (baseWeeklySavings.foodWaste * multiplier).toFixed(1),
      mealPrep: (baseWeeklySavings.mealPrep * multiplier).toFixed(1),
      total: (baseWeeklySavings.total * multiplier).toFixed(1),
      deliveryEmission: 3.2 // kg CO2 per grocery delivery
    };
  };

  const getEquivalents = (totalSavings: string) => {
    const savings = parseFloat(totalSavings);
    return {
      trees: Math.round(savings / 21.8), // 1 tree absorbs ~21.8 kg CO2/year
      carMiles: Math.round(savings / 0.4), // ~0.4 kg CO2 per mile
      lightBulbs: Math.round(savings / 0.45) // ~0.45 kg CO2 per LED bulb/year
    };
  };

  const savings = calculateSavings();
  const equivalents = getEquivalents(savings.total);

  const getPeriodText = () => {
    switch(timePeriod) {
      case "month": return t('carbon.period.month');
      case "year": return t('carbon.period.year');
      default: return t('carbon.period.week');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <span>{t('carbon.title')}</span>
          </h3>
          <p className="text-gray-600 text-sm">{t('carbon.subtitle')}</p>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t('carbon.time.week')}</SelectItem>
            <SelectItem value="month">{t('carbon.time.month')}</SelectItem>
            <SelectItem value="year">{t('carbon.time.year')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Food Waste Savings */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">{t('carbon.foodWaste.title')}</p>
                <p className="text-2xl font-bold text-green-700">{savings.foodWaste} kg</p>
                <p className="text-xs text-green-600">{t('carbon.foodWaste.saved')} {getPeriodText()}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Prep Savings */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">{t('carbon.mealPrep.title')}</p>
                <p className="text-2xl font-bold text-blue-700">{savings.mealPrep} kg</p>
                <p className="text-xs text-blue-600">{t('carbon.mealPrep.saved')}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <ChefHat className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Impact */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">{t('carbon.delivery.title')}</p>
                <p className="text-2xl font-bold text-orange-700">{savings.deliveryEmission} kg</p>
                <p className="text-xs text-orange-600">{t('carbon.delivery.description')}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Impact & Equivalents */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>{t('carbon.impact.title')}</span>
          </CardTitle>
          <CardDescription className="text-green-100">
            {t('carbon.impact.subtitle')} {getPeriodText()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-bold mb-2">{savings.total} kg CO₂</p>
              <p className="text-green-100">{t('carbon.impact.total')}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold mb-3">{t('carbon.equivalents.title')}</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <TreePine className="h-4 w-4 mx-auto mb-1" />
                  <p className="font-medium">{equivalents.trees}</p>
                  <p className="text-xs opacity-90">{t('carbon.equivalents.trees')}</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <Calendar className="h-4 w-4 mx-auto mb-1" />
                  <p className="font-medium">{equivalents.carMiles}</p>
                  <p className="text-xs opacity-90">{t('carbon.equivalents.carMiles')}</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <Leaf className="h-4 w-4 mx-auto mb-1" />
                  <p className="font-medium">{equivalents.lightBulbs}</p>
                  <p className="text-xs opacity-90">{t('carbon.equivalents.lightBulbs')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">💡 {t('carbon.tips.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• {t('carbon.tips.tip1')}</p>
            <p>• {t('carbon.tips.tip2')}</p>
            <p>• {t('carbon.tips.tip3')}</p>
            <p>• {t('carbon.tips.tip4')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarbonSavingsTracker;
