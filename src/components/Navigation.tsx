'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

interface NavigationProps {
  children: React.ReactNode;
}

const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 1500); // Auto-collapse after 1.5 seconds
  };

  useEffect(() => {
    // Auto-collapse after initial render
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 3000); // Give user 3 seconds to see the nav initially

    return () => {
      clearTimeout(timer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const mainNavItems = [
    { icon: '🏠', label: t('home'), href: `/${locale}` },
    { icon: '📊', label: t('dashboard'), href: `/${locale}/dashboard` },
  ];

  const bottomNavItems = [
    { icon: '👤', label: t('profile'), href: `/${locale}/profile` },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Navigation Sidebar */}
      <nav
        ref={navRef}
        className={`
          fixed left-0 top-0 h-full bg-gray-900 dark:bg-gray-900 text-white transition-all duration-300 ease-in-out z-50
          ${isCollapsed && !isHovered ? 'w-16' : 'w-64'}
          shadow-lg border-r border-gray-700 dark:border-gray-600 flex flex-col
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 dark:border-gray-600">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              ThD
            </div>
            <h1 
              className={`
                font-bold text-xl transition-opacity duration-300
                ${isCollapsed && !isHovered ? 'opacity-0 w-0 h-0' : 'opacity-100 ml-2'}
              `}
            >
              Theobroma
            </h1>
          </div>
        </div>

        {/* Main Navigation Items */}
        <div className="py-4 flex-1">
          {mainNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="
                flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white
                transition-colors duration-200 group relative
              "
            >
              <span className="text-xl w-8 h-8 flex items-center justify-center">
                {item.icon}
              </span>
              <span 
                className={`
                  ml-3 transition-opacity duration-300
                  ${isCollapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100'}
                `}
              >
                {item.label}
              </span>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && !isHovered && (
                <div className="
                  absolute left-16 bg-gray-800 dark:bg-gray-700 text-white px-3 py-2 text-sm
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  pointer-events-none whitespace-nowrap z-10 shadow-lg border border-gray-600
                ">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Bottom Navigation Items */}
        <div className="mt-auto">
          {bottomNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="
                flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white
                transition-colors duration-200 group relative
              "
            >
              <span className="text-xl w-8 h-8 flex items-center justify-center">
                {item.icon}
              </span>
              <span 
                className={`
                  ml-3 transition-opacity duration-300
                  ${isCollapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100'}
                `}
              >
                {item.label}
              </span>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && !isHovered && (
                <div className="
                  absolute left-16 bg-gray-800 dark:bg-gray-700 text-white px-3 py-2 text-sm
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  pointer-events-none whitespace-nowrap z-10 shadow-lg border border-gray-600
                ">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Collapse/Expand Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="
              w-full flex items-center justify-center px-3 py-2 
              bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 
              transition-colors duration-200 shadow-sm
            "
          >
            <span className="text-lg">
              {isCollapsed ? '→' : '←'}
            </span>
            <span 
              className={`
                ml-2 transition-opacity duration-300
                ${isCollapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100'}
              `}
            >
              {isCollapsed ? t('expand') : t('collapse')}
            </span>
          </button>
        </div>
      </nav>

      {/* Fixed Top Right Toggles */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Main Content Area */}
      <main 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isCollapsed && !isHovered ? 'ml-16' : 'ml-64'}
        `}
      >
        {children}
      </main>
    </div>
  );
};

export default Navigation;
