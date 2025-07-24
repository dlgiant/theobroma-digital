import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['pt-BR', 'en-US'],
  defaultLocale: 'pt-BR',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|.*\.json).*)']
};
