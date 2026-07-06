import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Utensils,
  Menu,
  X,
  Sparkles,
  Shield,
  Heart,
  TrendingUp,
  Users,
  Star,
  ChefHat,
  Leaf,
  Timer,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";
import LanguageSelector from "@/components/LanguageSelector";
import { useEffect, useState } from "react";
import { trackEvent } from "@/services/analytics";

import { useThemeLogo } from "@/contexts/ThemeContext";

const Index = () => {
  const { isAuthenticated, user, checkSubscription } = useUser();
  const { isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const logoUrl = useThemeLogo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      checkSubscription();
    }
  }, [isAuthenticated, checkSubscription]);

  // Redirect mobile users to login if not authenticated (only after auth loading completes)
  useEffect(() => {
    if (isAuthLoading) return;
    // const isMobile = window.innerWidth <= 768;
    // if (isMobile && !isAuthenticated) {
      // navigate("/signin");
    // }
  }, [isAuthenticated, isAuthLoading, navigate]);

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
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logoUrl}
                alt="prefud"
                className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/why-pantry"
                className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium relative group"
              >
                {t("home.nav.why-pantry")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                to="/pricing"
                className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium relative group"
              >
                {t("nav.pricing")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <LanguageSelector variant="button" className="mr-2" />
              <Link to="/signin">
                <Button
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 font-semibold"
                >
                  {t("nav.signin")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  onClick={async () => {
                    console.log("to get started");
                    trackEvent("button_click", {
                      button_name: "signup_submit",
                      screen: "home_page",
                    });
                  }}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {t("home.nav.get-started")}
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
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
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
                  {t("home.nav.why-pantry")}
                </Link>
                <Link
                  to="/pricing"
                  className="text-foreground/80 hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.pricing")}
                </Link>
                <div className="px-3 py-1">
                  <LanguageSelector className="w-full" />
                </div>
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10 font-semibold"
                    >
                      {t("nav.signin")}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold">
                      {t("home.nav.get-started")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[85vh] md:min-h-[90vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/50"></div>

          {/* Floating food elements - adjusted for mobile */}
          <div className="absolute top-10 left-5 md:top-20 md:left-10 w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-5 md:bottom-40 md:right-20 w-28 h-28 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 md:left-1/3 w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-5 md:space-y-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/15 to-accent/15 text-primary px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-primary/25 backdrop-blur-sm animate-fade-in">
                <ChefHat className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm font-semibold tracking-wide">
                  AI-Powered Culinary Experience
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.15] animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Discover the
                <span className="block mt-1 md:mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
                  Art of Cooking
                </span>
              </h1>

              <p
                className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                Transform your kitchen into a culinary haven. Our AI creates
                personalized meal plans, reduces food waste, and helps you cook
                like a professional chef.
              </p>

              {/* Mobile Image Showcase */}
              <div
                className="lg:hidden relative mx-auto max-w-sm animate-fade-in"
                style={{ animationDelay: "0.25s" }}
              >
                <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-60"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop"
                    alt="Delicious gourmet cuisine"
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
                </div>

                {/* Mobile Floating Stats */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
                  <div className="bg-card/95 backdrop-blur-xl rounded-xl px-3 py-2 shadow-lg border border-border/50">
                    <div className="flex items-center space-x-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-bold text-foreground">
                        2.5kg CO₂
                      </span>
                    </div>
                  </div>
                  <div className="bg-card/95 backdrop-blur-xl rounded-xl px-3 py-2 shadow-lg border border-border/50">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        15 min
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start animate-fade-in pt-4 lg:pt-0"
                style={{ animationDelay: "0.3s" }}
              >
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    onClick={async () => {
                      console.log("start free trial ");
                      trackEvent("button_click", {
                        button_name: "start_free_trial_submit",
                        screen: "home_page",
                      });
                    }}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-6 md:px-8 py-5 md:py-6 text-base md:text-lg shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 group"
                  >
                    <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:animate-pulse" />
                    {t("home.cta.primary")}
                  </Button>
                </Link>
                <Link to="/why-pantry" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 border-primary/40 text-foreground hover:bg-primary/10 hover:border-primary/60 font-semibold px-6 md:px-8 py-5 md:py-6 text-base md:text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-6 pt-2 md:pt-4 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center space-x-1.5 md:space-x-2 bg-card/50 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border/50">
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  <span className="text-xs md:text-sm font-medium text-foreground">
                    10k+ Chefs
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 md:space-x-2 bg-card/50 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border/50">
                  <div className="flex -space-x-0.5 md:-space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 md:h-3.5 md:w-3.5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm font-medium text-foreground">
                    4.9
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 md:space-x-2 bg-card/50 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border/50">
                  <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  <span className="text-xs md:text-sm font-medium text-foreground">
                    Secure
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content - Cuisine Showcase (Desktop only) */}
            <div
              className="relative hidden lg:block animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              {/* Main Image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-2xl opacity-60"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1740&auto=format&fit=crop"
                    alt="Delicious gourmet cuisine"
                    className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                </div>

                {/* Floating Cards */}
                <div
                  className="absolute -left-8 top-20 bg-card/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50 animate-fade-in hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Carbon Saved
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        2.5 kg CO₂
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -right-6 top-40 bg-card/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50 animate-fade-in hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: "0.6s" }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                      <Timer className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Quick Prep
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        15 min
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute left-1/2 -translate-x-1/2 -bottom-6 bg-card/95 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-xl border border-border/50 animate-fade-in hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: "0.7s" }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                        A
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        M
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-xs font-bold text-primary-foreground">
                        K
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Loved by chefs
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        1,234 recipes created today
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4 border border-primary/20">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Why Choose Prefud</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.subtitle")}
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
                  {t("home.features.smart-planning.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.features.smart-planning.description")}
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
                  {t("home.features.reduce-waste.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.features.reduce-waste.description")}
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
                  {t("home.features.save-money.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.features.save-money.description")}
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
              Join thousands of users who have already revolutionized their
              kitchen with smart AI planning.
            </p>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
              >
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
              <img src={logoUrl} alt="prefud" className="h-12 w-auto" />
            </div>
            <div className="flex items-center justify-center space-x-6 mb-4 text-sm text-muted-foreground">
              <Link
                to="/terms"
                className="hover:text-primary transition-colors duration-200"
              >
                Terms & Conditions
              </Link>
              <span className="text-border">•</span>
              <Link
                to="/privacy"
                className="hover:text-primary transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="text-border">•</span>
              <Link
                to="/pricing"
                className="hover:text-primary transition-colors duration-200"
              >
                Pricing
              </Link>
              <span className="text-border">•</span>
              <Link
                to="/why-pantry"
                className="hover:text-primary transition-colors duration-200"
              >
                Why Prefud
              </Link>
            </div>
            <p className="text-muted-foreground">
              {t("home.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
