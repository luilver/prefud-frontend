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
import { Utensils, ArrowLeft, Eye, EyeOff, Shield, Lock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/contexts/LanguageContext";
import PasswordRecovery from "@/components/PasswordRecovery";
import LanguageSelector from "@/components/LanguageSelector";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/services/analytics";
import { isNativePlatform } from "@/services/revenueCatService";

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
    //firebase eventlogin
    await trackEvent("button_click", {
      button_name: "login_submit",
      screen: "login_page",
    });
    
    setIsLoading(true);
    try {
      const userData = await login(email, password);
      if (
        userData?.profile?.languages &&
        (userData.profile.languages === "en" ||
          userData.profile.languages === "es" ||
          userData.profile.languages === "pt")
      ) {
        setLanguage(userData.profile.languages as Language);
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/");
    } catch (error) {
      console.log("Login error caught:", error);

      // Handle ACCOUNT_INCOMPLETE - redirect to signup to complete registration
      if (error instanceof Error && (error as any).code === 'ACCOUNT_INCOMPLETE') {
        toast({
          title: t("signin.accountIncomplete") || "Account Incomplete",
          description: t("signin.accountIncompleteDesc") || "Your account needs to be completed. Please verify your email to continue.",
          variant: "destructive",
        });
        navigate("/signup", { 
          state: { 
            accountIncomplete: true, 
            email, 
            userId: (error as any).userId 
          } 
        });
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      let title = "Sign in failed";
      let description = "Please check your credentials and try again.";

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
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <PasswordRecovery onBack={() => setShowPasswordRecovery(false)} />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Premium Food Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')`,
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
                <span className="hidden sm:inline">
                  {t("signup.backToStart")}
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - Centered Form */}
        <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-[420px]">
            <Card className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center space-y-3 pt-8 pb-2 px-6 md:px-8">
                <div className="mx-auto p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl w-fit shadow-lg shadow-emerald-500/30">
                  <Utensils className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl md:text-[1.65rem] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                  {t("signin.title")}
                </CardTitle>
                <CardDescription className="text-neutral-500 dark:text-neutral-400 text-[0.95rem]">
                  {t("signin.subtitle")}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 md:px-8 pb-8 pt-4">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      {t("signin.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 focus:border-emerald-500 focus:ring-emerald-500/20 text-base transition-all placeholder:text-neutral-400"
                      placeholder={t("signin.email.placeholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
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
                        className="h-12 rounded-xl border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 focus:border-emerald-500 focus:ring-emerald-500/20 text-base pr-12 transition-all placeholder:text-neutral-400"
                        placeholder={t("signin.password.placeholder")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5 text-neutral-400" />
                        ) : (
                          <Eye className="h-4.5 w-4.5 text-neutral-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 p-0 h-auto font-medium text-sm"
                      onClick={() => setShowPasswordRecovery(true)}
                    >
                      {t("signin.forgot-password")}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? t("signin.signing-in") : t("signin.button")}
                  </Button>
                </form>

                {isNativePlatform() ? (
                  <div className="mt-6 pt-6 border-t border-emerald-500/20">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Log in with your existing account
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Use this app with an existing account
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm">
                      {t("signin.no-account")}{" "}
                      <Button
                        variant="link"
                        onClick={async () => {
                          trackEvent("button_click", {
                            button_name: "signup_submit",
                            screen: "login_page",
                          });
                          navigate("/signup");
                        }}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 p-0 h-auto font-semibold text-sm"
                      >
                        {t("signin.create-here")}
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-5 mt-6">
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

      <Toaster />
    </div>
  );
};

export default SignIn;
