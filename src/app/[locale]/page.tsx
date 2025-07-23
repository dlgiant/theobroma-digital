import { getTranslations } from 'next-intl/server';
import { promises as fs } from 'fs';
import path from 'path';

interface TreeData {
  id: string;
  type: 'tree';
  lot_id?: number;
  maturityIndex: number;
  securityEvents: number;
  fungalThreat: number;
  canopyGrading: number;
  treeAge: number;
  treeDensity: number;
}

interface NetworkData {
  metadata: {
    total_lots?: number;
    total_trees: number;
    total_trail_points: number;
    total_connections: number;
    total_area?: string;
  };
  trees: TreeData[];
  trail_points: any[];
  connections: any[];
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  let data: NetworkData | null = null;
  
  try {
    const filePath = path.join(process.cwd(), 'public', 'tree_coordinates_with_trails.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    data = JSON.parse(jsonData);
  } catch (error) {
    console.error('Failed to load plantation data:', error);
  }

  if (!data) {
    return (
      <div className="p-8 min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('subtitle')}
          </p>
          <div className="bg-destructive/10 border border-destructive/20 p-6">
            <p className="text-destructive">{t('dataError')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate insights
  const totalTrees = data.metadata.total_trees;
  const totalLots = data.metadata.total_lots || 0;
  const totalTrailPoints = data.metadata.total_trail_points;
  const totalConnections = data.metadata.total_connections;
  
  const avgMaturityIndex = ((data.trees.reduce((sum, tree) => sum + tree.maturityIndex, 0) / totalTrees) * 100).toFixed(1);
  const totalSecurityEvents = data.trees.filter(tree => tree.securityEvents > 0).length;
  const avgFungalThreat = ((data.trees.reduce((sum, tree) => sum + tree.fungalThreat, 0) / totalTrees) * 100).toFixed(1);
  const avgCanopyGrading = ((data.trees.reduce((sum, tree) => sum + tree.canopyGrading, 0) / totalTrees) * 100).toFixed(1);
  const avgTreeAge = (data.trees.reduce((sum, tree) => sum + tree.treeAge, 0) / totalTrees).toFixed(1);
  const avgTreeDensity = ((data.trees.reduce((sum, tree) => sum + tree.treeDensity, 0) / totalTrees) * 100).toFixed(1);

  const securityEventRate = ((totalSecurityEvents / totalTrees) * 100).toFixed(1);
  const healthyTreesCount = totalTrees - totalSecurityEvents;

  return (
    <div className="p-8 min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          {t('title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {t('subtitle')}
        </p>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('insights.totalLots')}</p>
                <p className="text-2xl font-bold text-card-foreground">{totalLots}</p>
              </div>
              <div className="text-3xl">🏞️</div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('insights.totalTrees')}</p>
                <p className="text-2xl font-bold text-card-foreground">{totalTrees.toLocaleString()}</p>
              </div>
              <div className="text-3xl">🌳</div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('insights.totalArea')}</p>
                <p className="text-2xl font-bold text-card-foreground">{data.metadata.total_area || `${totalLots} ha`}</p>
              </div>
              <div className="text-3xl">📏</div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('insights.trailNetwork')}</p>
                <p className="text-2xl font-bold text-card-foreground">{totalTrailPoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{totalConnections.toLocaleString()} {t('insights.connections')}</p>
              </div>
              <div className="text-3xl">🛤️</div>
            </div>
          </div>
        </div>

        {/* Health & Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t('insights.treeHealth')}</h3>
              <div className="text-2xl">❤️</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('insights.healthyTrees')}</span>
                <span className="font-medium text-green-600">{healthyTreesCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('insights.securityEvents')}</span>
                <span className="font-medium text-red-600">{totalSecurityEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('insights.eventRate')}</span>
                <span className="font-medium">{securityEventRate}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t('insights.maturityMetrics')}</h3>
              <div className="text-2xl">🍫</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('insights.avgMaturity')}</span>
                <span className="font-medium">{avgMaturityIndex}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('insights.avgTreeAge')}</span>
                <span className="font-medium">{avgTreeAge} {t('insights.years')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('insights.avgDensity')}</span>
                <span className="font-medium">{avgTreeDensity}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t('insights.environmentalHealth')}</h3>
              <div className="text-2xl">🌿</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('insights.avgCanopyGrade')}</span>
                <span className="font-medium">{avgCanopyGrading}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('insights.avgFungalThreat')}</span>
                <span className="font-medium text-orange-600">{avgFungalThreat}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-card border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">{t('insights.actionItems')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {totalSecurityEvents > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20">
                <div className="text-red-500 text-xl">⚠️</div>
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">{t('insights.securityAlert')}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {totalSecurityEvents} {t('insights.treesNeedAttention')}
                  </p>
                </div>
              </div>
            )}
            
            {parseFloat(avgFungalThreat) > 50 && (
              <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20">
                <div className="text-orange-500 text-xl">🍄</div>
                <div>
                  <p className="font-medium text-orange-700 dark:text-orange-300">{t('insights.fungalWarning')}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    {t('insights.avgThreatLevel')}: {avgFungalThreat}%
                  </p>
                </div>
              </div>
            )}
            
            {parseFloat(avgMaturityIndex) > 70 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20">
                <div className="text-green-500 text-xl">✅</div>
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">{t('insights.harvestReady')}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('insights.maturityRate')}: {avgMaturityIndex}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
