
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import SignupSteps from "@/components/SignupSteps";

const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-2 sm:px-3">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </header>

      {/* Sign Up Form */}
      <section className="py-4 sm:py-8 px-3 sm:px-4">
        <div className="container mx-auto max-w-full sm:max-w-2xl">
          <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg sm:shadow-2xl mb-4 sm:mb-6">
            <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl text-green-700 mb-1 sm:mb-2">
                {t('signup.title')}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base md:text-lg">
                {t('signup.subtitle')}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="px-1 sm:px-0">
            <SignupSteps />
          </div>
          
          <div className="mt-4 sm:mt-6 text-center px-4 sm:px-0">
            <p className="text-gray-600 text-sm sm:text-base">
              {t('signup.alreadyHaveAccount')}{' '}
              <Button
                variant="link"
                onClick={() => navigate('/signin')}
                className="text-green-600 hover:text-green-700 p-0 font-semibold text-sm sm:text-base"
              >
                {t('signup.signInHere')}
              </Button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
