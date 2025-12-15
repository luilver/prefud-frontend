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
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=2076&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-primary/20 backdrop-blur-sm" />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <PasswordRecovery onBack={() => setShowPasswordRecovery(false)} />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=2076&auto=format&fit=crop')`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-primary/30" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-secondary/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Floating Food Icons */}
      <div className="absolute top-32 right-20 text-6xl opacity-20 animate-bounce hidden lg:block" style={{ animationDuration: '3s' }}>🥗</div>
      <div className="absolute bottom-40 left-20 text-5xl opacity-20 animate-bounce hidden lg:block" style={{ animationDuration: '4s', animationDelay: '1s' }}>🍳</div>
      <div className="absolute top-1/2 right-32 text-4xl opacity-15 animate-bounce hidden lg:block" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🥑</div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg shadow-primary/25">
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
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden md:inline">
                  {t("signup.backToStart") || "Atrás para Comenzar"}
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Sign In Form */}
        <section className="py-8 md:py-16 px-4 min-h-[calc(100vh-73px)] flex items-center">
          <div className="container mx-auto max-w-md">
            {/* Welcome Text */}
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {t("signin.welcome") || "Welcome Back"}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("signin.welcomeSubtitle") || "Your healthy kitchen awaits"}
              </p>
            </div>

            <Card className="bg-card/90 backdrop-blur-xl border-border/30 shadow-2xl shadow-primary/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="text-center space-y-4 pb-6">
                <div className="mx-auto p-4 bg-gradient-to-br from-primary via-primary to-accent rounded-2xl w-fit shadow-lg shadow-primary/30">
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
                      className="border-border/50 focus:border-primary bg-background/70 h-12 text-base transition-all focus:bg-background"
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
                        className="border-border/50 focus:border-primary bg-background/70 h-12 text-base pr-12 transition-all focus:bg-background"
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
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? t("signin.signing-in") : t("signin.button")}
                  </Button>
                </form>

                <div className="text-center pt-4 border-t border-border/30">
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

            {/* Trust Badges */}
            <div className="flex justify-center gap-6 mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 text-muted-foreground/80">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Secure Login</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground/80">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">256-bit SSL</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Toaster />
    </div>
  );
};

export default SignIn;
