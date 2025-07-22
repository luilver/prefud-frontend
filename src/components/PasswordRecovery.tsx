import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface PasswordRecoveryProps {
  onBack: () => void;
}

type Step = 'email' | 'otp' | 'password' | 'success';

const PasswordRecovery = ({ onBack }: PasswordRecoveryProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with your password recovery service
      console.log('Password recovery request for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('otp');
      toast({
        title: "OTP sent!",
        description: "Check your email for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send recovery email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length !== 6) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with your OTP verification service
      console.log('Verifying OTP:', otp, 'for email:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any 6-digit code
      if (otp.length === 6) {
        setCurrentStep('password');
        toast({
          title: "OTP verified!",
          description: "You can now set your new password.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with your password reset service
      console.log('Resetting password for:', email, 'with new password');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('success');
      toast({
        title: "Password updated!",
        description: "Your password has been successfully changed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with your resend OTP service
      console.log('Resending OTP to:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "OTP resent!",
        description: "Check your email for the new verification code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Email Step
  if (currentStep === 'email') {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-green-700 flex items-center justify-center">
            <Mail className="h-5 w-5 mr-2" />
            {t('recovery.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('recovery.email.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="recovery-email">{t('recovery.email.label')}</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder={t('recovery.email.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              disabled={isLoading}
            >
              {isLoading ? t('recovery.email.sending') : t('recovery.email.send')}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onBack}
              className="w-full text-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')} to {t('signin.title')}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // OTP Verification Step
  if (currentStep === 'otp') {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-green-700">{t('recovery.otp.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('recovery.otp.description')} {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              {t('otp.instruction')}
            </p>
            
            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              onClick={handleOtpVerify}
              disabled={otp.length !== 6 || isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 mb-4"
            >
              {isLoading ? t('otp.verifying') : t('recovery.otp.verify')}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {t('otp.resend.text')}
              </p>
              <Button 
                variant="ghost" 
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-green-600 hover:text-green-700"
              >
                {t('otp.resend.button')}
              </Button>
            </div>

            <Button 
              variant="ghost" 
              onClick={() => setCurrentStep('email')}
              className="w-full text-green-700 mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('recovery.otp.back')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Password Reset Step
  if (currentStep === 'password') {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-green-700">{t('recovery.password.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('recovery.password.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="new-password">{t('recovery.password.new')}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t('recovery.password.new.placeholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="border-green-200 focus:border-green-400 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">{t('recovery.password.confirm')}</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('recovery.password.confirm.placeholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="border-green-200 focus:border-green-400 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              disabled={isLoading}
            >
              {isLoading ? t('recovery.password.updating') : t('recovery.password.update')}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setCurrentStep('otp')}
              className="w-full text-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('recovery.password.back')}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Success Step
  return (
    <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-green-700">{t('recovery.success.title')}</CardTitle>
        <CardDescription>
          {t('recovery.success.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onBack} className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
          {t('recovery.success.signin')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PasswordRecovery;
