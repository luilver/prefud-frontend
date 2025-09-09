import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/contexts/LanguageContext";
import PasswordRecovery from "@/components/PasswordRecovery";
import LanguageSelector from "@/components/LanguageSelector";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const { login } = useUser();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, setLanguage } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = await login(email, password);
      //set language for context and translations
      console.log("what i receive from login", userData?.profile);
      if (userData?.profile?.languages && (userData.profile.languages === "en" || userData.profile.languages === "es" || userData.profile.languages === "pt")) {
        console.log(
          "it has a selected language! and it is ",
          userData.profile.languages
        );
        setLanguage(userData.profile.languages as Language);
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/"); // Navigate to dashboard after successful login
    } catch (error) {
      console.log("Login error caught:", error);

      // Handle specific error messages from the API
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.log("Error message:", errorMessage);

      let title = "Sign in failed";
      let description = "Please check your credentials and try again.";

      // Handle specific error cases
      if (errorMessage.includes("No user exists with email")) {
        title = "Account not found";
        description =
          "No account found with this email address. Please check your email or create a new account.";
      } else if (errorMessage.includes("Invalid email or password")) {
        title = "Invalid credentials";
        description =
          "The email or password you entered is incorrect. Please try again.";
      } else if (
        errorMessage.includes(
          "password must be longer than or equal to 8 characters"
        )
      ) {
        title = "Password too short";
        description = "Password must be at least 8 characters long.";
      } else if (
        errorMessage.includes("email") ||
        errorMessage.includes("password")
      ) {
        // Generic handling for other email/password related errors
        title = "Login failed";
        description = errorMessage;
      }

      console.log("Showing toast with:", { title, description });

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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-secondary/20 flex items-center justify-center p-4">
        <PasswordRecovery onBack={() => setShowPasswordRecovery(false)} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-secondary/20">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-r from-primary to-accent rounded-xl shadow-md">
              <Utensils className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSelector variant="button" />
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>
                {t("common.back")} to {t("nav.home")}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sign In Form */}
      <section className="py-8 md:py-20 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto p-3 bg-gradient-to-r from-primary to-accent rounded-xl w-fit">
                <Utensils className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-foreground font-bold">
                {t("signin.title")}
              </CardTitle>
              <CardDescription className="text-base md:text-lg text-muted-foreground">
                {t("signin.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-base font-medium text-foreground"
                  >
                    {t("signin.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-border/50 focus:border-primary bg-background/50 h-12 text-base transition-colors"
                    placeholder={t("signin.email.placeholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-base font-medium text-foreground"
                  >
                    {t("signin.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-border/50 focus:border-primary bg-background/50 h-12 text-base pr-12 transition-colors"
                      placeholder={t("signin.password.placeholder")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary hover:text-primary/80 p-0 font-medium"
                    onClick={() => setShowPasswordRecovery(true)}
                  >
                    {t("signin.forgot-password")}
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? t("signin.signing-in") : t("signin.button")}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-border/50">
                <p className="text-muted-foreground">
                  {t("signin.no-account")}{" "}
                  <Button
                    variant="link"
                    onClick={() => navigate("/signup")}
                    className="text-primary hover:text-primary/80 p-0 font-semibold"
                  >
                    {t("signin.create-here")}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Toaster />
    </div>
  );
};

export default SignIn;
