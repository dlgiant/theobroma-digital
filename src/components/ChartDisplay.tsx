'use client';

import { useTranslations } from 'next-intl';
import { ChartType } from './ChartSelector';
import SvgIcon from './icons/SvgIcon';

interface ChartDisplayProps {
  chartType: ChartType;
}

export default function ChartDisplay({ chartType }: ChartDisplayProps) {
  const t = useTranslations('dashboard.charts');

  const getChartContent = () => {
    switch (chartType) {
      case 'security':
        return {
          iconName: 'security-events',
          title: t('securityEvents'),
          description: t('securityVisualization'),
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
        };
      case 'maturity':
        return {
          iconName: 'maturity-index',
          title: t('maturityIndex'),
          description: t('maturityVisualization'),
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
        };
      case 'fungal':
        return {
          iconName: 'fungal-threat',
          title: t('fungalThreat'),
          description: t('fungalVisualization'),
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
        };
      case 'canopy':
        return {
          iconName: 'canopy-grading',
          title: t('canopyGrading'),
          description: t('canopyVisualization'),
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
        };
      case 'treeAge':
        return {
          iconName: 'tree-age',
          title: t('treeAge'),
          description: t('treeAgeVisualization'),
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        };
      case 'treeDensity':
        return {
          iconName: 'tree-density',
          title: t('treeDensity'),
          description: t('treeDensityVisualization'),
          color: 'text-purple-600',
          fill: 'blue',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        };
      default:
        return {
          iconName: 'security-events',
          title: t('chartPlaceholder'),
          description: t('securityVisualization'),
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
    }
  };

  const content = getChartContent();

  return (
    <div className={`h-64 ${content.bgColor} flex items-center justify-center border border-border/50`}>
      <div className="text-center">
        <div className={`mb-4 ${content.color} flex justify-center`}>
          <SvgIcon name={content.iconName} size={80} className={content.color} />
        </div>
        <h4 className={`text-xl font-semibold mb-2 ${content.color}`}>
          {content.title}
        </h4>
        <p className="text-sm text-muted-foreground max-w-md px-4">
          {content.description}
        </p>
      </div>
    </div>
  );
}
