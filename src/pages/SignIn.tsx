
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import PasswordRecovery from "@/components/PasswordRecovery";
import LanguageSelector from "@/components/LanguageSelector";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate('/'); // Navigate to dashboard after successful login
    } catch (error) {
      // Handle specific error messages from the API
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      let title = "Sign in failed";
      let description = "Please check your credentials and try again.";
      
      // Handle specific error cases
      if (errorMessage.includes("No user exists with email")) {
        title = "Account not found";
        description = "No account found with this email address. Please check your email or create a new account.";
      } else if (errorMessage.includes("Invalid email or password")) {
        title = "Invalid credentials";
        description = "The email or password you entered is incorrect. Please try again.";
      } else if (errorMessage.includes("email") || errorMessage.includes("password")) {
        // Generic handling for other email/password related errors
        title = "Login failed";
        description = errorMessage;
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showPasswordRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100 flex items-center justify-center p-4">
        <PasswordRecovery onBack={() => setShowPasswordRecovery(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSelector variant="button" />
            <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.back')} to {t('nav.home')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sign In Form */}
      <section className="py-8 md:py-20 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl text-green-700 mb-2">{t('signin.title')}</CardTitle>
              <CardDescription className="text-base md:text-lg">
                {t('signin.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-base">{t('signin.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-green-200 focus:border-green-400 h-12 text-base mt-1"
                    placeholder={t('signin.email.placeholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-base">{t('signin.password')}</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-green-200 focus:border-green-400 h-12 text-base pr-12"
                      placeholder={t('signin.password.placeholder')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <Button 
                    type="button"
                    variant="link" 
                    className="text-green-600 hover:text-green-700 p-0"
                    onClick={() => setShowPasswordRecovery(true)}
                  >
                    {t('signin.forgot-password')}
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? t('signin.signing-in') : t('signin.button')}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {t('signin.no-account')}{' '}
                  <Button
                    variant="link"
                    onClick={() => navigate('/signup')}
                    className="text-green-600 hover:text-green-700 p-0 font-semibold"
                  >
                    {t('signin.create-here')}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default SignIn;
