
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
    
    // Signup
    'signup.language.title': 'Preferred Language',
    'signup.language.description': 'Choose your preferred language for the app',
    'signup.language.select': 'Select Language',
    
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
    
    // Signup
    'signup.language.title': 'Idioma Preferido',
    'signup.language.description': 'Elige tu idioma preferido para la aplicación',
    'signup.language.select': 'Seleccionar Idioma',
    
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
    
    // Signup
    'signup.language.title': 'Idioma Preferido',
    'signup.language.description': 'Escolha seu idioma preferido para o aplicativo',
    'signup.language.select': 'Selecionar Idioma',
    
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
