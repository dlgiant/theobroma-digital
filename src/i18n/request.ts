import { getRequestConfig } from 'next-intl/server';

export const locales = ['pt-BR', 'en-US'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  console.log('i18n config - received locale:', locale);
  
  const finalLocale: Locale = (locales.includes(locale as Locale)) ? locale as Locale : 'pt-BR';
  console.log('i18n config - final locale:', finalLocale);
  
  return {
    locale: finalLocale,
    messages: (await import(`../../messages/${finalLocale}.json`)).default
  };
});
