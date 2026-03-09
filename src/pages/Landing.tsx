import React from "react";
import { Button } from "@/components/ui/button";
import { 
  ChefHat, ShoppingCart, ListChecks, Package, 
  DollarSign, Sparkles, ArrowRight, Check,
  Utensils, Leaf, Clock, BookOpen, CookingPot
} from "lucide-react";
import { trackEvent } from "@/services/analytics";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const Landing = () => {
  const navigate = useNavigate();

  const handleCTA = (source: string) => {
    trackEvent("landing_cta_click", { source });
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, hsl(122 39% 49% / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, hsl(170 60% 40% / 0.3) 0%, transparent 50%)'
        }} />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-200 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Your AI kitchen assistant
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-poppins font-extrabold text-white leading-[1.1] tracking-tight">
            Cook amazing meals with what you{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              already have
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            Pantry uses AI to plan meals, generate shopping lists, guide you step-by-step while cooking, and help you save money by using the ingredients you already have at home.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              onClick={() => handleCTA("hero_primary")}
              className="h-14 px-10 text-lg font-semibold rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 shadow-2xl shadow-black/20 transition-all hover:scale-105"
            >
              Start Free
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
              See How It Works
            </Button>
          </div>
          
          <p className="text-sm text-emerald-200/60">No credit card required</p>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Problem Section */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground mb-4">
              Stop wasting food and money
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Most people buy groceries without knowing exactly what they already have.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {[
              "Buying duplicate ingredients",
              "Food expiring in the fridge",
              "Spending more than necessary",
              "Not knowing what to cook",
            ].map((problem, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10"
              >
                <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                <span className="text-foreground font-medium">{problem}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold text-lg">Pantry fixes that with AI.</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground mb-4">
              How Pantry Works
            </h2>
            <p className="text-muted-foreground text-lg">Four simple steps to a smarter kitchen</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: 1, icon: Package, title: "Add what you have", desc: "Quickly add the ingredients in your fridge and pantry." },
              { step: 2, icon: Sparkles, title: "AI plans your meals", desc: "Pantry suggests meals using what you already own." },
              { step: 3, icon: ShoppingCart, title: "Smart shopping list", desc: "Only buy what you actually need." },
              { step: 4, icon: BookOpen, title: "Cook step by step", desc: "Follow simple instructions generated for each recipe." },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              >
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
              What makes Pantry powerful
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ChefHat, title: "AI Meal Planning", desc: "Get personalized meal suggestions based on the ingredients you already have." },
              { icon: ListChecks, title: "Smart Grocery Lists", desc: "Pantry automatically creates a shopping list for missing ingredients." },
              { icon: Utensils, title: "Step-by-Step Cooking", desc: "Clear instructions so you can cook every meal confidently." },
              { icon: Package, title: "Pantry Tracking", desc: "Know exactly what ingredients you have at home." },
              { icon: DollarSign, title: "Save Money", desc: "Buy only what you need and reduce food waste." },
              { icon: Leaf, title: "Reduce Waste", desc: "Use what you have before it expires. Good for you and the planet." },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
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
              Imagine your kitchen working like this
            </h2>
            <p className="text-emerald-100/70 text-lg">Open Pantry and instantly see:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            {[
              "Ingredients you already have",
              "Meals you can cook right now",
              "What you need to buy",
              "Simple cooking instructions",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <Check className="h-5 w-5 text-emerald-300 shrink-0" />
                <span className="text-white/90 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-emerald-200/80 text-lg max-w-xl mx-auto">
            Your kitchen becomes organized, efficient, and smarter.
          </p>
        </div>
      </section>

      {/* Designed for Real Life */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground mb-10">
            Designed for real life
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
            {[
              { icon: DollarSign, label: "Save money on groceries" },
              { icon: Leaf, label: "Reduce food waste" },
              { icon: ChefHat, label: "Cook better meals" },
              { icon: Clock, label: "Plan your week easily" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-lg">All in one place.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4 bg-muted/50">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground">
            Start cooking smarter today
          </h2>
          <p className="text-lg text-muted-foreground">
            Join early users using Pantry to simplify their kitchen.
          </p>
          
          <Button
            onClick={() => handleCTA("footer_cta")}
            className="h-14 px-12 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105"
          >
            Start Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-sm text-muted-foreground">No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-poppins font-semibold text-foreground">Pantry AI</span>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
