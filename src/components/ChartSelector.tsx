'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import SvgIcon from './icons/SvgIcon';

export type ChartType = 'security' | 'maturity' | 'fungal' | 'canopy' | 'treeAge' | 'treeDensity';

interface ChartSelectorProps {
  onChartChange: (chartType: ChartType) => void;
  currentChart: ChartType;
}

export default function ChartSelector({ onChartChange, currentChart }: ChartSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('dashboard.charts');

  const chartOptions: { value: ChartType; label: string; iconName: string }[] = [
    { value: 'security', label: t('securityEvents'), iconName: 'security-events' },
    { value: 'maturity', label: t('maturityIndex'), iconName: 'maturity-index' },
    { value: 'fungal', label: t('fungalThreat'), iconName: 'fungal-threat' },
    { value: 'canopy', label: t('canopyGrading'), iconName: 'canopy-grading' },
    { value: 'treeAge', label: t('treeAge'), iconName: 'tree-age' },
    { value: 'treeDensity', label: t('treeDensity'), iconName: 'tree-density' },
  ];

  const currentOption = chartOptions.find(option => option.value === currentChart);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (chartType: ChartType) => {
    onChartChange(chartType);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 bg-card border border-border text-card-foreground px-4 py-2 pr-8 shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors min-w-48"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('selectChart')}
        aria-expanded={isOpen}
      >
        {currentOption && (
          <>
            <SvgIcon name={currentOption.iconName} size={18} className="text-current" />
            <span className="flex-1 text-left">{currentOption.label}</span>
          </>
        )}
        <svg className="fill-current h-4 w-4 ml-auto" viewBox="0 0 20 20">
          <path d={isOpen ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"} />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border shadow-lg">
          <div className="py-1">
            {chartOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors"
                onClick={() => handleSelect(option.value)}
              >
                <SvgIcon name={option.iconName} size={18} className="text-current" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
