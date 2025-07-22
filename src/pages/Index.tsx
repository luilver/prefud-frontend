
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ShoppingCart, Utensils, TrendingDown, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";

const Index = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: t('home.features.ai.title'),
      description: t('home.features.ai.description')
    },
    {
      icon: Utensils,
      title: t('home.features.tracking.title'),
      description: t('home.features.tracking.description')
    },
    {
      icon: TrendingDown,
      title: t('home.features.waste.title'),
      description: t('home.features.waste.description')
    },
    {
      icon: Clock,
      title: t('home.features.planning.title'),
      description: t('home.features.planning.description')
    },
    {
      icon: ShoppingCart,
      title: t('home.features.shopping.title'),
      description: t('home.features.shopping.description')
    },
    {
      icon: Heart,
      title: t('home.features.nutrition.title'),
      description: t('home.features.nutrition.description')
    }
  ];

  const testimonials = [
    {
      text: t('home.testimonials.sarah.text'),
      author: t('home.testimonials.sarah.author'),
      role: t('home.testimonials.sarah.role')
    },
    {
      text: t('home.testimonials.mike.text'),
      author: t('home.testimonials.mike.author'),
      role: t('home.testimonials.mike.role')
    },
    {
      text: t('home.testimonials.emily.text'),
      author: t('home.testimonials.emily.author'),
      role: t('home.testimonials.emily.role')
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link to="/signup">{t('home.hero.cta')}</Link>
              </Button>
              <Button variant="outline" size="lg">
                {t('home.hero.demo')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-green-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.testimonials.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-green-100 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/signup">{t('home.cta.button')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
