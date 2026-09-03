import { useQuery } from '@tanstack/react-query';
import { Card, Badge } from '@/components/ui';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { analyticsApi } from '@/api/analytics';

interface DemandRadarItem {
  competencyId: string;
  competencyName: string;
  demand: number;
  uniqueEmployers: number;
  avgRequiredLevel: number;
  studentsReady: number;
  gap: string;
  growth: number;
}

export default function IndustryDemand() {
  const { data, isLoading } = useQuery({
    queryKey: ['demand-radar'],
    queryFn: async () => {
      const res = await analyticsApi.getDemandRadar();
      return res.data as { items: DemandRadarItem[] };
    },
  });

  const items = data?.items || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Industry Demand Radar</h1>
          <p className="text-gray-500 mt-1">Skill demand index computed from live opportunities + role blueprints</p>
        </div>
        <Badge className="bg-blue-50 text-blue-700 border-blue-200">{items.length} skills tracked</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.competencyId} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-navy-900">{item.competencyName}</h3>
              {item.growth > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Demand</span>
                <span className="font-medium">{item.demand} opportunities</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Employers</span>
                <span className="font-medium">{item.uniqueEmployers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Students Ready</span>
                <span className="font-medium">{item.studentsReady}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Required Level</span>
                <span className="font-medium">{item.avgRequiredLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gap</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  item.gap === 'Critical' ? 'bg-red-100 text-red-700' :
                  item.gap === 'High' ? 'bg-amber-100 text-amber-700' :
                  item.gap === 'Medium' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>{item.gap}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
