
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SignupSteps from "@/components/SignupSteps";

const SignUp = () => {
  const navigate = useNavigate();

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
          <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>
      </header>

      {/* Sign Up Form */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-2xl mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl text-green-700 mb-2">Join Pantry</CardTitle>
              <CardDescription className="text-base md:text-lg">
                Create your account and start your smart kitchen journey
              </CardDescription>
            </CardHeader>
          </Card>
          
          <SignupSteps />
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Button
                variant="link"
                onClick={() => navigate('/signin')}
                className="text-green-600 hover:text-green-700 p-0 font-semibold"
              >
                Sign in here
              </Button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
