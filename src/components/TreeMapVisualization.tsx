'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChartType } from './ChartSelector';

interface TreeData {
  id: string;
  type: 'tree';
  lot_id?: number;
  latitude: number;
  longitude: number;
  maturityIndex: number;
  securityEvents: number;
  fungalThreat: number;
  canopyGrading: number;
  treeAge: number;
  treeDensity: number;
}

interface TrailPoint {
  id: string;
  type: 'trail';
  lot_id?: number;
  latitude: number;
  longitude: number;
  trailType: string;
  surface: string;
  width: number;
  difficulty: string;
}

interface Connection {
  id: string;
  lot_id?: number;
  from_id: string;
  to_id: string;
  distance: number;
  trail_type: string;
  bidirectional: boolean;
}

interface LotData {
  lot_id: number;
  metadata: {
    total_points: number;
    total_trees: number;
    total_trail_points: number;
    total_connections: number;
    area: string;
    center_coordinates: {
      latitude: number;
      longitude: number;
    };
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  points: (TreeData | TrailPoint)[];
  trees: TreeData[];
  trail_points: TrailPoint[];
  connections: Connection[];
}

interface NetworkData {
  metadata: {
    total_lots?: number;
    total_points: number;
    total_trees: number;
    total_trail_points: number;
    total_connections: number;
    area?: string;
    total_area?: string;
    center_coordinates?: {
      latitude: number;
      longitude: number;
    };
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  lots?: LotData[];
  points: (TreeData | TrailPoint)[];
  trees: TreeData[];
  trail_points: TrailPoint[];
  connections: Connection[];
}

interface TreeMapVisualizationProps {
  chartType: ChartType;
}

export default function TreeMapVisualization({ chartType }: TreeMapVisualizationProps) {
  const t = useTranslations('dashboard.treeMap');
  const tCharts = useTranslations('dashboard.charts');
  
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [selectedLots, setSelectedLots] = useState<number[]>([]);
  const [showTrails, setShowTrails] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [samplingMode, setSamplingMode] = useState<'auto' | 'low' | 'high'>('auto');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
    type: 'tree' | 'trail' | 'connection';
  }>({ visible: false, x: 0, y: 0, content: '', type: 'tree' });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  
  // Get localized chart type name
  const getChartTypeName = (chartType: ChartType): string => {
    switch (chartType) {
      case 'security':
        return tCharts('securityEvents');
      case 'maturity':
        return tCharts('maturityIndex');
      case 'fungal':
        return tCharts('fungalThreat');
      case 'canopy':
        return tCharts('canopyGrading');
      case 'treeAge':
        return tCharts('treeAge');
      case 'treeDensity':
        return tCharts('treeDensity');
      default:
        return chartType;
    }
  };

  // Update dimensions when container size changes
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const updateDimensions = () => {
      if (svgContainerRef.current) {
        const { width, height } = svgContainerRef.current.getBoundingClientRect();
        // Use the actual available space in the SVG container
        const newWidth = Math.max(300, width);
        const newHeight = Math.max(200, height || width / 2);
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    const debouncedUpdateDimensions = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDimensions, 100);
    };

    // Initial update with delay to ensure container is rendered
    setTimeout(updateDimensions, 150);

    // Observe container size changes
    const resizeObserver = new ResizeObserver(debouncedUpdateDimensions);
    
    if (svgContainerRef.current) {
      resizeObserver.observe(svgContainerRef.current);
    }

    // Also listen to window resize for additional responsiveness
    window.addEventListener('resize', debouncedUpdateDimensions);

