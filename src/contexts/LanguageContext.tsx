
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Language {
  code: 'en' | 'es' | 'pt';
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.planner': 'Planner',
    'nav.meals': 'Meals',
    'nav.drinks': 'Drinks',
    'nav.pantry': 'Pantry',
    'nav.shopping': 'Shopping',
    'nav.environment': 'Environment',
    'nav.calories': 'Calories',
    'nav.highlights': 'Highlights',
    'nav.profile': 'Profile',
    
    // Signup
    'signup.title': 'Join Pantry',
    'signup.subtitle': 'Create your account and start your smart kitchen journey',
    'signup.language': 'Preferred Language',
    'signup.selectLanguage': 'Select your language',
    'signup.name': 'Full Name',
    'signup.email': 'Email',
    'signup.phone': 'Phone Number',
    'signup.selectCountry': 'Select country',
    'signup.password': 'Password',
    'signup.confirmPassword': 'Confirm Password',
    'signup.createAccount': 'Create Account',
    'signup.alreadyHaveAccount': 'Already have an account?',
    'signup.signInHere': 'Sign in here',
    
    // Profile
    'profile.title': 'Profile Settings',
    'profile.personalInfo': 'Personal Information',
    'profile.language': 'Language',
    'profile.save': 'Save Changes',
    'profile.cancel': 'Cancel'
  },
  es: {
    // Navigation
    'nav.planner': 'Planificador',
    'nav.meals': 'Comidas',
    'nav.drinks': 'Bebidas',
    'nav.pantry': 'Despensa',
    'nav.shopping': 'Compras',
    'nav.environment': 'Ambiente',
    'nav.calories': 'Calorías',
    'nav.highlights': 'Destacados',
    'nav.profile': 'Perfil',
    
    // Signup
    'signup.title': 'Únete a Pantry',
    'signup.subtitle': 'Crea tu cuenta y comienza tu viaje de cocina inteligente',
    'signup.language': 'Idioma Preferido',
    'signup.selectLanguage': 'Selecciona tu idioma',
    'signup.name': 'Nombre Completo',
    'signup.email': 'Correo Electrónico',
    'signup.phone': 'Número de Teléfono',
    'signup.selectCountry': 'Seleccionar país',
    'signup.password': 'Contraseña',
    'signup.confirmPassword': 'Confirmar Contraseña',
    'signup.createAccount': 'Crear Cuenta',
    'signup.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'signup.signInHere': 'Inicia sesión aquí',
    
    // Profile
    'profile.title': 'Configuración del Perfil',
    'profile.personalInfo': 'Información Personal',
    'profile.language': 'Idioma',
    'profile.save': 'Guardar Cambios',
    'profile.cancel': 'Cancelar'
  },
  pt: {
    // Navigation
    'nav.planner': 'Planejador',
    'nav.meals': 'Refeições',
    'nav.drinks': 'Bebidas',
    'nav.pantry': 'Despensa',
    'nav.shopping': 'Compras',
    'nav.environment': 'Ambiente',
    'nav.calories': 'Calorias',
    'nav.highlights': 'Destaques',
    'nav.profile': 'Perfil',
    
    // Signup
    'signup.title': 'Junte-se ao Pantry',
    'signup.subtitle': 'Crie sua conta e comece sua jornada de cozinha inteligente',
    'signup.language': 'Idioma Preferido',
    'signup.selectLanguage': 'Selecione seu idioma',
    'signup.name': 'Nome Completo',
    'signup.email': 'E-mail',
    'signup.phone': 'Número de Telefone',
    'signup.selectCountry': 'Selecionar país',
    'signup.password': 'Senha',
    'signup.confirmPassword': 'Confirmar Senha',
    'signup.createAccount': 'Criar Conta',
    'signup.alreadyHaveAccount': 'Já tem uma conta?',
    'signup.signInHere': 'Entre aqui',
    
    // Profile
    'profile.title': 'Configurações do Perfil',
    'profile.personalInfo': 'Informações Pessoais',
    'profile.language': 'Idioma',
    'profile.save': 'Salvar Alterações',
    'profile.cancel': 'Cancelar'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      const language = languages.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferredLanguage', language.code);
  };

  const t = (key: string): string => {
    return translations[currentLanguage.code][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
