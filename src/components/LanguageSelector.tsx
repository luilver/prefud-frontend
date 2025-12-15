
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
        <SelectTrigger className={`w-auto bg-emerald-700/40 border border-emerald-500/30 shadow-none focus:ring-0 hover:bg-emerald-600/50 focus:bg-emerald-600/50 data-[state=open]:bg-emerald-600/50 rounded-lg px-2 py-1.5 h-8 transition-colors ${className}`}>
          <div className="flex items-center gap-1">
            <span className="text-sm">{currentLanguage?.flag}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border border-emerald-200 shadow-xl">
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="hover:bg-emerald-50 focus:bg-emerald-50">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{option.flag}</span>
                <span className="text-gray-700">{option.label}</span>
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