    // Listen to transition end events to catch sidebar animations
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'margin-left' || e.propertyName === 'width') {
        setTimeout(updateDimensions, 50);
      }
    };
    
    document.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedUpdateDimensions);
      document.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, []);

  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/tree_coordinates_with_trails.json');
        if (!response.ok) {
          throw new Error('Failed to load network data');
        }
        const data = await response.json();
        setNetworkData(data);
        
        // Initialize selected lots to show only lot 1 by default
        if (data.lots && data.lots.length > 0) {
          setSelectedLots([1]); // Only select lot 1 by default
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading network data:', err);
        setError('Failed to load network data');
      } finally {
        setLoading(false);
      }
    };

    loadNetworkData();
  }, []);

  const getDataValue = (tree: TreeData): number => {
    switch (chartType) {
      case 'security':
        return tree.securityEvents;
      case 'maturity':
        return tree.maturityIndex;
      case 'fungal':
        return tree.fungalThreat;
      case 'canopy':
        return tree.canopyGrading;
      case 'treeAge':
        return tree.treeAge;
      case 'treeDensity':
        return tree.treeDensity;
      default:
        return 0;
    }
  };

  const getColorForValue = (value: number, chartType: ChartType): string => {
    // Normalize values to 0-1 range for consistent color mapping
    let normalizedValue = value;
    if (chartType === 'treeAge') {
      // Tree age is 0-20, so normalize to 0-1
      normalizedValue = Math.min(value / 20, 1);
    } else if (chartType === 'security') {
      // Security events are binary (0 or 1), so use as-is
      normalizedValue = value;
    }
    // Other values are already 0-1

    const intensity = Math.round(normalizedValue * 100);

    switch (chartType) {
      case 'security':
        return value > 0 ? '#ef4444' : '#22c55e'; // Red for events, green for no events
      case 'maturity':
        return `hsl(${45 + intensity * 0.6}, 70%, ${50 + intensity * 0.3}%)`; // Yellow to orange gradient
      case 'fungal':
        return `hsl(${15 - intensity * 0.15}, ${60 + intensity * 0.4}%, ${60 - intensity * 0.4}%)`; // Red gradient
      case 'canopy':
        return `hsl(${120 + intensity * 0.4}, ${50 + intensity * 0.5}%, ${40 + intensity * 0.3}%)`; // Green gradient
      case 'treeAge':
        return `hsl(${260 - intensity * 0.6}, ${50 + intensity * 0.3}%, ${50 + intensity * 0.2}%)`; // Purple gradient
      case 'treeDensity':
        return `hsl(${180 + intensity * 0.4}, ${50 + intensity * 0.4}%, ${45 + intensity * 0.3}%)`; // Teal gradient
      default:
        return '#64748b';
    }
  };

  const getPointSize = (value: number, chartType: ChartType, mapWidth: number): number => {
    // Base size + variation based on value, scaled with map size
    let normalizedValue = value;
    if (chartType === 'treeAge') {
      normalizedValue = Math.min(value / 20, 1);
    } else if (chartType === 'security') {
      normalizedValue = value;
    }

    // Scale point size based on map width (responsive sizing)
    const scaleFactor = Math.min(mapWidth / 800, 1.5); // Base scale on 800px width, max 1.5x
    const baseSize = 3 * scaleFactor;
    const maxSize = 8 * scaleFactor;

    return chartType === 'security' 
      ? (value > 0 ? maxSize : baseSize) // Larger points for security events
      : baseSize + (normalizedValue * (maxSize - baseSize)); // Variable size scaled
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">{t('error')}</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!networkData || !networkData.trees.length) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-muted-foreground">{t('noData')}</p>
      </div>
    );
  }

  const { trees, trail_points, connections } = networkData;

  // Filter data based on selected lots
  const filteredTrees = selectedLots.length === 0 ? trees : trees.filter(tree => tree.lot_id && selectedLots.includes(tree.lot_id));
  const filteredTrailPoints = selectedLots.length === 0 ? trail_points : trail_points.filter(trail => trail.lot_id && selectedLots.includes(trail.lot_id));
  const filteredConnections = selectedLots.length === 0 ? connections : connections.filter(conn => conn.lot_id && selectedLots.includes(conn.lot_id));

  // Intelligent sampling for performance based on number of lots
  const getSamplingRatio = () => {
    const numLots = selectedLots.length;
    
    if (samplingMode === 'low') return 0.01;  // 1% minimum
    if (samplingMode === 'high') return 1.0;  // 100% maximum
    
    // Auto mode - linear sampling based on number of lots
    if (numLots === 0) return 1.0;            // Show all when no lots selected
    if (numLots === 1) return 1.0;            // 100% for single lot
    if (numLots >= 50) return 0.01;           // 1% for 50+ lots
    
    // Linear interpolation: 100% at 1 lot, 1% at 50 lots
    // Formula: y = mx + b where y is sampling ratio, x is number of lots
    // At x=1, y=1.0; At x=50, y=0.01
    // m = (0.01 - 1.0) / (50 - 1) = -0.99/49 = -0.0202
    // b = 1.0 - (-0.0202 * 1) = 1.0202
    const samplingRatio = -0.0202 * numLots + 1.0202;
    
    // Ensure we stay within bounds
    return Math.max(0.01, Math.min(1.0, samplingRatio));
  };

  const sampleData = <T extends { id: string }>(data: T[], ratio: number): T[] => {
    if (ratio >= 1.0) return data;
    
    const sampleSize = Math.max(1, Math.floor(data.length * ratio));
    const step = Math.floor(data.length / sampleSize);
    
    // Use systematic sampling for even distribution
    const sampled: T[] = [];
    for (let i = 0; i < data.length; i += step) {
      if (sampled.length < sampleSize) {
        sampled.push(data[i]);
      }
    }
    
    return sampled;
  };

  const samplingRatio = getSamplingRatio();
  const sampledTrees = sampleData(filteredTrees, samplingRatio);
  const sampledTrailPoints = sampleData(filteredTrailPoints, samplingRatio * 0.5); // Fewer trail points
  const sampledConnections = sampleData(filteredConnections, samplingRatio * 0.3); // Even fewer connections

  // Calculate bounds for coordinate normalization using sampled points
  const allLatitudes = [...sampledTrees.map(t => t.latitude), ...sampledTrailPoints.map(t => t.latitude)];
  const allLongitudes = [...sampledTrees.map(t => t.longitude), ...sampledTrailPoints.map(t => t.longitude)];
  const minLat = Math.min(...allLatitudes);
  const maxLat = Math.max(...allLatitudes);
  const minLng = Math.min(...allLongitudes);
  const maxLng = Math.max(...allLongitudes);

  // Add padding to bounds
  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;
  const padding = 0.1; // 10% padding

  // Helper function to get lot color
  const getLotColor = (lotId: number): string => {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
      '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16', '#06d6a0', '#0ea5e9'
    ];
    return colors[(lotId - 1) % colors.length];
  };

  // Toggle lot selection
  const toggleLot = (lotId: number) => {
    setSelectedLots(prev => 
      prev.includes(lotId) 
        ? prev.filter(id => id !== lotId)
        : [...prev, lotId]
    );
  };

  // Select only this lot (deselect all others)
  const selectOnlyLot = (lotId: number) => {
    setSelectedLots([lotId]);
  };

  // Toggle all lots
  const toggleAllLots = () => {
    if (selectedLots.length === (networkData.lots?.length || 0)) {
      setSelectedLots([]);
    } else {
      setSelectedLots(networkData.lots?.map(lot => lot.lot_id) || []);
    }
  };

  const normalizeCoordinate = (value: number, min: number, max: number, size: number) => {
    return ((value - min) / (max - min)) * (size - 40) + 20; // 20px padding on each side
  };

  const { width: mapWidth, height: mapHeight } = dimensions;

  const handleMouseEnter = (event: React.MouseEvent, tree: TreeData) => {
    const rect = svgContainerRef.current?.getBoundingClientRect();
    if (rect) {
      const value = getDataValue(tree);
      const lotInfo = tree.lot_id ? `\n${t('tooltip.lot')}: ${tree.lot_id}` : '';
      const content = `${t('tooltip.treeId')}: ${tree.id}${lotInfo}
${t('tooltip.coordinates')}: ${tree.latitude.toFixed(6)}, ${tree.longitude.toFixed(6)}
${t('tooltip.treeMetrics')}
${t('tooltip.maturityIndex')}: ${(tree.maturityIndex * 100).toFixed(1)}%
${t('tooltip.securityEvents')}: ${tree.securityEvents}
${t('tooltip.fungalThreat')}: ${(tree.fungalThreat * 100).toFixed(1)}%
${t('tooltip.canopyGrading')}: ${(tree.canopyGrading * 100).toFixed(1)}%
${t('tooltip.treeAge')}: ${tree.treeAge.toFixed(1)} ${t('tooltip.years')}
${t('tooltip.treeDensity')}: ${(tree.treeDensity * 100).toFixed(1)}%
${t('tooltip.currentView')}
${t('tooltip.showing')}: ${getChartTypeName(chartType)}
${t('tooltip.currentValue')}: ${chartType === 'security' ? tree.securityEvents : chartType === 'treeAge' ? `${value.toFixed(1)} ${t('tooltip.years')}` : `${(value * 100).toFixed(1)}%`}`;
      
      setTooltip({
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        content,
        type: 'tree'
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = svgContainerRef.current?.getBoundingClientRect();
    if (rect && tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        backgroundColor: 'black',
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleTrailMouseEnter = (event: React.MouseEvent, trail: TrailPoint) => {
    const rect = svgContainerRef.current?.getBoundingClientRect();
    if (rect) {
      const lotInfo = trail.lot_id ? `\n${t('tooltip.lot')}: ${trail.lot_id}` : '';
      const content = `${t('tooltip.trailPoint')}: ${trail.id}${lotInfo}
${t('tooltip.coordinates')}: ${trail.latitude.toFixed(6)}, ${trail.longitude.toFixed(6)}
${t('tooltip.type')}: ${trail.trailType}
${t('tooltip.surface')}: ${trail.surface}
${t('tooltip.width')}: ${trail.width.toFixed(1)}m
${t('tooltip.difficulty')}: ${trail.difficulty}`;
      
      setTooltip({
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        content,
        type: 'trail'
      });
    }
  };

  return (
    <div ref={containerRef}>
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('description', { chartType: chartType === 'security' ? t('securityEventsDescription') : t('valuesDescription', { chartType: getChartTypeName(chartType) }) })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTrails(!showTrails)}
              className={`px-3 py-1 text-xs ${showTrails ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {t('trails')}
            </button>
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`px-3 py-1 text-xs ${showConnections ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {t('connections')}
            </button>
            <select
              value={samplingMode}
              onChange={(e) => setSamplingMode(e.target.value as 'auto' | 'low' | 'high')}
              className="px-2 py-1 text-xs border border-border bg-background"
              title={t('dataDensity')}
            >
              <option value="auto">{t('auto')}</option>
              <option value="high">{t('high')}</option>
              <option value="low">{t('low')}</option>
            </select>
          </div>
        </div>
        
        {/* Lot selector */}
        {networkData.lots && networkData.lots.length > 1 && (
          <div className="mt-3 p-3 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('selectLots')}:</span>
              <button
                onClick={toggleAllLots}
                className="text-xs px-2 py-1 bg-primary text-primary-foreground hover:bg-primary/80"
              >
                {selectedLots.length === networkData.lots.length ? t('deselectAll') : t('selectAll')}
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {networkData.lots.map(lot => (
                <button
                  key={lot.lot_id}
                  onClick={(e) => {
                    // Check for modifier keys (Shift or Ctrl/Cmd)
selectOnlyLot(lot.lot_id);
                  }}
onContextMenu={(e) => {
                    e.preventDefault(); // Prevent browser context menu
                    toggleLot(lot.lot_id);
                  }}
                  className={`px-2 py-1 text-xs border transition-colors ${
                    selectedLots.includes(lot.lot_id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                  style={{
                    backgroundColor: selectedLots.includes(lot.lot_id) ? getLotColor(lot.lot_id) : undefined,
                    borderColor: selectedLots.includes(lot.lot_id) ? getLotColor(lot.lot_id) : undefined
                  }}
                  title={`${t('lot')} ${lot.lot_id} - ${t('clickToToggle')} | ${t('shiftClickToSelectOnly')} | ${t('rightClickToSelectOnly')}`}
                >
                  {t('lot')} {lot.lot_id}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {t('showing')} {selectedLots.length} {t('of')} {networkData.lots.length} {t('lotsShort')} • 
              {sampledTrees.length}/{filteredTrees.length} {t('trees')} • 
              {sampledTrailPoints.length}/{filteredTrailPoints.length} {t('trailPoints')}
              {samplingRatio < 1.0 && (
                <span className="ml-2 px-1 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs">
                  {t('sampling')}: {(samplingRatio * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div ref={svgContainerRef} className="relative bg-background border border-border overflow-hidden" style={{ minHeight: '300px' }}>
        <svg width={mapWidth} height={mapHeight} className="w-full h-auto">
          {/* Grid lines for reference */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/20"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Trail connections (render first so they appear behind points) */}
          {showConnections && sampledConnections.map((connection) => {
            const fromPoint = sampledTrailPoints.find(p => p.id === connection.from_id);
            const toPoint = sampledTrailPoints.find(p => p.id === connection.to_id);
            
            if (!fromPoint || !toPoint) return null;
            
            const x1 = normalizeCoordinate(fromPoint.longitude, minLng, maxLng, mapWidth);
            const y1 = normalizeCoordinate(fromPoint.latitude, minLat, maxLat, mapHeight);
            const x2 = normalizeCoordinate(toPoint.longitude, minLng, maxLng, mapWidth);
            const y2 = normalizeCoordinate(toPoint.latitude, minLat, maxLat, mapHeight);
            
            return (
              <line
                key={connection.id}
                x1={x1}
                y1={mapHeight - y1}
                x2={x2}
                y2={mapHeight - y2}
                stroke="#8b5cf6"
                strokeWidth="1"
                strokeOpacity="0.3"
                className="transition-all duration-200 hover:stroke-opacity-60"
              >
                <title>
                  Trail Connection: {connection.distance}m
                </title>
              </line>
            );
          })}
          
          {/* Trail points */}
          {showTrails && sampledTrailPoints.map((trail) => {
            const x = normalizeCoordinate(trail.longitude, minLng, maxLng, mapWidth);
            const y = normalizeCoordinate(trail.latitude, minLat, maxLat, mapHeight);
            
            const trailColor = trail.trailType === 'main' ? '#0ea5e9' : 
                              trail.trailType === 'secondary' ? '#06b6d4' : '#14b8a6';
            
            return (
              <g key={trail.id}>
                <circle
                  cx={x}
                  cy={mapHeight - y}
                  r={2}
                  fill={trailColor}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="0.5"
                  className="transition-all duration-200 hover:r-3"
                >
                  <title>
                    Trail Point #{trail.id}
                    \nType: {trail.trailType}
                    \nSurface: {trail.surface}
                    \nWidth: {trail.width.toFixed(1)}m
                    \nDifficulty: {trail.difficulty}
                  </title>
                </circle>
              </g>
            );
          })}
          
          {/* Tree points */}
          {sampledTrees.map((tree) => {
            const x = normalizeCoordinate(tree.longitude, minLng, maxLng, mapWidth);
            const y = normalizeCoordinate(tree.latitude, minLat, maxLat, mapHeight);
            const value = getDataValue(tree);
            const color = getColorForValue(value, chartType);
            const size = getPointSize(value, chartType, mapWidth);
            
            return (
              <g key={tree.id}>
                <circle
                  cx={x}
                  cy={mapHeight - y} // Flip Y coordinate
                  r={size}
                  fill={color}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1"
                  className="transition-all duration-200 hover:stroke-2 hover:stroke-white cursor-pointer"
                  onMouseEnter={(e) => handleMouseEnter(e, tree)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Collapsible Legend */}
        <div className="absolute bottom-4 right-4">
          {/* Legend Toggle Button */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="mb-2 px-3 py-2 bg-card/95 backdrop-blur-sm border border-border text-sm font-medium hover:bg-card transition-colors flex items-center gap-2 shadow-sm justify-self-end"
            aria-label={showLegend ? t('hideLegend') : t('showLegend')}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${!showLegend ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Legend Content */}
          <div className={`bg-card/95 backdrop-blur-sm border border-border text-sm transition-all duration-300 overflow-hidden ${
            showLegend ? 'opacity-100 max-h-96 p-3' : 'opacity-0 max-h-0 p-0'
          }`}>
            {showLegend && (
              <div className="space-y-1">
                {/* Tree legend */}
                <div className="text-xs font-medium text-muted-foreground mb-1">{t('legend.trees')}</div>
                {chartType === 'security' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500"></div>
                      <span>{t('legend.securityEvent')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500"></div>
                      <span>{t('legend.noEvents')}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2" style={{ backgroundColor: getColorForValue(0, chartType) }}></div>
                      <span>{t('legend.low')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{ backgroundColor: getColorForValue(0.5, chartType) }}></div>
                      <span>{t('legend.medium')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4" style={{ backgroundColor: getColorForValue(1, chartType) }}></div>
                      <span>{t('legend.high')}</span>
                    </div>
                  </>
                )}
                
                {/* Trail legend */}
                {showTrails && (
                  <>
                    <div className="text-xs font-medium text-muted-foreground mt-2 mb-1">{t('legend.trails')}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sky-500"></div>
                      <span>{t('legend.main')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-500"></div>
                      <span>{t('legend.secondary')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-500"></div>
                      <span>{t('legend.access')}</span>
                    </div>
                  </>
                )}
                
                {/* Connection legend */}
                {showConnections && (
                  <>
                    <div className="text-xs font-medium text-muted-foreground mt-2 mb-1">{t('legend.connections')}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-violet-500 opacity-30"></div>
                      <span>{t('legend.trailLinks')}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Custom Tooltip */}
        {tooltip.visible && (
          <div 
            className="absolute pointer-events-none z-50 bg-white text-navy-900 shadow-xl border border-gray-200 p-3 text-xs max-w-xs"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: tooltip.x > mapWidth / 2 ? 'translateX(-100%)' : 'none',
              color: '#1e3a8a'
            }}
          >
            <pre className="whitespace-pre-wrap font-mono text-xs leading-tight" style={{ color: '#1e3a8a' }}>
              {tooltip.content}
            </pre>
          </div>
        )}
      </div>
      
      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div className="text-center p-3 bg-background border border-border">
          <div className="font-medium text-lg">
            {filteredTrees.length}
            {samplingRatio < 1.0 && (
              <span className="text-xs text-muted-foreground block">
                ({sampledTrees.length} {t('shown')})
              </span>
            )}
          </div>
          <div className="text-muted-foreground">{t('stats.trees')}</div>
        </div>
        <div className="text-center p-3 bg-background border border-border">
          <div className="font-medium text-lg">
            {filteredTrailPoints.length}
            {samplingRatio < 1.0 && (
              <span className="text-xs text-muted-foreground block">
                ({sampledTrailPoints.length} shown)
              </span>
            )}
          </div>
          <div className="text-muted-foreground">{t('stats.trailPoints')}</div>
        </div>
        <div className="text-center p-3 bg-background border border-border">
          <div className="font-medium text-lg">
            {filteredConnections.length}
            {samplingRatio < 1.0 && (
              <span className="text-xs text-muted-foreground block">
                ({sampledConnections.length} shown)
              </span>
            )}
          </div>
          <div className="text-muted-foreground">{t('stats.connections')}</div>
        </div>
        <div className="text-center p-3 bg-background border border-border">
          <div className="font-medium text-lg">
            {chartType === 'security' 
              ? filteredTrees.filter(tree => tree.securityEvents > 0).length
              : filteredTrees.length > 0 ? `${(filteredTrees.reduce((sum, tree) => sum + getDataValue(tree), 0) / filteredTrees.length * 100).toFixed(1)}%` : '0%'
            }
          </div>
          <div className="text-muted-foreground">
            {chartType === 'security' ? t('stats.securityEvents') : t('stats.avgValue')}
          </div>
        </div>
      </div>
    </div>
  );
}
