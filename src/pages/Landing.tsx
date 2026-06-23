import React from "react";
import { Button } from "@/components/ui/button";
import { 
  ChefHat, ShoppingCart, ListChecks, Package, 
  DollarSign, Sparkles, ArrowRight, Check,
  Utensils, Leaf, Clock, BookOpen
} from "lucide-react";
import { trackEvent } from "@/services/analytics";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleCTA = (source: string) => {
    trackEvent("landing_cta_click", { source });
    navigate("/signup");
  };

  const problems = [
    t("landing.problem1"),
    t("landing.problem2"),
    t("landing.problem3"),
    t("landing.problem4"),
  ];

  const steps = [
    { step: 1, icon: Package, title: t("landing.step1Title"), desc: t("landing.step1Desc") },
    { step: 2, icon: Sparkles, title: t("landing.step2Title"), desc: t("landing.step2Desc") },
    { step: 3, icon: ShoppingCart, title: t("landing.step3Title"), desc: t("landing.step3Desc") },
    { step: 4, icon: ListChecks, title: t("landing.step4Title"), desc: t("landing.step4Desc") },
    { step: 5, icon: BookOpen, title: t("landing.step5Title"), desc: t("landing.step5Desc") },
  ];

  const features = [
    { icon: ChefHat, title: t("landing.feature1Title"), desc: t("landing.feature1Desc") },
    { icon: ListChecks, title: t("landing.feature2Title"), desc: t("landing.feature2Desc") },
    { icon: Utensils, title: t("landing.feature3Title"), desc: t("landing.feature3Desc") },
    { icon: Package, title: t("landing.feature4Title"), desc: t("landing.feature4Desc") },
    { icon: DollarSign, title: t("landing.feature5Title"), desc: t("landing.feature5Desc") },
    { icon: Leaf, title: t("landing.feature6Title"), desc: t("landing.feature6Desc") },
  ];

  const imagineItems = [
    t("landing.imagine1"),
    t("landing.imagine2"),
    t("landing.imagine3"),
    t("landing.imagine4"),
  ];

  const realLifeItems = [
    { icon: DollarSign, label: t("landing.realLife1") },
    { icon: Leaf, label: t("landing.realLife2") },
    { icon: ChefHat, label: t("landing.realLife3") },
    { icon: Clock, label: t("landing.realLife4") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, hsl(122 39% 49% / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, hsl(170 60% 40% / 0.3) 0%, transparent 50%)'
        }} />

        {/* Language Selector - top right */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageSelector variant="button" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-200 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            {t("landing.badge")}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-poppins font-extrabold text-white leading-[1.1] tracking-tight">
            {t("landing.headline")}{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              {t("landing.headlineHighlight")}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            {t("landing.subheadline")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              onClick={() => handleCTA("hero_primary")}
              className="h-14 px-10 text-lg font-semibold rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 shadow-2xl shadow-black/20 transition-all hover:scale-105"
            >
              {t("landing.ctaPrimary")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="ghost"
              onClick={() => {
                trackEvent("landing_cta_click", { source: "hero_secondary" });
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-14 px-8 text-lg text-white/90 hover:text-white hover:bg-white/10 rounded-2xl border border-white/20"
            >
              {t("landing.ctaSecondary")}
            </Button>
          </div>
          
          <p className="text-sm text-emerald-200/60">{t("landing.noCreditCard")}</p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Problem Section */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground mb-4">
              {t("landing.problemTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.problemSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {problems.map((problem, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                <span className="text-foreground font-medium">{problem}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold text-lg">{t("landing.problemFix")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground mb-4">
              {t("landing.howTitle")}
            </h2>
            <p className="text-muted-foreground text-lg">{t("landing.howSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.slice(0, 3).map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-poppins font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-6">
            {steps.slice(3).map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-poppins font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground mb-4">
              {t("landing.featuresTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-poppins font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Imagine Section */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold mb-4">
              {t("landing.imagineTitle")}
            </h2>
            <p className="text-emerald-100/70 text-lg">{t("landing.imagineSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            {imagineItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Check className="h-5 w-5 text-emerald-300 shrink-0" />
                <span className="text-white/90 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-emerald-200/80 text-lg max-w-xl mx-auto">
            {t("landing.imagineFooter")}
          </p>
        </div>
      </section>

      {/* Designed for Real Life */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground mb-10">
            {t("landing.realLifeTitle")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
            {realLifeItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-lg">{t("landing.realLifeFooter")}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4 bg-muted/50">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground">
            {t("landing.finalTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.finalSubtitle")}
          </p>
          
          <Button
            onClick={() => handleCTA("footer_cta")}
            className="h-14 px-12 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105"
          >
            {t("landing.ctaPrimary")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-sm text-muted-foreground">{t("landing.noCreditCard")}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
         <span className="font-poppins font-semibold text-foreground">Prefud</span>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-foreground transition-colors">{t("landing.terms")}</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">{t("landing.privacy")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
