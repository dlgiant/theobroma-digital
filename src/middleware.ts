import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['pt-BR', 'en-US'],
  defaultLocale: 'pt-BR',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // Let next-intl middleware handle the routing
  const response = intlMiddleware(request);
  
  // Extract locale from pathname and set it as a header for i18n config
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/');
  const localeFromPath = segments[1];
  const validLocales = ['pt-BR', 'en-US'];
  
  if (validLocales.includes(localeFromPath)) {
    response.headers.set('x-locale', localeFromPath);
  } else {
    response.headers.set('x-locale', 'pt-BR');
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|.*\.json).*)']
};
