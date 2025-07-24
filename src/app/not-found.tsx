'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    // If this is accessed from static export, try to determine locale from URL
    const currentPath = window.location.pathname;
    
    // Check if the URL already has a locale
    const hasLocale = /^\/(pt-BR|en-US)/.test(currentPath);
    
    if (!hasLocale) {
      // Redirect to default locale with the same path
      const savedLocale = localStorage.getItem('preferred-locale') || 'pt-BR';
      const newPath = `/${savedLocale}${currentPath}`;
      window.location.href = newPath;
    } else {
      // If it has a locale but still 404, redirect to home with that locale
      const localeMatch = currentPath.match(/^\/(pt-BR|en-US)/);
      const locale = localeMatch ? localeMatch[1] : 'pt-BR';
      window.location.href = `/${locale}`;
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
