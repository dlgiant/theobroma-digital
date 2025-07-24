import { getRequestConfig } from 'next-intl/server';

export const locales = ['pt-BR', 'en-US'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  const finalLocale: Locale = (locales.includes(locale as Locale)) ? locale as Locale : 'pt-BR';
  
  try {
    // Import messages with error handling for static exports
    const messages = (await import(`../../messages/${finalLocale}.json`)).default;
    
    return {
      locale: finalLocale,
      messages
    };
  } catch (error) {
    console.error('Failed to load messages for locale:', finalLocale, error);
    
    // Fallback to default locale messages
    try {
      const fallbackMessages = (await import(`../../messages/pt-BR.json`)).default;
      
      return {
        locale: 'pt-BR',
        messages: fallbackMessages
      };
    } catch (fallbackError) {
      console.error('Failed to load fallback messages:', fallbackError);
      
      // Return empty messages as last resort
      return {
        locale: 'pt-BR',
        messages: {}
      };
    }
  }
});
