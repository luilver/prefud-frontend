
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
    'home.title': 'Smart Kitchen Management',
    'home.subtitle': 'Transform your cooking experience with AI-powered meal planning, smart pantry management, and personalized nutrition tracking.',
    'home.cta.primary': 'Get Started Free',
    'home.cta.secondary': 'Learn More',
    'home.features.meal-planning': 'AI Meal Planning',
    'home.features.pantry-management': 'Smart Pantry',
    'home.features.nutrition-tracking': 'Nutrition Tracking',
    'home.hero.badge': 'New AI Features',
    
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
    'home.title': 'Gestión Inteligente de Cocina',
    'home.subtitle': 'Transforma tu experiencia culinaria con planificación de comidas con IA, gestión inteligente de despensa y seguimiento nutricional personalizado.',
    'home.cta.primary': 'Comenzar Gratis',
    'home.cta.secondary': 'Saber Más',
    'home.features.meal-planning': 'Planificación con IA',
    'home.features.pantry-management': 'Despensa Inteligente',
    'home.features.nutrition-tracking': 'Seguimiento Nutricional',
    'home.hero.badge': 'Nuevas Funciones IA',
    
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
    'home.title': 'Gestão Inteligente da Cozinha',
    'home.subtitle': 'Transforme sua experiência culinária com planejamento de refeições com IA, gestão inteligente da despensa e rastreamento nutricional personalizado.',
    'home.cta.primary': 'Começar Grátis',
    'home.cta.secondary': 'Saiba Mais',
    'home.features.meal-planning': 'Planejamento com IA',
    'home.features.pantry-management': 'Despensa Inteligente',
    'home.features.nutrition-tracking': 'Rastreamento Nutricional',
    'home.hero.badge': 'Novos Recursos IA',
    
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
