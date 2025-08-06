
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Utensils className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary">Pantry</h3>
            </div>
            <p className="text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.product')}</h4>
            <div className="space-y-2">
              <Button variant="link" className="p-0 h-auto font-normal justify-start" onClick={() => navigate('/why-pantry')}>
                {t('nav.why-pantry')}
              </Button>
              <Button variant="link" className="p-0 h-auto font-normal justify-start" onClick={() => navigate('/pricing')}>
                {t('nav.pricing')}
              </Button>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.company')}</h4>
            <div className="space-y-2">
              <Button variant="link" className="p-0 h-auto font-normal justify-start" onClick={() => navigate('/terms')}>
                {t('footer.terms')}
              </Button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.support')}</h4>
            <div className="space-y-2">
              <Button variant="link" className="p-0 h-auto font-normal justify-start">
                {t('footer.contact')}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 Pantry. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
