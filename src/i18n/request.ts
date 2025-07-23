import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export const locales = ['pt-BR', 'en-US'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale, requestLocale }) => {
  console.log('i18n config - received locale:', locale);
  console.log('i18n config - requestLocale:', requestLocale);
  
  let finalLocale: Locale = 'pt-BR'; // Default locale
  
  // If locale is provided and valid, use it
  if (locale && locales.includes(locale as Locale)) {
    finalLocale = locale as Locale;
    console.log('i18n config - using provided locale:', finalLocale);
  } else {
    // Try to get locale from middleware header
    const headersList = await headers();
    const localeFromHeader = headersList.get('x-locale');
    console.log('i18n config - locale from header:', localeFromHeader);
    
    if (localeFromHeader && locales.includes(localeFromHeader as Locale)) {
      finalLocale = localeFromHeader as Locale;
      console.log('i18n config - using locale from header:', finalLocale);
    } else {
      // Handle requestLocale which might be a Promise
      try {
        const resolvedRequestLocale = await Promise.resolve(requestLocale);
        if (resolvedRequestLocale && locales.includes(resolvedRequestLocale as Locale)) {
          finalLocale = resolvedRequestLocale as Locale;
          console.log('i18n config - using requestLocale:', finalLocale);
        } else {
          console.log('i18n config - no valid locale found, using default pt-BR');
        }
      } catch {
        console.log('i18n config - error resolving requestLocale, using default pt-BR');
      }
    }
  }
  
  console.log('i18n config - final locale:', finalLocale);
  
  return {
    locale: finalLocale,
    messages: (await import(`../../messages/${finalLocale}.json`)).default
  };
});
