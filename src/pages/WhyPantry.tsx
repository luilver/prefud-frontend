
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Leaf, TrendingUp, Clock, DollarSign, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyPantry = () => {
  const { t } = useLanguage();

  const problems = [
    {
      icon: TrendingUp,
      title: t('why.problem.waste.title'),
      description: t('why.problem.waste.description'),
    },
    {
      icon: Clock,
      title: t('why.problem.time.title'),
      description: t('why.problem.time.description'),
    },
    {
      icon: Users,
      title: t('why.problem.health.title'),
      description: t('why.problem.health.description'),
    },
  ];

  const solutions = [
    {
      icon: Brain,
      title: t('why.solution.ai.title'),
      description: t('why.solution.ai.description'),
    },
    {
      icon: Zap,
      title: t('why.solution.integration.title'),
      description: t('why.solution.integration.description'),
    },
    {
      icon: Leaf,
      title: t('why.solution.sustainability.title'),
      description: t('why.solution.sustainability.description'),
    },
  ];

  const stats = [
    {
      stat: t('why.impact.waste.stat'),
      label: t('why.impact.waste.label'),
    },
    {
      stat: t('why.impact.time.stat'),
      label: t('why.impact.time.label'),
    },
    {
      stat: t('why.impact.money.stat'),
      label: t('why.impact.money.label'),
    },
    {
      stat: t('why.impact.satisfaction.stat'),
      label: t('why.impact.satisfaction.label'),
    },
  ];

  const features = [
    {
      title: t('why.features.smart.title'),
      description: t('why.features.smart.description'),
    },
    {
      title: t('why.features.inventory.title'),
      description: t('why.features.inventory.description'),
    },
    {
      title: t('why.features.planning.title'),
      description: t('why.features.planning.description'),
    },
    {
      title: t('why.features.nutrition.title'),
      description: t('why.features.nutrition.description'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('why.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('why.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('why.problem.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('why.problem.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <Card key={index} className="text-center border-red-100">
                <CardHeader>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <problem.icon className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl text-red-700">{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {problem.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('why.solution.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('why.solution.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="text-center border-green-100">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <solution.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-green-700">{solution.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {solution.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('why.impact.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{stat.stat}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('why.features.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-green-100">
                <CardHeader>
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

      {/* CTA Section */}
      <section className="bg-green-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('why.cta.title')}
          </h2>
          <p className="text-xl text-green-100 mb-8">
            {t('why.cta.subtitle')}
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/signup">{t('why.cta.button')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default WhyPantry;
