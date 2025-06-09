
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordRecoveryProps {
  onBack: () => void;
}

const PasswordRecovery = ({ onBack }: PasswordRecoveryProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with your password recovery service
      console.log('Password recovery request for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEmailSent(true);
      toast({
        title: "Recovery email sent!",
        description: "Check your inbox for password reset instructions.",
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

  if (isEmailSent) {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Email Sent!</CardTitle>
          <CardDescription>
            We've sent password reset instructions to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-green-700 flex items-center justify-center">
          <Mail className="h-5 w-5 mr-2" />
          Recover Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recovery-email">Email Address</Label>
            <Input
              id="recovery-email"
              type="email"
              placeholder="Enter your email"
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
            {isLoading ? 'Sending...' : 'Send Recovery Email'}
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
};

export default PasswordRecovery;
