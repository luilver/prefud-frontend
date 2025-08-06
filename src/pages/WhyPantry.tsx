
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ArrowLeft, Leaf, Clock, DollarSign, Users, TrendingDown, Recycle, ShoppingCart, Calendar, BarChart3, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import Footer from "@/components/Footer";

const WhyPantry = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Utensils className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector variant="button" />
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center space-x-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.back')} to {t('nav.home')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=900&fit=crop&crop=center" 
            alt="Fresh vegetables and healthy ingredients" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/70"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight drop-shadow-lg">
              {t('why-pantry.title.main')}
              <br />
              <span className="text-3xl md:text-5xl text-accent-foreground/90">{t('why-pantry.title.sub')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow">
              {t('why-pantry.hero.description')}
            </p>
          </div>

          {/* Impact Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border-white/30 text-center hover:shadow-lg transition-all shadow-lg">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">40%</div>
                <div className="text-sm text-foreground/80">{t('why-pantry.stats.food-waste')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-white/30 text-center hover:shadow-lg transition-all shadow-lg">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-accent-foreground mb-2">$1,200</div>
                <div className="text-sm text-foreground/80">{t('why-pantry.stats.yearly-savings')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-white/30 text-center hover:shadow-lg transition-all shadow-lg">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-sidebar-ring mb-2">6 hrs</div>
                <div className="text-sm text-foreground/80">{t('why-pantry.stats.time-saved')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-white/30 text-center hover:shadow-lg transition-all shadow-lg">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-secondary-foreground mb-2">2.3 tons</div>
                <div className="text-sm text-foreground/80">{t('why-pantry.stats.co2-reduced')}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Benefits Sections */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl space-y-20">
          
          {/* Food Waste Reduction */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/20 rounded-full mr-4">
                  <Recycle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary">{t('why-pantry.eliminate-waste.title')}</h2>
              </div>
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                {t('why-pantry.eliminate-waste.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.eliminate-waste.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.eliminate-waste.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.eliminate-waste.feature3')}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-primary/20 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&h=400&fit=crop&crop=center" 
                alt="Fresh fruits and vegetables" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="text-2xl font-bold text-primary mb-2">40% {t('why-pantry.eliminate-waste.stat')}</div>
              <div className="text-foreground/80">{t('why-pantry.eliminate-waste.stat-desc')}</div>
            </div>
          </div>

          {/* Time Optimization */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 text-center border border-sidebar-ring/20 shadow-lg order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=500&h=400&fit=crop&crop=center" 
                alt="Modern kitchen with organized pantry" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="text-2xl font-bold text-sidebar-ring mb-2">6 {t('why-pantry.optimize-time.stat')}</div>
              <div className="text-foreground/80">{t('why-pantry.optimize-time.stat-desc')}</div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-sidebar-ring/20 rounded-full mr-4">
                  <Clock className="h-8 w-8 text-sidebar-ring" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-sidebar-ring">{t('why-pantry.optimize-time.title')}</h2>
              </div>
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                {t('why-pantry.optimize-time.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-sidebar-ring rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.optimize-time.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-sidebar-ring rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.optimize-time.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-sidebar-ring rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.optimize-time.feature3')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Money Savings */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-accent/30 rounded-full mr-4">
                  <DollarSign className="h-8 w-8 text-accent-foreground" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground">{t('why-pantry.save-money.title')}</h2>
              </div>
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                {t('why-pantry.save-money.description')}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-accent/10 border-accent/30">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 text-accent-foreground mx-auto mb-2" />
                    <div className="font-bold text-accent-foreground">$100/month</div>
                    <div className="text-sm text-foreground/70">{t('why-pantry.save-money.stat1')}</div>
                  </CardContent>
                </Card>
                <Card className="bg-accent/10 border-accent/30">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-6 w-6 text-accent-foreground mx-auto mb-2" />
                    <div className="font-bold text-accent-foreground">30% {t('why-pantry.save-money.stat2')}</div>
                    <div className="text-sm text-foreground/70">{t('why-pantry.save-money.stat2-desc')}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-accent/30 shadow-lg">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent-foreground mb-2">$1,200</div>
                  <div className="text-foreground/80">{t('why-pantry.stats.yearly-savings')}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-accent/10 rounded-lg p-3 text-center border border-accent/20">
                    <div className="font-semibold text-accent-foreground">$600</div>
                    <div className="text-foreground/70">{t('why-pantry.save-money.breakdown.food-waste')}</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3 text-center border border-accent/20">
                    <div className="font-semibold text-accent-foreground">$400</div>
                    <div className="text-foreground/70">{t('why-pantry.save-money.breakdown.smart-shopping')}</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3 text-center border border-accent/20">
                    <div className="font-semibold text-accent-foreground">$150</div>
                    <div className="text-foreground/70">{t('why-pantry.save-money.breakdown.bulk-buying')}</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3 text-center border border-accent/20">
                    <div className="font-semibold text-accent-foreground">$50</div>
                    <div className="text-foreground/70">{t('why-pantry.save-money.breakdown.coupons')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Footprint */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 text-center border border-secondary/30 shadow-lg order-2 md:order-1">
              <Leaf className="h-16 w-16 text-secondary-foreground mx-auto mb-4" />
              <div className="text-2xl font-bold text-secondary-foreground mb-2">2.3 {t('why-pantry.carbon-footprint.stat')}</div>
              <div className="text-foreground/80 mb-4">{t('why-pantry.carbon-footprint.stat-desc')}</div>
              <div className="text-sm text-foreground/70 leading-relaxed">
                {t('why-pantry.carbon-footprint.equivalent')}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-secondary/30 rounded-full mr-4">
                  <Leaf className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground">{t('why-pantry.carbon-footprint.title')}</h2>
              </div>
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                {t('why-pantry.carbon-footprint.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary-foreground rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.carbon-footprint.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary-foreground rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.carbon-footprint.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary-foreground rounded-full"></div>
                  <span className="text-foreground">{t('why-pantry.carbon-footprint.feature3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            {t('why-pantry.features.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-card border-primary/30 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10">
              <CardHeader>
                <ShoppingCart className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-primary">{t('why-pantry.features.shopping-lists.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  {t('why-pantry.features.shopping-lists.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-sidebar-ring/30 hover:shadow-xl transition-all duration-300 hover:border-sidebar-ring/50 hover:shadow-sidebar-ring/10">
              <CardHeader>
                <Calendar className="h-10 w-10 text-sidebar-ring mb-4" />
                <CardTitle className="text-sidebar-ring">{t('why-pantry.features.meal-planning.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  {t('why-pantry.features.meal-planning.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-accent/40 hover:shadow-xl transition-all duration-300 hover:border-accent/60 hover:shadow-accent/10">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-accent-foreground mb-4" />
                <CardTitle className="text-accent-foreground">{t('why-pantry.features.analytics.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  {t('why-pantry.features.analytics.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-accent relative overflow-hidden">
        <div className="container mx-auto text-center text-white relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            {t('why-pantry.cta.title')}
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95 drop-shadow">
            {t('why-pantry.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/signup')}
            >
              {t('home.nav.get-started')} {t('why-pantry.cta.primary')}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all bg-transparent"
              onClick={() => navigate('/')}
            >
              {t('why-pantry.cta.secondary')}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyPantry;
