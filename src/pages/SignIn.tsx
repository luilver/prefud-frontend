
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Pantry</span>
          </Link>
        </div>

        <Card className="border-green-100">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-2xl">{t('signin.title')}</CardTitle>
              <LanguageSelector className="w-32" />
            </div>
            <CardDescription>
              {t('signup.account.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('signup.account.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">{t('signup.account.password')}</Label>
                  <Link 
                    to="/recover-password" 
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    {t('recovery.title')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? t('signup.account.sending') : t('signin.title')}
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('signup.already-account')}{" "}
                <Link to="/signup" className="text-green-600 hover:text-green-700 font-medium">
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

export default SignIn;
