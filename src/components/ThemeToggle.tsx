'use client';

import { useTheme } from './ThemeProvider';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export default function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme } = useTheme();
  const t = useTranslations('theme');
  const [showDropdown, setShowDropdown] = useState(false);

  const themeOptions = [
    { value: 'light', label: t('light'), icon: '☀️' },
    { value: 'dark', label: t('dark'), icon: '🌙' },
    { value: 'system', label: t('system'), icon: '💻' },
  ] as const;

  const currentThemeOption = themeOptions.find(option => option.value === theme);

  return (
    <div className="relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="
          flex items-center justify-center w-10 h-10
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
          shadow-sm transition-colors duration-200 group
        "
        title={`${t('current')}: ${currentThemeOption?.label} (${actualTheme})`}
      >
        <span className="text-lg">
          {currentThemeOption?.icon}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="
          absolute top-full right-0 mt-2 w-48
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          shadow-lg z-50
        ">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setShowDropdown(false);
              }}
              className={`
                w-full flex items-center px-3 py-2 text-left
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200
                ${theme === option.value ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                ${option.value === themeOptions[0].value ? '' : ''}
                ${option.value === themeOptions[themeOptions.length - 1].value ? '' : ''}
              `}
            >
              <span className="text-lg w-6 h-6 flex items-center justify-center mr-3">
                {option.icon}
              </span>
              <span>{option.label}</span>
              {theme === option.value && actualTheme && (
                <span className="ml-auto text-xs text-gray-400">
                  ({actualTheme})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
