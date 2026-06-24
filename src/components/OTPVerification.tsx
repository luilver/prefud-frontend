
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackEvent } from "@/services/analytics";

interface OTPVerificationProps {
  email: string;
  userId: string;
  onVerified: () => void;
  onBack: () => void;
  useEmailVerification?: boolean; // When true, uses request-otp/validate-otp with email instead of userId
}
const BasicURL = import.meta.env.VITE_BASE_URL || 'https://pantry-ms-brain.onrender.com';

const OTPVerification = ({ email, userId, onVerified, onBack, useEmailVerification = false }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);  
  const { t } = useLanguage();

  // Auto-send OTP on mount when using email verification (incomplete account flow)
  useEffect(() => {
    if (useEmailVerification && email) {
      handleResend();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  const handleVerify = async () => {
    trackEvent('button_click', {
              button_name: 'steptwo_otp_submit',
              screen: 'signup_page',
            })
    if (otp.length !== 6) return;
    if (!useEmailVerification && !userId) return;
    
    setIsLoading(true);
    try {
      if (useEmailVerification) {
        // Use validate-otp with email for incomplete account flow
        console.log('Validating OTP with email:', email);
        const response = await authService.validateOTP(email, otp);
        console.log('OTP validation response:', response);
        
        toast({
          title: "✅ Email Verified Successfully!",
          description: "Your email has been verified. Continue to complete your profile.",
          duration: 5000,
        });
        onVerified();
      } else {
        // Original flow using verify-otp with userId
        console.log('Verifying OTP:', otp, 'for userId:', userId);
        
        const requestData = {
          user_id: userId,
          otpCode: otp
        };

        const config = {
          method: 'post',
          url: `${BasicURL}/security/verify-otp`,
          headers: { 
            'Content-Type': 'application/json'
          },
          data: requestData
        };

        const response = await axios.request(config);
        console.log('OTP verification API response:', response.data);

        if (response.data.success && response.data.message === 'OTP successfully verified') {
          toast({
            title: "✅ Email Verified Successfully!",
            description: "Your email has been verified. Continue to complete your profile.",
            duration: 5000,
          });
          onVerified();
        } else {
          throw new Error('Unexpected response format');
        }
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      
      if (error.response?.data?.message) {
        const errorMessage = typeof error.response.data.message === 'string' 
          ? error.response.data.message 
          : error.response.data.message.message || 'OTP verification failed';
        
        toast({
          title: "❌ Verification Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "❌ Verification Failed",
          description: error.message || "Unable to verify OTP. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!useEmailVerification && !userId) {
      toast({
        title: "❌ Resend Failed",
        description: "User ID not found. Please go back and try again.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsResending(true);
    try {
      if (useEmailVerification) {
        // Use request-otp with email for incomplete account flow
        console.log('Requesting OTP for email:', email);
        const response = await authService.requestPasswordReset(email);
        console.log('Request OTP response:', response);
        toast({
          title: "📧 OTP Sent",
          description: "A verification code has been sent to your email.",
          duration: 5000,
        });
      } else {
        console.log('Resending OTP for userId:', userId);
        const response = await authService.resendOTP(userId);
        console.log('Resend OTP service response:', response);

        toast({
          title: "📧 OTP Resent",
          description: response.message || "A new verification code has been sent to your email.",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      toast({
        title: "❌ Resend Failed",
        description: error.message || "Unable to resend OTP. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>{t("signup.verify.title") || "Verify Your Email"}</span>
            </CardTitle>
            <CardDescription>
              {t("signup.otpSent") || "We've sent a 6-digit code to"} {email}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            {t("signup.enterOTP") || "Enter the verification code sent to your email"}
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
            onClick={handleVerify}
            disabled={otp.length !== 6 || isLoading || (!useEmailVerification && !userId)}
            className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 mb-4"
          >
            {isLoading ? 'Verifying...' : t("signup.verifyEmail") || "Verify Email"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {t("signup.didntReceiveCode") || "Didn't receive the code?"}
            </p>
            <Button 
              variant="ghost" 
              onClick={handleResend}
              disabled={isResending || (!useEmailVerification && !userId)}
              className="text-green-600 hover:text-green-700"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                t("signup.resendCode") || "Resend Code"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;
