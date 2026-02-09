import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Globe, FileText, Database, Mail, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import privacyTabsBg from '@/assets/privacy-tabs-bg.jpg';

const PrivacyPolicy = () => {
  const dataCollected = [
    { category: "Contact Information", items: ["Email address", "Full name", "Telephone number", "Physical address"] },
    { category: "Health & Fitness Data", items: ["Weight", "Height", "Calorie goals", "Health purposes/objectives"] },
    { category: "Usage Data", items: ["Email interactions", "Product interactions", "App usage patterns"] },
  ];

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
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
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
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Your Privacy Matters</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Data We Collect Section */}
          <section className="mb-10">
            <h2 className="flex items-center text-2xl font-bold text-foreground mb-6">
              <Database className="h-6 w-6 text-primary mr-2" />
              Information We Collect
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Pantry collects the following personal information solely for the functionality of our AI-powered meal planning 
              service and to deliver relevant advertisements:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {dataCollected.map((group, index) => (
                <div key={index} className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-3">{group.category}</h3>
                  <ul className="space-y-2">
                    {group.items.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Tabs for US and EU */}
          <Tabs defaultValue="us" className="w-full relative rounded-2xl overflow-hidden">
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
              style={{ backgroundImage: `url(${privacyTabsBg})` }}
            />
            <div className="relative z-10 p-6 md:p-8">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="us" className="flex items-center gap-2">
                <span className="text-lg">🇺🇸</span> United States
              </TabsTrigger>
              <TabsTrigger value="eu" className="flex items-center gap-2">
                <span className="text-lg">🇪🇺</span> European Union
              </TabsTrigger>
            </TabsList>

            {/* US Privacy Policy */}
            <TabsContent value="us" className="space-y-8">
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
                <h3 className="flex items-center text-xl font-bold text-foreground mb-4">
                  <Globe className="h-5 w-5 text-accent mr-2" />
                  US Privacy Rights
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  This section applies to residents of the United States and complies with applicable US privacy laws, 
                  including the California Consumer Privacy Act (CCPA) and other state privacy regulations.
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">1. How We Use Your Information</h3>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>We use the information we collect for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service Functionality:</strong> To provide personalized meal plans, track nutritional goals, and deliver AI-powered recommendations</li>
                    <li><strong>Communication:</strong> To send service-related emails, updates, and support responses</li>
                    <li><strong>Advertising:</strong> To display relevant advertisements based on your interests and app usage</li>
                    <li><strong>Analytics:</strong> To improve our services and understand how users interact with our app</li>
                    <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">2. California Consumer Rights (CCPA)</h3>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>If you are a California resident, you have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Right to Know:</strong> You can request information about the categories and specific pieces of personal information we have collected about you</li>
                    <li><strong>Right to Delete:</strong> You can request that we delete your personal information, subject to certain exceptions</li>
                    <li><strong>Right to Opt-Out:</strong> You can opt-out of the "sale" of your personal information</li>
                    <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">3. Data Sharing & Third Parties</h3>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service Providers:</strong> Companies that help us operate our services (hosting, analytics, customer support)</li>
                    <li><strong>Advertising Partners:</strong> Third-party advertising networks to deliver relevant ads</li>
                    <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                  </ul>
                  <p className="mt-4">We do not sell your personal information to third parties for monetary consideration.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">4. Data Security</h3>
                <div className="text-muted-foreground leading-relaxed">
                  <p>
                    We implement reasonable security measures to protect your personal information from unauthorized access, 
                    alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
                    storage is 100% secure.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">5. Children's Privacy</h3>
                <div className="text-muted-foreground leading-relaxed">
                  <p>
                    Our services are not directed to children under 13 years of age. We do not knowingly collect personal 
                    information from children under 13. If we become aware that we have collected personal information from 
                    a child under 13, we will take steps to delete such information.
                  </p>
                </div>
              </section>
            </TabsContent>

            {/* EU Privacy Policy (GDPR) */}
            <TabsContent value="eu" className="space-y-8">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="flex items-center text-xl font-bold text-foreground mb-4">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  GDPR Compliance
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  This section applies to residents of the European Union and European Economic Area, and complies with 
                  the General Data Protection Regulation (GDPR).
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">1. Data Controller</h3>
                <div className="text-muted-foreground leading-relaxed">
                  <p>
                    Pantry acts as the data controller for the personal data we collect. We determine the purposes and means 
                    of processing your personal data in accordance with GDPR requirements.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">2. Legal Basis for Processing</h3>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>We process your personal data based on the following legal grounds:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Consent:</strong> You have given explicit consent for processing your data for specific purposes</li>
                    <li><strong>Contract Performance:</strong> Processing is necessary to provide you with our meal planning services</li>
                    <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests, such as improving our services and fraud prevention</li>
                    <li><strong>Legal Obligation:</strong> Processing is necessary to comply with applicable laws</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">3. Your GDPR Rights</h3>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Under the GDPR, you have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Right of Access:</strong> You can request a copy of your personal data we hold</li>
                    <li><strong>Right to Rectification:</strong> You can request correction of inaccurate personal data</li>
                    <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request deletion of your personal data under certain circumstances</li>
                    <li><strong>Right to Restriction:</strong> You can request restriction of processing of your personal data</li>
                    <li><strong>Right to Data Portability:</strong> You can request your data in a machine-readable format</li>
                    <li><strong>Right to Object:</strong> You can object to processing based on legitimate interests or for direct marketing</li>
                    <li><strong>Right to Withdraw Consent:</strong> You can withdraw your consent at any time</li>
                    <li><strong>Right to Lodge a Complaint:</strong> You can file a complaint with a supervisory authority</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">4. International Data Transfers</h3>
                <div className="text-muted-foreground leading-relaxed">
                  <p>
                    Your personal data may be transferred to and processed in countries outside the European Economic Area (EEA). 
                    When we transfer your data, we ensure appropriate safeguards are in place, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-3">
                    <li>Standard Contractual Clauses approved by the European Commission</li>
                    <li>Transfers to countries with an adequacy decision</li>
                    <li>Your explicit consent for specific transfers</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">5. Data Retention</h3>
                <div className="text-muted-foreground leading-relaxed">
                  <p>
                    We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, 
                    including to satisfy any legal, accounting, or reporting requirements. When determining retention periods, we consider:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-3">
                    <li>The nature and sensitivity of the data</li>
                    <li>The purposes for which we process the data</li>
                    <li>Applicable legal requirements</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">6. Automated Decision-Making</h3>
                <div className="text-muted-foreground leading-relaxed">
                  <p>
                    Our AI-powered meal planning service uses automated processing to generate personalized recommendations. 
                    You have the right not to be subject to decisions based solely on automated processing that produce 
                    legal or similarly significant effects. Our AI recommendations are suggestions and do not constitute 
                    such decisions.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-4">7. Cookies and Tracking</h3>
                <div className="text-muted-foreground leading-relaxed">
                  <p>
                    We use cookies and similar tracking technologies. You can manage your cookie preferences through your 
                    browser settings. For advertising purposes, you can opt-out of personalized ads through the app settings 
                    or industry opt-out mechanisms.
                  </p>
                </div>
              </section>
            </TabsContent>
          </div>
          </Tabs>

          {/* Common Sections */}
          <div className="mt-10 pt-10 border-t border-border/50 space-y-8">
            <section>
              <h2 className="flex items-center text-2xl font-bold text-foreground mb-4">
                <Mail className="h-6 w-6 text-primary mr-2" />
                Contact Us
              </h2>
              <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, wish to exercise your privacy rights, or have concerns 
                  about how we handle your data, please contact us through our support channels or via the contact 
                  information provided in our application.
                </p>
                <p className="text-muted-foreground mt-4">
                  For EU residents: You may also contact your local data protection authority if you have concerns about 
                  our data processing practices.
                </p>
              </div>
            </section>

            <section>
              <h2 className="flex items-center text-2xl font-bold text-foreground mb-4">
                <Users className="h-6 w-6 text-primary mr-2" />
                Changes to This Policy
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you 
                  to review this Privacy Policy periodically.
                </p>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
