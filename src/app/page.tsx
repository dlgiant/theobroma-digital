'use client';

import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    // Simple redirect for root page only
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      const savedLocale = localStorage.getItem('preferred-locale') || 'pt-BR';
      window.location.replace(`/${savedLocale}`);
    }
  }, []);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
