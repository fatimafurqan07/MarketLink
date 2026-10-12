import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.tsx';

export interface LanguageToggleProps {
  className?: string;
  variant?: 'navbar' | 'pill' | 'compact';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label="Toggle language between English and Urdu"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          language === 'ur'
            ? 'bg-[#ecfdf5] border-emerald-300 text-[#064e3b]'
            : 'bg-white/80 hover:bg-white border-[#e2e8e5] text-[#10231d]'
        } ${className}`}
      >
        <Globe className="w-3.5 h-3.5 text-[#064e3b]" />
        <span className="font-mono text-[11px] font-bold">
          {language === 'en' ? 'اردو' : 'EN'}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border border-[#e2e8e5] bg-white/90 shadow-2xs backdrop-blur-xs select-none ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'en'
            ? 'bg-[#064e3b] text-white shadow-2xs'
            : 'text-[#64748b] hover:text-[#10231d] bg-transparent'
        }`}
        aria-pressed={language === 'en'}
      >
        <span className="font-mono text-[11px] font-bold">EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ur')}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'ur'
            ? 'bg-[#064e3b] text-white shadow-2xs'
            : 'text-[#64748b] hover:text-[#10231d] bg-transparent'
        }`}
        aria-pressed={language === 'ur'}
      >
        <span className="text-[12px] font-medium leading-none pb-0.5">اردو</span>
      </button>
    </div>
  );
};
