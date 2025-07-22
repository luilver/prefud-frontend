import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'common.back': 'Back',
    'nav.home': 'Home',
    'nav.pricing': 'Pricing',
    'nav.why': 'Why Pantry?',
    'signin.title': 'Sign In',
    'signup.title': 'Create an Account',
    'signup.subtitle': 'Start planning your meals today!',
    'signup.already-account': 'Already have an account?',
    'signup.signin-here': 'Sign in here',
    'signup.account.title': 'Create Account',
    'signup.account.description': 'Enter your email and password to create an account',
    'signup.account.email': 'Email Address',
    'signup.account.password': 'Password',
    'signup.account.continue': 'Continue',
    'signup.account.sending': 'Sending...',
    'signup.language.select': 'Select language',
    'language.english': 'English',
    'language.spanish': 'Spanish',
    'language.portuguese': 'Portuguese',
    
    // Signup Steps
    'signup.steps.basic': 'Basic Info',
    'signup.steps.verify': 'Verify Email',
    'signup.steps.profile': 'Profile',
    'signup.steps.subscription': 'Subscription',
    'signup.steps.payment': 'Payment',
    
    // OTP Verification
    'otp.title': 'Verify Your Email',
    'otp.description': "We've sent a 6-digit code to",
    'otp.instruction': 'Enter the verification code sent to your email',
    'otp.verify': 'Verify Email',
    'otp.verifying': 'Verifying...',
    'otp.resend.text': "Didn't receive the code?",
    'otp.resend.button': 'Resend Code',
    'otp.resend.sending': 'Sending...',
    
    // User Profile Form
    'profile.title': 'Complete Your Profile',
    'profile.description': 'Tell us about yourself to personalize your experience',
    'profile.personal.title': 'Personal Information',
    'profile.personal.name': 'First Name',
    'profile.personal.lastname': 'Last Name',
    'profile.personal.phone': 'Phone Number',
    'profile.personal.country': 'Country',
    'profile.personal.birthday': 'Birthday',
    'profile.physical.title': 'Physical Information',
    'profile.physical.weight': 'Weight (lbs)',
    'profile.physical.height': 'Height',
    'profile.physical.feet': 'Feet',
    'profile.physical.inches': 'Inches',
    'profile.goals.title': 'Health Goals',
    'profile.goals.weight-loss': 'Weight Loss',
    'profile.goals.muscle-gain': 'Muscle Gain',
    'profile.goals.maintain': 'Maintain Weight',
    'profile.goals.energy': 'Increase Energy',
    'profile.goals.wellness': 'General Wellness',
    'profile.diet.title': 'Dietary Preferences',
    'profile.diet.vegetarian': 'Vegetarian',
    'profile.diet.vegan': 'Vegan',
    'profile.diet.keto': 'Keto',
    'profile.diet.paleo': 'Paleo',
    'profile.diet.mediterranean': 'Mediterranean',
    'profile.diet.none': 'No Specific Diet',
    'profile.allergies.title': 'Allergies & Restrictions',
    'profile.allergies.nuts': 'Nuts',
    'profile.allergies.dairy': 'Dairy',
    'profile.allergies.gluten': 'Gluten',
    'profile.allergies.shellfish': 'Shellfish',
    'profile.allergies.eggs': 'Eggs',
    'profile.allergies.soy': 'Soy',
    'profile.allergies.none': 'No Allergies',
    'profile.complete': 'Complete Profile',
    'profile.completing': 'Completing...',
    
    // Subscription Plans
    'subscription.title': 'Choose Your Plan',
    'subscription.description': 'Select the plan that works best for you',
    'subscription.popular': 'Most Popular',
    'subscription.features': 'Features',
    'subscription.choose': 'Choose',
    'subscription.free.name': 'Free',
    'subscription.free.description': 'Perfect for getting started with meal planning',
    'subscription.family.name': 'Family',
    'subscription.family.description': 'Ideal for families looking to optimize meal planning',
    'subscription.professional.name': 'Professional',
    'subscription.professional.description': 'For meal planning professionals and large households',
    
    // Password Recovery
    'recovery.title': 'Recover Password',
    'recovery.email.description': "Enter your email address and we'll send you a verification code",
    'recovery.email.label': 'Email Address',
    'recovery.email.placeholder': 'Enter your email',
    'recovery.email.send': 'Send Verification Code',
    'recovery.email.sending': 'Sending...',
    'recovery.otp.title': 'Verify Email',
    'recovery.otp.description': "We've sent a 6-digit code to",
    'recovery.otp.verify': 'Verify Code',
    'recovery.otp.back': 'Back to Email',
    'recovery.password.title': 'Set New Password',
    'recovery.password.description': 'Create a new password for your account',
    'recovery.password.new': 'New Password',
    'recovery.password.new.placeholder': 'Enter new password',
    'recovery.password.confirm': 'Confirm New Password',
    'recovery.password.confirm.placeholder': 'Confirm new password',
    'recovery.password.update': 'Update Password',
    'recovery.password.updating': 'Updating...',
    'recovery.password.back': 'Back to Verification',
    'recovery.success.title': 'Password Updated!',
    'recovery.success.description': 'Your password has been successfully changed. You can now sign in with your new password.',
    'recovery.success.signin': 'Sign In Now',
  },
  es: {
    'common.back': 'Atrás',
    'nav.home': 'Inicio',
    'nav.pricing': 'Precios',
    'nav.why': '¿Por qué Pantry?',
    'signin.title': 'Iniciar Sesión',
    'signup.title': 'Crear una Cuenta',
    'signup.subtitle': '¡Comienza a planificar tus comidas hoy mismo!',
    'signup.already-account': '¿Ya tienes una cuenta?',
    'signup.signin-here': 'Inicia sesión aquí',
    'signup.account.title': 'Crear Cuenta',
    'signup.account.description': 'Ingresa tu correo electrónico y contraseña para crear una cuenta',
    'signup.account.email': 'Dirección de Correo Electrónico',
    'signup.account.password': 'Contraseña',
    'signup.account.continue': 'Continuar',
    'signup.account.sending': 'Enviando...',
    'signup.language.select': 'Seleccionar idioma',
    'language.english': 'Inglés',
    'language.spanish': 'Español',
    'language.portuguese': 'Portugués',
    
    // Signup Steps
    'signup.steps.basic': 'Información Básica',
    'signup.steps.verify': 'Verificar Email',
    'signup.steps.profile': 'Perfil',
    'signup.steps.subscription': 'Suscripción',
    'signup.steps.payment': 'Pago',
    
    // OTP Verification
    'otp.title': 'Verifica tu Email',
    'otp.description': 'Hemos enviado un código de 6 dígitos a',
    'otp.instruction': 'Ingresa el código de verificación enviado a tu email',
    'otp.verify': 'Verificar Email',
    'otp.verifying': 'Verificando...',
    'otp.resend.text': '¿No recibiste el código?',
    'otp.resend.button': 'Reenviar Código',
    'otp.resend.sending': 'Enviando...',
    
    // User Profile Form
    'profile.title': 'Completa tu Perfil',
    'profile.description': 'Cuéntanos sobre ti para personalizar tu experiencia',
    'profile.personal.title': 'Información Personal',
    'profile.personal.name': 'Nombre',
    'profile.personal.lastname': 'Apellido',
    'profile.personal.phone': 'Número de Teléfono',
    'profile.personal.country': 'País',
    'profile.personal.birthday': 'Fecha de Nacimiento',
    'profile.physical.title': 'Información Física',
    'profile.physical.weight': 'Peso (lbs)',
    'profile.physical.height': 'Altura',
    'profile.physical.feet': 'Pies',
    'profile.physical.inches': 'Pulgadas',
    'profile.goals.title': 'Objetivos de Salud',
    'profile.goals.weight-loss': 'Pérdida de Peso',
    'profile.goals.muscle-gain': 'Ganancia Muscular',
    'profile.goals.maintain': 'Mantener Peso',
    'profile.goals.energy': 'Aumentar Energía',
    'profile.goals.wellness': 'Bienestar General',
    'profile.diet.title': 'Preferencias Dietéticas',
    'profile.diet.vegetarian': 'Vegetariano',
    'profile.diet.vegan': 'Vegano',
    'profile.diet.keto': 'Keto',
    'profile.diet.paleo': 'Paleo',
    'profile.diet.mediterranean': 'Mediterránea',
    'profile.diet.none': 'Sin Dieta Específica',
    'profile.allergies.title': 'Alergias y Restricciones',
    'profile.allergies.nuts': 'Frutos Secos',
    'profile.allergies.dairy': 'Lácteos',
    'profile.allergies.gluten': 'Gluten',
    'profile.allergies.shellfish': 'Mariscos',
    'profile.allergies.eggs': 'Huevos',
    'profile.allergies.soy': 'Soja',
    'profile.allergies.none': 'Sin Alergias',
    'profile.complete': 'Completar Perfil',
    'profile.completing': 'Completando...',
    
    // Subscription Plans
    'subscription.title': 'Elige tu Plan',
    'subscription.description': 'Selecciona el plan que mejor funcione para ti',
    'subscription.popular': 'Más Popular',
    'subscription.features': 'Características',
    'subscription.choose': 'Elegir',
    'subscription.free.name': 'Gratis',
    'subscription.free.description': 'Perfecto para comenzar con la planificación de comidas',
    'subscription.family.name': 'Familiar',
    'subscription.family.description': 'Ideal para familias que buscan optimizar la planificación de comidas',
    'subscription.professional.name': 'Profesional',
    'subscription.professional.description': 'Para profesionales de planificación de comidas y hogares grandes',
    
    // Password Recovery
    'recovery.title': 'Recuperar Contraseña',
    'recovery.email.description': 'Ingresa tu dirección de email y te enviaremos un código de verificación',
    'recovery.email.label': 'Dirección de Email',
    'recovery.email.placeholder': 'Ingresa tu email',
    'recovery.email.send': 'Enviar Código de Verificación',
    'recovery.email.sending': 'Enviando...',
    'recovery.otp.title': 'Verificar Email',
    'recovery.otp.description': 'Hemos enviado un código de 6 dígitos a',
    'recovery.otp.verify': 'Verificar Código',
    'recovery.otp.back': 'Volver al Email',
    'recovery.password.title': 'Establecer Nueva Contraseña',
    'recovery.password.description': 'Crea una nueva contraseña para tu cuenta',
    'recovery.password.new': 'Nueva Contraseña',
    'recovery.password.new.placeholder': 'Ingresa nueva contraseña',
    'recovery.password.confirm': 'Confirmar Nueva Contraseña',
    'recovery.password.confirm.placeholder': 'Confirma nueva contraseña',
    'recovery.password.update': 'Actualizar Contraseña',
    'recovery.password.updating': 'Actualizando...',
    'recovery.password.back': 'Volver a Verificación',
    'recovery.success.title': '¡Contraseña Actualizada!',
    'recovery.success.description': 'Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
    'recovery.success.signin': 'Iniciar Sesión Ahora',
  },
  pt: {
    'common.back': 'Voltar',
    'nav.home': 'Início',
    'nav.pricing': 'Preços',
    'nav.why': 'Por que Pantry?',
    'signin.title': 'Entrar',
    'signup.title': 'Criar uma Conta',
    'signup.subtitle': 'Comece a planejar suas refeições hoje mesmo!',
    'signup.already-account': 'Já tem uma conta?',
    'signup.signin-here': 'Entre aqui',
    'signup.account.title': 'Criar Conta',
    'signup.account.description': 'Digite seu e-mail e senha para criar uma conta',
    'signup.account.email': 'Endereço de E-mail',
    'signup.account.password': 'Senha',
    'signup.account.continue': 'Continuar',
    'signup.account.sending': 'Enviando...',
    'signup.language.select': 'Selecionar idioma',
    'language.english': 'Inglês',
    'language.spanish': 'Espanhol',
    'language.portuguese': 'Português',
    
    // Signup Steps
    'signup.steps.basic': 'Info Básica',
    'signup.steps.verify': 'Verificar Email',
    'signup.steps.profile': 'Perfil',
    'signup.steps.subscription': 'Assinatura',
    'signup.steps.payment': 'Pagamento',
    
    // OTP Verification
    'otp.title': 'Verifique seu Email',
    'otp.description': 'Enviamos um código de 6 dígitos para',
    'otp.instruction': 'Digite o código de verificação enviado para seu email',
    'otp.verify': 'Verificar Email',
    'otp.verifying': 'Verificando...',
    'otp.resend.text': 'Não recebeu o código?',
    'otp.resend.button': 'Reenviar Código',
    'otp.resend.sending': 'Enviando...',
    
    // User Profile Form
    'profile.title': 'Complete seu Perfil',
    'profile.description': 'Conte-nos sobre você para personalizar sua experiência',
    'profile.personal.title': 'Informações Pessoais',
    'profile.personal.name': 'Nome',
    'profile.personal.lastname': 'Sobrenome',
    'profile.personal.phone': 'Número de Telefone',
    'profile.personal.country': 'País',
    'profile.personal.birthday': 'Data de Nascimento',
    'profile.physical.title': 'Informações Físicas',
    'profile.physical.weight': 'Peso (lbs)',
    'profile.physical.height': 'Altura',
    'profile.physical.feet': 'Pés',
    'profile.physical.inches': 'Polegadas',
    'profile.goals.title': 'Objetivos de Saúde',
    'profile.goals.weight-loss': 'Perda de Peso',
    'profile.goals.muscle-gain': 'Ganho Muscular',
    'profile.goals.maintain': 'Manter Peso',
    'profile.goals.energy': 'Aumentar Energia',
    'profile.goals.wellness': 'Bem-estar Geral',
    'profile.diet.title': 'Preferências Dietéticas',
    'profile.diet.vegetarian': 'Vegetariano',
    'profile.diet.vegan': 'Vegano',
    'profile.diet.keto': 'Keto',
    'profile.diet.paleo': 'Paleo',
    'profile.diet.mediterranean': 'Mediterrânea',
    'profile.diet.none': 'Sem Dieta Específica',
    'profile.allergies.title': 'Alergias e Restrições',
    'profile.allergies.nuts': 'Nozes',
    'profile.allergies.dairy': 'Laticínios',
    'profile.allergies.gluten': 'Glúten',
    'profile.allergies.shellfish': 'Frutos do Mar',
    'profile.allergies.eggs': 'Ovos',
    'profile.allergies.soy': 'Soja',
    'profile.allergies.none': 'Sem Alergias',
    'profile.complete': 'Completar Perfil',
    'profile.completing': 'Completando...',
    
    // Subscription Plans
    'subscription.title': 'Escolha seu Plano',
    'subscription.description': 'Selecione o plano que funciona melhor para você',
    'subscription.popular': 'Mais Popular',
    'subscription.features': 'Recursos',
    'subscription.choose': 'Escolher',
    'subscription.free.name': 'Grátis',
    'subscription.free.description': 'Perfeito para começar com planejamento de refeições',
    'subscription.family.name': 'Família',
    'subscription.family.description': 'Ideal para famílias que buscam otimizar o planejamento de refeições',
    'subscription.professional.name': 'Profissional',
    'subscription.professional.description': 'Para profissionais de planejamento de refeições e lares grandes',
    
    // Password Recovery
    'recovery.title': 'Recuperar Senha',
    'recovery.email.description': 'Digite seu endereço de email e enviaremos um código de verificação',
    'recovery.email.label': 'Endereço de Email',
    'recovery.email.placeholder': 'Digite seu email',
    'recovery.email.send': 'Enviar Código de Verificação',
    'recovery.email.sending': 'Enviando...',
    'recovery.otp.title': 'Verificar Email',
    'recovery.otp.description': 'Enviamos um código de 6 dígitos para',
    'recovery.otp.verify': 'Verificar Código',
    'recovery.otp.back': 'Voltar ao Email',
    'recovery.password.title': 'Definir Nova Senha',
    'recovery.password.description': 'Crie uma nova senha para sua conta',
    'recovery.password.new': 'Nova Senha',
    'recovery.password.new.placeholder': 'Digite nova senha',
    'recovery.password.confirm': 'Confirmar Nova Senha',
    'recovery.password.confirm.placeholder': 'Confirme nova senha',
    'recovery.password.update': 'Atualizar Senha',
    'recovery.password.updating': 'Atualizando...',
    'recovery.password.back': 'Voltar à Verificação',
    'recovery.success.title': 'Senha Atualizada!',
    'recovery.success.description': 'Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.',
    'recovery.success.signin': 'Fazer Login Agora',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'en');

  React.useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { LanguageProvider, useLanguage };
