import { Card } from '@/components/ui';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function IndustryDemand() {
  const demand = [
    { skill: 'Python', demand: 92, growth: 12, trend: 'up' },
    { skill: 'React', demand: 88, growth: 18, trend: 'up' },
    { skill: 'AWS', demand: 85, growth: 22, trend: 'up' },
    { skill: 'Docker', demand: 78, growth: 25, trend: 'up' },
    { skill: 'Machine Learning', demand: 75, growth: 30, trend: 'up' },
    { skill: 'Kubernetes', demand: 70, growth: 28, trend: 'up' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Industry Demand Map</h1>
        <p className="text-gray-500 mt-1">Skills currently in demand</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demand.map((item) => (
          <Card key={item.skill} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-navy-900">{item.skill}</h3>
              {item.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div className="bg-accent h-3 rounded-full" style={{ width: `${item.demand}%` }} />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.demand}%</span>
            </div>
            <p className="text-xs text-green-600 mt-2">+{item.growth}% growth</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
