
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, ShoppingCart, Utensils, ChefHat, Clock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Highlights = () => {
  const { user } = useUser();
  const { t } = useLanguage();

  const highlightCards = [
    {
      title: t('highlights.plans-used'),
      value: `${user?.subscription.planLimits.usedPlans}/${user?.subscription.planLimits.plansPerMonth}`,
      icon: Calendar,
      gradient: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-300/30",
      iconColor: "text-green-600",
      valueColor: "text-green-700",
      bgPattern: "bg-green-50/50"
    },
    {
      title: t('highlights.todays-calories'),
      value: "1,847",
      icon: TrendingUp,
      gradient: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-300/30",
      iconColor: "text-orange-600",
      valueColor: "text-orange-700",
      bgPattern: "bg-orange-50/50"
    },
    {
      title: t('highlights.shopping-items'),
      value: "23",
      icon: ShoppingCart,
      gradient: "from-green-600/20 to-orange-500/20",
      borderColor: "border-green-300/30",
      iconColor: "text-green-600",
      valueColor: "text-green-700",
      bgPattern: "bg-gradient-to-br from-green-50/30 to-orange-50/30"
    },
    {
      title: t('highlights.pantry-items'),
      value: "45",
      icon: Utensils,
      gradient: "from-orange-600/20 to-green-500/20",
      borderColor: "border-orange-300/30",
      iconColor: "text-orange-600",
      valueColor: "text-orange-700",
      bgPattern: "bg-gradient-to-br from-orange-50/30 to-green-50/30"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Kitchen-Inspired Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl shadow-lg">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-orange-600 bg-clip-text text-transparent">
            {t('highlights.title')}
          </h2>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {t('highlights.subtitle')}
        </p>
        
        {/* Kitchen decoration line */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-green-400"></div>
          <Clock className="h-4 w-4 text-green-500" />
          <div className="w-12 h-0.5 bg-gradient-to-r from-green-400 to-orange-400"></div>
          <Utensils className="h-4 w-4 text-orange-500" />
          <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-transparent"></div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index}
              className={`relative overflow-hidden border-2 ${card.borderColor} bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Pattern background */}
              <div className={`absolute inset-0 ${card.bgPattern}`}></div>
              
              <CardContent className="relative p-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                  {/* Icon with enhanced styling */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/50 rounded-full blur-sm"></div>
                    <div className="relative p-3 bg-white/70 backdrop-blur-sm rounded-full border border-white/50 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`h-8 w-8 ${card.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {card.title}
                    </p>
                    <p className={`text-3xl font-bold ${card.valueColor} group-hover:scale-105 transition-transform duration-300`}>
                      {card.value}
                    </p>
                  </div>
                  
                  {/* Progress indicator for plans used */}
                  {index === 0 && user?.subscription.planLimits && (
                    <div className="w-full mt-3">
                      <div className="w-full bg-green-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((user.subscription.planLimits.usedPlans / user.subscription.planLimits.plansPerMonth) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {user.subscription.planLimits.plansPerMonth - user.subscription.planLimits.usedPlans} remaining
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kitchen Activity Timeline (mock data for visual appeal) */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-green-200/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Today's Kitchen Activity</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50/50 rounded-lg border border-green-200/30">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm text-gray-600">Last meal planned</p>
                <p className="font-medium text-green-700">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-orange-50/50 rounded-lg border border-orange-200/30">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse delay-1000"></div>
              <div>
                <p className="text-sm text-gray-600">Ingredients checked</p>
                <p className="font-medium text-orange-700">45 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50/50 rounded-lg border border-green-200/30">
              <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse delay-2000"></div>
              <div>
                <p className="text-sm text-gray-600">Shopping list updated</p>
                <p className="font-medium text-green-700">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Highlights;
