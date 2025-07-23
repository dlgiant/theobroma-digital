'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

interface LanguageToggleProps {
  isCollapsed?: boolean;
}

export default function LanguageToggle({ isCollapsed = false }: LanguageToggleProps) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();

  const languages = [
    { code: 'pt-BR', label: t('portuguese'), flag: '🇧🇷' },
    { code: 'en-US', label: t('english'), flag: '🇺🇸' },
  ];

  console.log('Current locale detected:', locale);
  const currentLanguage = languages.find(lang => lang.code === locale);
  console.log('Current language object:', currentLanguage);

  const handleLanguageChange = (newLocale: string) => {
    console.log('Changing language from', locale, 'to', newLocale);
    console.log('Current pathname:', pathname);
    
    if (newLocale === locale) {
      setShowDropdown(false);
      return;
    }
    
    // Replace the current locale in the pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    console.log('New pathname:', newPathname);
    
    setShowDropdown(false);
    
    // Force navigation and refresh
    window.location.href = newPathname;
  };

  return (
    <div className="relative">
      {/* Language Toggle Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isPending}
        className="
          flex items-center justify-center w-10 h-10
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
          shadow-sm transition-colors duration-200 group
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        title={`${t('current')}: ${currentLanguage?.label}`}
      >
        <span className="text-lg">
          {currentLanguage?.flag}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="
          absolute top-full right-0 mt-2 w-48
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          shadow-lg z-50
        ">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isPending}
              className={`
                w-full flex items-center px-3 py-2 text-left
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${locale === language.code ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                ${language.code === languages[0].code ? '' : ''}
                ${language.code === languages[languages.length - 1].code ? '' : ''}
              `}
            >
              <span className="text-lg w-6 h-6 flex items-center justify-center mr-3">
                {language.flag}
              </span>
              <span>{language.label}</span>
              {locale === language.code && (
                <span className="ml-auto text-xs text-gray-400">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
