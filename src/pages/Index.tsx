
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils, Menu, X, Sparkles, Shield, Heart, TrendingUp, Users, Star } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Dashboard from "@/components/Dashboard";
import LanguageSelector from "@/components/LanguageSelector";
import { useEffect, useState } from "react";

const Index = () => {
  const { isAuthenticated, user, checkSubscription } = useUser();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      checkSubscription();
    }
  }, [isAuthenticated, checkSubscription]);

  // Redirect mobile users to login if not authenticated
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  // If user is authenticated, show the full dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // If not authenticated, show the landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-background to-secondary">
      {/* Navigation */}
      <nav className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - enhanced design */}
            <div className="flex items-center space-x-2">
              <div className="relative p-1.5 sm:p-2">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-sm opacity-75"></div>
                <div className="relative p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg">
                  <Utensils className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Pantry
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Smart Meal Planning</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/why-pantry" 
                className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium relative group"
              >
                {t('home.nav.why-pantry')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link 
                to="/pricing" 
                className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium relative group"
              >
                {t('nav.pricing')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <LanguageSelector variant="button" className="mr-2" />
              <Link to="/signin">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 font-semibold">
                  {t('nav.signin')}
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  {t('home.nav.get-started')}
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-foreground hover:bg-primary/10"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 bg-card/50 backdrop-blur-sm rounded-lg">
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/why-pantry" 
                  className="text-foreground/80 hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('home.nav.why-pantry')}
                </Link>
                <Link 
                  to="/pricing" 
                  className="text-foreground/80 hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.pricing')}
                </Link>
                <div className="px-3 py-1">
                  <LanguageSelector className="w-full" />
                </div>
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 font-semibold">
                      {t('nav.signin')}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold">
                      {t('home.nav.get-started')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Fresh vegetables and healthy ingredients" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-28 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Smart AI-Powered Planning</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-200">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('home.cta.primary')}
                </Button>
              </Link>
              <Link to="/why-pantry">
                <Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary/10 font-semibold px-8 py-4 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-primary" />
                <span>10k+ users</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-accent fill-current" />
                <span>4.9 rating</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-primary" />
                <span>Trusted & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4 border border-primary/20">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Why Choose Pantry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group">
              <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-card/90">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:from-primary/30 group-hover:to-primary/20 transition-colors duration-300 border border-primary/20">
                    <Utensils className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('home.features.smart-planning.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.smart-planning.description')}
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-card/90">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto group-hover:from-accent/30 group-hover:to-accent/20 transition-colors duration-300 border border-accent/20">
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('home.features.reduce-waste.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.reduce-waste.description')}
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-card/90">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto group-hover:from-primary/30 group-hover:to-accent/30 transition-colors duration-300 border border-primary/20">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('home.features.save-money.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.save-money.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary/5 to-accent/5 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Meal Planning?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who have already revolutionized their kitchen with smart AI planning.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-200">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free Today
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card/90 backdrop-blur-sm border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                <Utensils className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pantry
              </span>
            </div>
            <p className="text-muted-foreground">
              {t('home.footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
