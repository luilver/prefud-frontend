
import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'es' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Language names
    'language.english': 'English',
    'language.spanish': 'Spanish',
    'language.portuguese': 'Portuguese',
    
    // Common
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    
    // Navigation
    'nav.home': 'Home',
    'nav.pricing': 'Pricing',
    'nav.why-pantry': 'Why Pantry',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.language': 'Language',
    
    // Home page
    'home.title': 'Smart Meal Planning Made Simple',
    'home.subtitle': 'Transform your kitchen with AI-powered meal planning, reduce food waste, save money, and eat healthier with Pantry.',
    'home.cta.primary': 'Start Free Trial',
    'home.cta.secondary': 'Learn More',
    'home.features.title': 'Why Pantry?',
    'home.features.subtitle': 'Save time, money, and reduce food waste with intelligent meal planning',
    'home.features.smart-planning.title': 'Smart Planning',
    'home.features.smart-planning.description': 'AI-powered meal suggestions based on your pantry',
    'home.features.reduce-waste.title': 'Reduce Waste',
    'home.features.reduce-waste.description': 'Use ingredients before they expire',
    'home.features.save-money.title': 'Save Money',
    'home.features.save-money.description': 'Shop smarter with automated lists',
    'home.footer.copyright': '© 2024 Pantry. All rights reserved.',
    'home.nav.why-pantry': 'Why Pantry?',
    'home.nav.get-started': 'Get Started',
    
    // Signup
    'signup.title': 'Join Pantry',
    'signup.subtitle': 'Create your account and start your smart kitchen journey',
    'signup.language.title': 'Preferred Language',
    'signup.language.description': 'Choose your preferred language for the app',
    'signup.language.select': 'Select Language',
    'signup.account.title': 'Create Your Account',
    'signup.account.description': 'Enter your email and password to get started',
    'signup.account.email': 'Email Address',
    'signup.account.password': 'Password',
    'signup.account.continue': 'Continue',
    'signup.account.sending': 'Sending Verification...',
    'signup.already-account': 'Already have an account?',
    'signup.signin-here': 'Sign in here',
    
    // Signin
    'signin.title': 'Welcome Back',
    'signin.subtitle': 'Sign in to your Pantry account',
    'signin.email': 'Email Address',
    'signin.email.placeholder': 'Enter your email',
    'signin.password': 'Password',
    'signin.password.placeholder': 'Enter your password',
    'signin.forgot-password': 'Forgot password?',
    'signin.button': 'Sign In',
    'signin.signing-in': 'Signing in...',
    'signin.no-account': "Don't have an account?",
    'signin.create-here': 'Create one here',
    
    // Profile
    'profile.language': 'Language',
    'profile.phone': 'Phone Number',
    'profile.country': 'Country',
    
    // Pricing
    'pricing.title': 'Choose Your Meal Planning Plan',
    'pricing.subtitle': 'Transform your kitchen into an eco-friendly, money-saving, time-efficient meal planning hub',
    'pricing.back-to-dashboard': 'Back to Dashboard',
    'pricing.environmental-impact': 'Environmental Impact',
    'pricing.environmental-description': 'Reduce food waste and carbon footprint with smart meal planning',
    'pricing.money-savings': 'Money Savings',
    'pricing.money-description': 'Save hundreds monthly by reducing food waste and smart shopping',
    'pricing.time-efficiency': 'Time Efficiency',
    'pricing.time-description': 'Streamline grocery shopping and meal prep with automated planning',
    'pricing.faq.title': 'Frequently Asked Questions',
  },
  es: {
    // Language names
    'language.english': 'Inglés',
    'language.spanish': 'Español',
    'language.portuguese': 'Portugués',
    
    // Common
    'common.continue': 'Continuar',
    'common.back': 'Atrás',
    'common.save': 'Guardar Cambios',
    'common.cancel': 'Cancelar',
    
    // Navigation
    'nav.home': 'Inicio',
    'nav.pricing': 'Precios',
    'nav.why-pantry': 'Por qué Pantry',
    'nav.signin': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.language': 'Idioma',
    
    // Home page
    'home.title': 'Planificación Inteligente de Comidas Simplificada',
    'home.subtitle': 'Transforma tu cocina con planificación de comidas impulsada por IA, reduce el desperdicio de alimentos, ahorra dinero y come más saludable con Pantry.',
    'home.cta.primary': 'Comenzar Prueba Gratuita',
    'home.cta.secondary': 'Saber Más',
    'home.features.title': '¿Por qué Pantry?',
    'home.features.subtitle': 'Ahorra tiempo, dinero y reduce el desperdicio de alimentos con planificación inteligente de comidas',
    'home.features.smart-planning.title': 'Planificación Inteligente',
    'home.features.smart-planning.description': 'Sugerencias de comidas impulsadas por IA basadas en tu despensa',
    'home.features.reduce-waste.title': 'Reducir Desperdicio',
    'home.features.reduce-waste.description': 'Usa ingredientes antes de que expiren',
    'home.features.save-money.title': 'Ahorrar Dinero',
    'home.features.save-money.description': 'Compra más inteligentemente con listas automatizadas',
    'home.footer.copyright': '© 2024 Pantry. Todos los derechos reservados.',
    'home.nav.why-pantry': '¿Por qué Pantry?',
    'home.nav.get-started': 'Comenzar',
    
    // Signup
    'signup.title': 'Únete a Pantry',
    'signup.subtitle': 'Crea tu cuenta y comienza tu viaje de cocina inteligente',
    'signup.language.title': 'Idioma Preferido',
    'signup.language.description': 'Elige tu idioma preferido para la aplicación',
    'signup.language.select': 'Seleccionar Idioma',
    'signup.account.title': 'Crea Tu Cuenta',
    'signup.account.description': 'Ingresa tu email y contraseña para comenzar',
    'signup.account.email': 'Dirección de Email',
    'signup.account.password': 'Contraseña',
    'signup.account.continue': 'Continuar',
    'signup.account.sending': 'Enviando Verificación...',
    'signup.already-account': '¿Ya tienes una cuenta?',
    'signup.signin-here': 'Inicia sesión aquí',
    
    // Signin
    'signin.title': 'Bienvenido de Vuelta',
    'signin.subtitle': 'Inicia sesión en tu cuenta de Pantry',
    'signin.email': 'Dirección de Email',
    'signin.email.placeholder': 'Ingresa tu email',
    'signin.password': 'Contraseña',
    'signin.password.placeholder': 'Ingresa tu contraseña',
    'signin.forgot-password': '¿Olvidaste tu contraseña?',
    'signin.button': 'Iniciar Sesión',
    'signin.signing-in': 'Iniciando sesión...',
    'signin.no-account': '¿No tienes una cuenta?',
    'signin.create-here': 'Crea una aquí',
    
    // Profile
    'profile.language': 'Idioma',
    'profile.phone': 'Número de Teléfono',
    'profile.country': 'País',
    
    // Pricing
    'pricing.title': 'Elige Tu Plan de Planificación de Comidas',
    'pricing.subtitle': 'Transforma tu cocina en un centro de planificación de comidas ecológico, que ahorra dinero y tiempo',
    'pricing.back-to-dashboard': 'Volver al Panel',
    'pricing.environmental-impact': 'Impacto Ambiental',
    'pricing.environmental-description': 'Reduce el desperdicio de alimentos y la huella de carbono con planificación inteligente de comidas',
    'pricing.money-savings': 'Ahorros de Dinero',
    'pricing.money-description': 'Ahorra cientos mensualmente reduciendo el desperdicio de alimentos y comprando inteligentemente',
    'pricing.time-efficiency': 'Eficiencia de Tiempo',
    'pricing.time-description': 'Agiliza las compras y la preparación de comidas con planificación automatizada',
    'pricing.faq.title': 'Preguntas Frecuentes',
  },
  pt: {
    // Language names
    'language.english': 'Inglês',
    'language.spanish': 'Espanhol',
    'language.portuguese': 'Português',
    
    // Common
    'common.continue': 'Continuar',
    'common.back': 'Voltar',
    'common.save': 'Salvar Alterações',
    'common.cancel': 'Cancelar',
    
    // Navigation
    'nav.home': 'Início',
    'nav.pricing': 'Preços',
    'nav.why-pantry': 'Por que Pantry',
    'nav.signin': 'Entrar',
    'nav.signup': 'Cadastrar',
    'nav.language': 'Idioma',
    
    // Home page
    'home.title': 'Planejamento Inteligente de Refeições Simplificado',
    'home.subtitle': 'Transforme sua cozinha com planejamento de refeições com IA, reduza o desperdício de alimentos, economize dinheiro e coma mais saudável com o Pantry.',
    'home.cta.primary': 'Começar Teste Gratuito',
    'home.cta.secondary': 'Saiba Mais',
    'home.features.title': 'Por que Pantry?',
    'home.features.subtitle': 'Economize tempo, dinheiro e reduza o desperdício de alimentos com planejamento inteligente de refeições',
    'home.features.smart-planning.title': 'Planejamento Inteligente',
    'home.features.smart-planning.description': 'Sugestões de refeições com IA baseadas na sua despensa',
    'home.features.reduce-waste.title': 'Reduzir Desperdício',
    'home.features.reduce-waste.description': 'Use ingredientes antes que expirem',
    'home.features.save-money.title': 'Economizar Dinheiro',
    'home.features.save-money.description': 'Compre mais inteligentemente com listas automatizadas',
    'home.footer.copyright': '© 2024 Pantry. Todos os direitos reservados.',
    'home.nav.why-pantry': 'Por que Pantry?',
    'home.nav.get-started': 'Começar',
    
    // Signup
    'signup.title': 'Junte-se ao Pantry',
    'signup.subtitle': 'Crie sua conta e comece sua jornada de cozinha inteligente',
    'signup.language.title': 'Idioma Preferido',
    'signup.language.description': 'Escolha seu idioma preferido para o aplicativo',
    'signup.language.select': 'Selecionar Idioma',
    'signup.account.title': 'Crie Sua Conta',
    'signup.account.description': 'Digite seu email e senha para começar',
    'signup.account.email': 'Endereço de Email',
    'signup.account.password': 'Senha',
    'signup.account.continue': 'Continuar',
    'signup.account.sending': 'Enviando Verificação...',
    'signup.already-account': 'Já tem uma conta?',
    'signup.signin-here': 'Entre aqui',
    
    // Signin
    'signin.title': 'Bem-vindo de Volta',
    'signin.subtitle': 'Entre na sua conta Pantry',
    'signin.email': 'Endereço de Email',
    'signin.email.placeholder': 'Digite seu email',
    'signin.password': 'Senha',
    'signin.password.placeholder': 'Digite sua senha',
    'signin.forgot-password': 'Esqueceu a senha?',
    'signin.button': 'Entrar',
    'signin.signing-in': 'Entrando...',
    'signin.no-account': 'Não tem uma conta?',
    'signin.create-here': 'Crie uma aqui',
    
    // Profile
    'profile.language': 'Idioma',
    'profile.phone': 'Número de Telefone',
    'profile.country': 'País',
    
    // Pricing
    'pricing.title': 'Escolha Seu Plano de Planejamento de Refeições',
    'pricing.subtitle': 'Transforme sua cozinha em um centro de planejamento de refeições ecológico, econômico e eficiente',
    'pricing.back-to-dashboard': 'Voltar ao Painel',
    'pricing.environmental-impact': 'Impacto Ambiental',
    'pricing.environmental-description': 'Reduza o desperdício de alimentos e a pegada de carbono com planejamento inteligente de refeições',
    'pricing.money-savings': 'Economia de Dinheiro',
    'pricing.money-description': 'Economize centenas mensalmente reduzindo o desperdício de alimentos e comprando inteligentemente',
    'pricing.time-efficiency': 'Eficiência de Tempo',
    'pricing.time-description': 'Agilize as compras e preparo de refeições com planejamento automatizado',
    'pricing.faq.title': 'Perguntas Frequentes',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
