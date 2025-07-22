
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import CountrySelect, { countries } from "./CountrySelect";
import { useNavigate } from "react-router-dom";
import { CheckCircle, User, Mail, Phone, Globe, Lock } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  countryCode: z.string().min(1, "Please select a country"),
  preferredLanguage: z.string().min(1, "Please select a language"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useUser();
  const { t, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      countryCode: "",
      preferredLanguage: "en",
      password: "",
      confirmPassword: "",
    },
  });

  const steps = [
    {
      id: 1,
      title: t('signup.language'),
      icon: Globe,
      fields: ['preferredLanguage']
    },
    {
      id: 2,
      title: t('signup.personalInfo'),
      icon: User,
      fields: ['name', 'email']
    },
    {
      id: 3,
      title: t('signup.phone'),
      icon: Phone,
      fields: ['countryCode', 'phone']
    },
    {
      id: 4,
      title: t('signup.password'),
      icon: Lock,
      fields: ['password', 'confirmPassword']
    }
  ];

  const handleNext = async () => {
    const currentFields = steps[currentStep - 1].fields;
    const isValid = await form.trigger(currentFields as any);
    
    if (isValid) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const formData = form.getValues();
      
      // Update language context when user selects language
      const selectedLanguage = languages.find(lang => lang.code === formData.preferredLanguage);
      if (selectedLanguage) {
        setLanguage(selectedLanguage);
      }

      await signup(formData);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormField
            control={form.control}
            name="preferredLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('signup.selectLanguage')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('signup.selectLanguage')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.nativeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 2:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('signup.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('signup.name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('signup.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('signup.email')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('signup.selectCountry')}</FormLabel>
                  <FormControl>
                    <CountrySelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('signup.selectCountry')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('signup.phone')}</FormLabel>
                  <div className="flex space-x-2">
                    <div className="w-20 flex items-center justify-center bg-gray-50 border rounded px-3 text-sm">
                      {form.watch('countryCode') ? 
                        countries.find(c => c.code === form.watch('countryCode'))?.prefix : 
                        '+1'
                      }
                    </div>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('signup.password')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t('signup.password')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('signup.confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t('signup.confirmPassword')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <span className={`text-xs text-center ${isCurrent ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-green-700">
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            Step {currentStep} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-6">
              {renderStepContent()}
              
              <div className="flex justify-between space-x-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className={`bg-green-600 hover:bg-green-700 ${currentStep === 1 ? 'w-full' : 'flex-1'}`}
                >
                  {isLoading ? (
                    "Creating..."
                  ) : currentStep === steps.length ? (
                    t('signup.createAccount')
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupSteps;
