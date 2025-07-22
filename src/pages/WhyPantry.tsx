
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ArrowLeft, Leaf, Clock, DollarSign, Users, TrendingDown, Recycle, ShoppingCart, Calendar, BarChart3, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const WhyPantry = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector variant="button" />
            <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.back')} to {t('nav.home')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-orange-600 to-green-600 bg-clip-text text-transparent leading-tight">
              {t('why-pantry.title.main')}
              <br />
              <span className="text-3xl md:text-5xl">{t('why-pantry.title.sub')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('why-pantry.hero.description')}
            </p>
          </div>

          {/* Impact Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200 text-center">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">40%</div>
                <div className="text-sm text-gray-600">{t('why-pantry.stats.food-waste')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 text-center">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">$1,200</div>
                <div className="text-sm text-gray-600">{t('why-pantry.stats.yearly-savings')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 text-center">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">6 hrs</div>
                <div className="text-sm text-gray-600">{t('why-pantry.stats.time-saved')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 text-center">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">2.3 tons</div>
                <div className="text-sm text-gray-600">{t('why-pantry.stats.co2-reduced')}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Benefits Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-20">
          
          {/* Food Waste Reduction */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <Recycle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-green-700">{t('why-pantry.eliminate-waste.title')}</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {t('why-pantry.eliminate-waste.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.eliminate-waste.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.eliminate-waste.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.eliminate-waste.feature3')}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8 text-center">
              <img 
                src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&h=400&fit=crop&crop=center" 
                alt="Fresh fruits and vegetables" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="text-2xl font-bold text-green-700 mb-2">40% {t('why-pantry.eliminate-waste.stat')}</div>
              <div className="text-green-600">{t('why-pantry.eliminate-waste.stat-desc')}</div>
            </div>
          </div>

          {/* Time Optimization */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 text-center order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=500&h=400&fit=crop&crop=center" 
                alt="Modern kitchen with organized pantry" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="text-2xl font-bold text-blue-700 mb-2">6 {t('why-pantry.optimize-time.stat')}</div>
              <div className="text-blue-600">{t('why-pantry.optimize-time.stat-desc')}</div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-blue-700">{t('why-pantry.optimize-time.title')}</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {t('why-pantry.optimize-time.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.optimize-time.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.optimize-time.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.optimize-time.feature3')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Money Savings */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-orange-100 rounded-full mr-4">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-orange-700">{t('why-pantry.save-money.title')}</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {t('why-pantry.save-money.description')}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="font-bold text-orange-700">$100/month</div>
                    <div className="text-sm text-orange-600">{t('why-pantry.save-money.stat1')}</div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="font-bold text-orange-700">30% {t('why-pantry.save-money.stat2')}</div>
                    <div className="text-sm text-orange-600">{t('why-pantry.save-money.stat2-desc')}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-700 mb-2">$1,200</div>
                  <div className="text-orange-600">{t('why-pantry.stats.yearly-savings')}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-700">$600</div>
                    <div className="text-orange-600">{t('why-pantry.save-money.breakdown.food-waste')}</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-700">$400</div>
                    <div className="text-orange-600">{t('why-pantry.save-money.breakdown.smart-shopping')}</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-700">$150</div>
                    <div className="text-orange-600">{t('why-pantry.save-money.breakdown.bulk-buying')}</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-700">$50</div>
                    <div className="text-orange-600">{t('why-pantry.save-money.breakdown.coupons')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Footprint */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-8 text-center order-2 md:order-1">
              <Leaf className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <div className="text-2xl font-bold text-purple-700 mb-2">2.3 {t('why-pantry.carbon-footprint.stat')}</div>
              <div className="text-purple-600 mb-4">{t('why-pantry.carbon-footprint.stat-desc')}</div>
              <div className="text-sm text-purple-600 leading-relaxed">
                {t('why-pantry.carbon-footprint.equivalent')}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <Leaf className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-purple-700">{t('why-pantry.carbon-footprint.title')}</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {t('why-pantry.carbon-footprint.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.carbon-footprint.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.carbon-footprint.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">{t('why-pantry.carbon-footprint.feature3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            {t('why-pantry.features.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <ShoppingCart className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle className="text-green-700">{t('why-pantry.features.shopping-lists.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('why-pantry.features.shopping-lists.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <Calendar className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle className="text-blue-700">{t('why-pantry.features.meal-planning.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('why-pantry.features.meal-planning.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle className="text-orange-700">{t('why-pantry.features.analytics.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('why-pantry.features.analytics.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-orange-600">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('why-pantry.cta.title')}
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('why-pantry.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3"
              onClick={() => navigate('/signup')}
            >
              {t('home.nav.get-started')} {t('why-pantry.cta.primary')}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-3"
              onClick={() => navigate('/')}
            >
              {t('why-pantry.cta.secondary')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyPantry;
