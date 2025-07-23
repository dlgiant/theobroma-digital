'use client';

import { useState } from 'react';
import ChartSelector, { ChartType } from './ChartSelector';
import ChartDisplay from './ChartDisplay';
import TreeMapVisualization from './TreeMapVisualization';

export default function ChartsSection() {
  const [selectedChart, setSelectedChart] = useState<ChartType>('security');

  return (
    <div className="bg-card border border-border p-6 shadow-sm">
      <div className="flex items-center justify-center mb-6">
        <ChartSelector 
          currentChart={selectedChart}
          onChartChange={setSelectedChart}
        />
      </div>
      <div className="mt-6">
        <TreeMapVisualization chartType={selectedChart} />
      </div>
    </div>
  );
}
