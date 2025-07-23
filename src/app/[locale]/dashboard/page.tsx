import { getTranslations } from 'next-intl/server';
import ChartsSection from '@/components/ChartsSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Dashboard({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  return (
    <div className="p-8 min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-foreground">{t('title')}</h1>
        <p className="text-lg text-muted-foreground mb-6">
          {t('subtitle')}
        </p>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-1 mb-8">
          <ChartsSection />
        </div>
      </div>
    </div>
  );
}
