
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import SignupSteps from "@/components/SignupSteps";
import LanguageSelector from "@/components/LanguageSelector";

const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced header */}
      <header className="relative bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-r from-green-500 via-orange-500 to-green-600 rounded-xl shadow-lg">
              <Utensils className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 via-orange-600 to-green-700 bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSelector variant="button" />
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-2 text-sm sm:text-base px-3 sm:px-4 py-2 rounded-xl hover:bg-white/80 transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('common.back')} to {t('nav.home')}</span>
              <span className="sm:hidden">{t('common.back')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced main content */}
      <section className="relative py-6 sm:py-10 px-3 sm:px-4">
        <div className="container mx-auto max-w-full sm:max-w-6xl">
          {/* Welcome card with enhanced design */}
          <div className="relative mb-8 sm:mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
            <Card className="relative bg-white/95 backdrop-blur-md border-0 shadow-2xl mb-6 sm:mb-8 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-orange-500 to-green-600"></div>
              
              <CardHeader className="text-center px-6 sm:px-8 py-8 sm:py-12">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-orange-500 rounded-3xl shadow-2xl">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                </div>
                
                <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-orange-600 to-green-700 bg-clip-text text-transparent mb-4">
                  {t('signup.title')}
                </CardTitle>
                
                <CardDescription className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {t('signup.subtitle')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          {/* Signup steps container */}
          <div className="px-1 sm:px-0">
            <SignupSteps />
          </div>
          
          {/* Enhanced footer */}
          <div className="mt-8 sm:mt-12 text-center px-4 sm:px-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl"></div>
              <div className="relative p-6 sm:p-8">
                <p className="text-gray-700 text-base sm:text-lg">
                  {t('signup.already-account')}{' '}
                  <Button
                    variant="link"
                    onClick={() => navigate('/signin')}
                    className="text-green-600 hover:text-orange-600 p-0 font-bold text-base sm:text-lg transition-colors duration-200 bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent hover:from-orange-600 hover:to-green-600"
                  >
                    {t('signup.signin-here')}
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
