
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageSelectorProps {
  variant?: "button" | "select";
  className?: string;
}

const LanguageSelector = ({ variant = "select", className = "" }: LanguageSelectorProps) => {
  const { language, setLanguage, t } = useLanguage();

  const languageOptions = [
    { value: 'en', label: t('language.english'), flag: '🇺🇸' },
    { value: 'es', label: t('language.spanish'), flag: '🇪🇸' },
    { value: 'pt', label: t('language.portuguese'), flag: '🇵🇹' }
  ];

  const currentLanguage = languageOptions.find(option => option.value === language);

  if (variant === "button") {
    return (
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'es' | 'pt')}>
        <SelectTrigger className={`w-auto bg-transparent border-none shadow-none focus:ring-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent ${className}`}>
          <div className="flex items-center">
            <Languages className="h-4 w-4" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white">
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{option.flag}</span>
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'es' | 'pt')}>
      <SelectTrigger className={`border-green-200 focus:border-green-400 ${className}`}>
        <SelectValue placeholder={t('signup.language.select')} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {languageOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{option.flag}</span>
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
