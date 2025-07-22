
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils, Menu, X } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - matching dashboard design */}
            <div className="flex items-center space-x-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
                <Utensils className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
                Pantry
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/why-pantry" className="text-gray-600 hover:text-green-600 transition-colors">
                {t('home.nav.why-pantry')}
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                {t('nav.pricing')}
              </Link>
              <LanguageSelector variant="button" className="mr-2" />
              <Link to="/signin">
                <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                  {t('nav.signin')}
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
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
                className="text-gray-600"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-green-200 pt-4">
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/why-pantry" 
                  className="text-gray-600 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('home.nav.why-pantry')}
                </Link>
                <Link 
                  to="/pricing" 
                  className="text-gray-600 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.pricing')}
                </Link>
                <div className="px-2 py-1">
                  <LanguageSelector className="w-full" />
                </div>
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                      {t('nav.signin')}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          {t('home.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {t('home.subtitle')}
        </p>
        <div className="flex justify-center">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
              {t('home.cta.primary')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Simple Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('home.features.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('home.features.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.smart-planning.title')}</h3>
            <p className="text-gray-600">{t('home.features.smart-planning.description')}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.reduce-waste.title')}</h3>
            <p className="text-gray-600">{t('home.features.reduce-waste.description')}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.save-money.title')}</h3>
            <p className="text-gray-600">{t('home.features.save-money.description')}</p>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>{t('home.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
