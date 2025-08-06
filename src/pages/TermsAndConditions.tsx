
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scale, Shield, Bot, Cookie } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Terms and Conditions</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 lg:p-12 shadow-xl">
          
          {/* Introduction */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
              <Scale className="h-4 w-4" />
              <span className="text-sm font-medium">Legal Agreement</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-slate max-w-none">
            
            {/* Section 1: Agreement */}
            <section className="mb-8">
              <h2 className="flex items-center text-2xl font-bold text-foreground mb-4">
                <Shield className="h-6 w-6 text-primary mr-2" />
                1. Agreement to Terms
              </h2>
              <div className="text-foreground/90 leading-relaxed space-y-4">
                <p>
                  By accessing and using Pantry ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms and Conditions govern your use of our AI-powered meal planning service, including but not limited to 
                  meal recommendations, ingredient tracking, shopping list generation, and related features.
                </p>
              </div>
            </section>

            {/* Section 2: AI Services */}
            <section className="mb-8">
              <h2 className="flex items-center text-2xl font-bold text-foreground mb-4">
                <Bot className="h-6 w-6 text-accent mr-2" />
                2. AI-Powered Services
              </h2>
              <div className="text-foreground/90 leading-relaxed space-y-4">
                <p>
                  Pantry utilizes artificial intelligence and machine learning technologies to provide personalized meal recommendations, 
                  nutritional analysis, and cooking suggestions. You acknowledge and agree that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI-generated meal plans and recipes are suggestions based on available data and algorithms</li>
                  <li>Nutritional information provided is approximate and should not replace professional dietary advice</li>
                  <li>Food safety recommendations are general guidelines and may not cover all scenarios</li>
                  <li>Individual dietary restrictions, allergies, and health conditions should always be considered</li>
                  <li>You are responsible for verifying ingredient safety and suitability for your specific needs</li>
                </ul>
                <p>
                  We continuously improve our AI models, but cannot guarantee 100% accuracy in all recommendations. 
                  Always use your judgment and consult healthcare professionals for specific dietary needs.
                </p>
              </div>
            </section>

            {/* Section 3: User Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
              <div className="text-foreground/90 leading-relaxed space-y-4">
                <p>As a user of Pantry, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate information about dietary preferences, allergies, and restrictions</li>
                  <li>Use the service for personal, non-commercial purposes only</li>
                  <li>Not attempt to reverse engineer or exploit our AI algorithms</li>
                  <li>Respect intellectual property rights of recipes and content</li>
                  <li>Report any technical issues or safety concerns promptly</li>
                  <li>Maintain the security of your account credentials</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Data and Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Collection and Privacy</h2>
              <div className="text-foreground/90 leading-relaxed space-y-4">
                <p>
                  To provide personalized AI-powered meal recommendations, we collect and process:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dietary preferences and restrictions you provide</li>
                  <li>Ingredient inventory and usage patterns</li>
                  <li>Meal planning history and feedback</li>
                  <li>Usage analytics to improve our AI models</li>
                </ul>
                <p>
                  Your data is processed in accordance with our Privacy Policy and applicable data protection laws. 
                  We implement appropriate security measures to protect your information.
                </p>
              </div>
            </section>

            {/* Section 5: Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Health and Safety Disclaimers</h2>
              <div className="text-foreground/90 leading-relaxed space-y-4">
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  IMPORTANT: Pantry is not a substitute for professional medical or nutritional advice.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Always consult healthcare professionals for medical dietary requirements</li>
                  <li>Verify food safety and expiration dates independently</li>
                  <li>Be cautious with allergen information and cross-contamination</li>
                  <li>AI recommendations may not account for all health conditions</li>
                  <li>Use your judgment when following cooking instructions and food storage guidelines</li>
                </ul>
              </div>
            </section>

            {/* Section 6: Subscription and Billing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Subscription and Billing</h2>
              <div className="text-foreground/90 leading-relaxed space-y-4">
                <p>
                  Premium features of Pantry are available through subscription plans:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>Billing occurs according to your selected plan (monthly/yearly)</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Refunds are handled according to our refund policy</li>
                  <li>Price changes will be communicated in advance</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
              <div className="text-foreground/90 leading-relaxed space-y-4">
                <p>
                  Pantry and its operators shall not be liable for any direct, indirect, incidental, or consequential damages 
                  resulting from the use of our service, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Food-related illness or allergic reactions</li>
                  <li>Financial loss from ingredient purchases</li>
                  <li>Data loss or technical failures</li>
                  <li>Inaccurate AI recommendations or calculations</li>
                </ul>
              </div>
            </section>

            {/* Section 8: Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Changes to Terms</h2>
              <div className="text-foreground/90 leading-relaxed space-y-4">
                <p>
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                  Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
                <p>
                  We will notify users of significant changes through the service or via email where possible.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-8 bg-primary/5 p-6 rounded-xl border border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
              <div className="text-foreground/90 leading-relaxed">
                <p>
                  If you have questions about these Terms and Conditions, please contact us through our support channels 
                  or via the contact information provided in our application.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
