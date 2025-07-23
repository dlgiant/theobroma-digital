import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export const locales = ['pt-BR', 'en-US'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale, requestLocale }) => {
  console.log('i18n config - received locale:', locale);
  console.log('i18n config - requestLocale:', requestLocale);
  
  // If locale is undefined, try to get it from the middleware header
  if (!locale) {
    const headersList = await headers();
    const localeFromHeader = headersList.get('x-locale');
    console.log('i18n config - locale from header:', localeFromHeader);
    
    if (localeFromHeader && locales.includes(localeFromHeader as Locale)) {
      locale = localeFromHeader;
      console.log('i18n config - using locale from header:', locale);
    } else if (requestLocale && locales.includes(requestLocale as Locale)) {
      locale = requestLocale;
      console.log('i18n config - using requestLocale:', locale);
    } else {
      locale = 'pt-BR';
      console.log('i18n config - no valid locale found, using default pt-BR');
    }
  }
  
  // Validate that the final `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    console.log('i18n config - invalid locale, using default pt-BR');
    locale = 'pt-BR';
  }
  
  console.log('i18n config - using locale:', locale);
  
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
