import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ArrowLeft, Sparkles, Shield, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import SignupSteps from "@/components/SignupSteps";
import LanguageSelector from "@/components/LanguageSelector";

const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Premium Food Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')`
        }}
      />
      
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      {/* Subtle Warm Accent */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 via-transparent to-emerald-900/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Minimal Header */}
        <header className="py-4 px-4 md:py-6">
          <div className="container mx-auto flex items-center justify-between">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 group"
            >
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Utensils className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="font-logo text-2xl text-white/90">
                prefud
              </span>
            </button>
            
            <div className="flex items-center gap-2">
              <LanguageSelector variant="button" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">{t("signup.backToStart")}</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-4 py-6 md:py-10">
          <div className="w-full max-w-4xl">
            {/* Welcome Card */}
            <Card className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden mb-6">
              <CardHeader className="text-center space-y-3 pt-6 pb-4 px-6">
                <div className="mx-auto p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl w-fit shadow-lg shadow-emerald-500/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                  {t('signup.title')}
                </CardTitle>
                <CardDescription className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base max-w-xl mx-auto">
                  {t('signup.subtitle')}
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Signup Steps Container */}
            <Card className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <SignupSteps />
              </CardContent>
            </Card>
            
            {/* Footer */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                <p className="text-white/80 text-sm">
                  {t('signup.already-account')}{' '}
                  <Button
                    variant="link"
                    onClick={() => navigate('/signin')}
                    className="text-emerald-400 hover:text-emerald-300 p-0 h-auto font-semibold text-sm"
                  >
                    {t('signup.signin-here')}
                  </Button>
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-5 mt-5">
              <div className="flex items-center gap-1.5 text-white/60">
                <Shield className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Secure</span>
              </div>
              <div className="w-1 h-1 bg-white/30 rounded-full" />
              <div className="flex items-center gap-1.5 text-white/60">
                <Lock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">256-bit SSL</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignUp;
