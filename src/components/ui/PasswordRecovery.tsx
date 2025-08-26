import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { validateEmail, validatePassword, formatErrorMessage } from "@/utils/validation";

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.requestPasswordReset(email);
      setCurrentStep('otp');
      toast({
        title: "OTP sent!",
        description: response.message || "Check your email for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: formatErrorMessage(error),
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
      const response = await authService.validateOTP(email, otp);
      setCurrentStep('password');
      toast({
        title: "OTP verified!",
        description: response.message || "You can now set your new password.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: formatErrorMessage(error),
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

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast({
        title: "Invalid Password",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(email, otp, newPassword);
      setCurrentStep('success');
      toast({
        title: "Password updated!",
        description: response.message || "Your password has been successfully changed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: formatErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      toast({
        title: "OTP resent!",
        description: response.message || "Check your email for the new verification code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: formatErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'email') {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-green-700 flex items-center justify-center">
            <Mail className="h-5 w-5 mr-2" />
            Recover Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
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
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full text-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'otp') {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-green-700">Verify Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a 6-digit code to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Enter the verification code sent to your email
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
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-green-700"
              >
                Resend Code
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep('email')}
                className="text-green-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'password') {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-green-700">Set New Password</CardTitle>
          <CardDescription className="text-center">
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="border-green-200 focus:border-green-400 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-green-200 focus:border-green-400 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'success') {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-green-700">Password Updated</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully reset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onBack}
            className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default PasswordRecovery;
