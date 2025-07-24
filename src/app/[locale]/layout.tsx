import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Navigation from '../../components/Navigation';
import { ThemeProvider } from '../../components/ThemeProvider';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Generate static params for all supported locales
export async function generateStaticParams() {
  return [
    { locale: 'pt-BR' },
    { locale: 'en-US' }
  ];
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider>
        <Navigation>
          {children}
        </Navigation>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
