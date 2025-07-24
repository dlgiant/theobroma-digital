'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RootPage() {
  useEffect(() => {
    // Get preferred locale from localStorage or default to pt-BR
    const savedLocale = localStorage.getItem('preferred-locale') || 'pt-BR';
    // Redirect immediately
    window.location.replace(`/${savedLocale}/`);
  }, []);

  // This will be rendered as static HTML with a meta refresh fallback
  return (
    <>
      {/* Meta refresh as fallback */}
      <meta httpEquiv="refresh" content="1; url=/pt-BR/" />
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
        `
      }} />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Redirecionando...</p>
          <p style={{ color: '#9ca3af', margin: '8px 0 0', fontSize: '14px' }}>Se não for redirecionado automaticamente, 
            <Link href="/pt-BR/" style={{ color: '#10b981', textDecoration: 'underline' }}>clique aqui</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
