
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";
import SignupForm from "@/components/SignupForm";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const SignUp = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Pantry</span>
          </Link>
        </div>

        <Card className="border-green-100">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center mb-4">
              <div>
                <CardTitle className="text-2xl">{t('signup.title')}</CardTitle>
                <CardDescription className="mt-2">
                  {t('signup.subtitle')}
                </CardDescription>
              </div>
              <LanguageSelector className="w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <SignupForm />
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                {t('signup.already-account')}{" "}
                <Link to="/signin" className="text-green-600 hover:text-green-700 font-medium">
                  {t('signup.signin-here')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
