
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Animated background elements with brand colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/10 to-accent/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-accent/10 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-secondary/10 to-primary/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-gradient-to-r from-primary/15 to-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced header with brand colors */}
      <header className="relative bg-card/90 backdrop-blur-md border-b border-border/50 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-r from-primary via-accent to-primary rounded-xl shadow-lg">
              <Utensils className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSelector variant="button" />
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-2 text-sm sm:text-base px-3 sm:px-4 py-2 rounded-xl hover:bg-muted/80 transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('common.back')} to {t('nav.home')}</span>
              <span className="sm:hidden">{t('common.back')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Compact main content with better mobile optimization */}
      <section className="relative py-4 sm:py-6 px-3 sm:px-4">
        <div className="container mx-auto max-w-full sm:max-w-6xl">
          {/* Compact welcome card - reduced size significantly */}
          <div className="relative mb-6 sm:mb-8 lg:hidden">
            <Card className="relative bg-card/95 backdrop-blur-md border-border shadow-xl rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              
              <CardHeader className="text-center px-4 py-6">
                <div className="flex justify-center mb-3">
                  <div className="p-2.5 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-lg">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
                  {t('signup.title')}
                </CardTitle>
                
                <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t('signup.subtitle')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Desktop welcome card - even more compact */}
          <div className="relative mb-6 sm:mb-8 hidden lg:block">
            <Card className="relative bg-card/95 backdrop-blur-md border-border shadow-xl rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              
              <CardHeader className="text-center px-6 py-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-lg">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
                  {t('signup.title')}
                </CardTitle>
                
                <CardDescription className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {t('signup.subtitle')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          {/* Signup steps container - now takes more space */}
          <div className="px-0">
            <SignupSteps />
          </div>
          
          {/* Compact footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-card/60 backdrop-blur-sm rounded-xl"></div>
              <div className="relative p-4 sm:p-6">
                <p className="text-muted-foreground text-sm sm:text-base">
                  {t('signup.already-account')}{' '}
                  <Button
                    variant="link"
                    onClick={() => navigate('/signin')}
                    className="text-primary hover:text-accent p-0 font-bold text-sm sm:text-base transition-colors duration-200"
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
