'use client';

import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    // Only run redirect logic if we're actually at the root
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      const savedLocale = localStorage.getItem('preferred-locale') || 'pt-BR';
      // Use replace to avoid history entry
      window.location.replace(`/${savedLocale}/`);
    }
  }, []);

  // Show loading state - but this should only be visible for root path visitors
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
