'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're in a static export environment
    const isStaticExport = typeof window !== 'undefined';
    
    if (isStaticExport) {
      // Client-side locale detection and redirection
      const detectLocale = () => {
        // Check for saved locale preference
        const savedLocale = localStorage.getItem('preferred-locale');
        if (savedLocale && ['pt-BR', 'en-US'].includes(savedLocale)) {
          return savedLocale;
        }
        
        // Check browser language
        const browserLocale = navigator.language;
        if (browserLocale.startsWith('pt')) {
          return 'pt-BR';
        } else if (browserLocale.startsWith('en')) {
          return 'en-US';
        }
        
        // Default fallback
        return 'pt-BR';
      };
      
      const locale = detectLocale();
      router.replace(`/${locale}`);
    }
  }, [router]);

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
