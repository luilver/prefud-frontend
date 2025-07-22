
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Country {
  code: string;
  name: string;
  prefix: string;
  flag: string;
}

export const countries: Country[] = [
  { code: 'US', name: 'United States', prefix: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', prefix: '+1', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', prefix: '+52', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', prefix: '+55', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', prefix: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', prefix: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', prefix: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', prefix: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', prefix: '+58', flag: '🇻🇪' },
  { code: 'UY', name: 'Uruguay', prefix: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', prefix: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', prefix: '+591', flag: '🇧🇴' },
  { code: 'EC', name: 'Ecuador', prefix: '+593', flag: '🇪🇨' },
  { code: 'GT', name: 'Guatemala', prefix: '+502', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', prefix: '+504', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', prefix: '+503', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', prefix: '+505', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', prefix: '+506', flag: '🇨🇷' },
  { code: 'PA', name: 'Panama', prefix: '+507', flag: '🇵🇦' },
  { code: 'ES', name: 'Spain', prefix: '+34', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', prefix: '+351', flag: '🇵🇹' },
  { code: 'GB', name: 'United Kingdom', prefix: '+44', flag: '🇬🇧' },
  { code: 'FR', name: 'France', prefix: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', prefix: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', prefix: '+39', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', prefix: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', prefix: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', prefix: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', prefix: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', prefix: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', prefix: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', prefix: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', prefix: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', prefix: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', prefix: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', prefix: '+36', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', prefix: '+40', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', prefix: '+359', flag: '🇧🇬' },
  { code: 'GR', name: 'Greece', prefix: '+30', flag: '🇬🇷' },
  { code: 'TR', name: 'Turkey', prefix: '+90', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', prefix: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', prefix: '+380', flag: '🇺🇦' },
  { code: 'CN', name: 'China', prefix: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', prefix: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', prefix: '+82', flag: '🇰🇷' },
  { code: 'IN', name: 'India', prefix: '+91', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', prefix: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', prefix: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', prefix: '+94', flag: '🇱🇰' },
  { code: 'TH', name: 'Thailand', prefix: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', prefix: '+84', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', prefix: '+63', flag: '🇵🇭' },
  { code: 'MY', name: 'Malaysia', prefix: '+60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', prefix: '+65', flag: '🇸🇬' },
  { code: 'ID', name: 'Indonesia', prefix: '+62', flag: '🇮🇩' },
  { code: 'AU', name: 'Australia', prefix: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', prefix: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', prefix: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', prefix: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', prefix: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', prefix: '+233', flag: '🇬🇭' },
  { code: 'EG', name: 'Egypt', prefix: '+20', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', prefix: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', prefix: '+216', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria', prefix: '+213', flag: '🇩🇿' },
  { code: 'IL', name: 'Israel', prefix: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'UAE', prefix: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', prefix: '+966', flag: '🇸🇦' },
  { code: 'JO', name: 'Jordan', prefix: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', prefix: '+961', flag: '🇱🇧' },
  { code: 'KW', name: 'Kuwait', prefix: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', prefix: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', prefix: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', prefix: '+968', flag: '🇴🇲' }
];

interface CountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const CountrySelect = ({ value, onValueChange, placeholder }: CountrySelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder || "Select country"} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
              <span className="text-gray-500">({country.prefix})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelect;
