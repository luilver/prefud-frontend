import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { firebaseAuthService } from "@/services/firebaseAuthService";
import { useLanguage } from "@/contexts/LanguageContext";

interface PasswordRecoveryProps {
  onBack: () => void;
}

const PasswordRecovery = ({ onBack }: PasswordRecoveryProps) => {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await firebaseAuthService.sendPasswordResetEmail(email);
      setIsSent(true);
      toast({
        title: "Reset link sent!",
        description: "Check your email inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <Card className="max-w-md mx-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            We've sent a password reset link to <span className="font-semibold text-neutral-800 dark:text-neutral-200">{email}</span>. Follow the instructions in the email to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <Button
            onClick={onBack}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl"
          >
            Back to Sign In
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsSent(false)}
            className="w-full text-sm text-neutral-600 dark:text-neutral-400"
          >
            Didn't receive the email? Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-2">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center justify-center gap-2">
          <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          {t('signup.emailStep.title') || "Reset Password"}
        </CardTitle>
        <CardDescription className="text-center text-neutral-500 dark:text-neutral-400">
          {t('signup.emailStep.description') || "Enter your email address and we'll send you a link to reset your password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('signup.emailStep.label') || "Email Address"}
            </Label>
            <Input
              id="recovery-email"
              type="email"
              placeholder={t('signup.emailStep.placeholder') || "Enter your email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 focus:border-emerald-500 focus:ring-emerald-500/20 text-base"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordRecovery;
