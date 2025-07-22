
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Utensils } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Navigation = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Pantry</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-green-600 ${
                isActive('/') ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium transition-colors hover:text-green-600 ${
                isActive('/pricing') ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              {t('nav.pricing')}
            </Link>
            <Link 
              to="/why-pantry" 
              className={`text-sm font-medium transition-colors hover:text-green-600 ${
                isActive('/why-pantry') ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              {t('nav.why')}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector variant="button" />
            <Button asChild variant="ghost" size="sm">
              <Link to="/signin">{t('signin.title')}</Link>
            </Button>
            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
              <Link to="/signup">{t('signup.title')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
