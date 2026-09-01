import { Card } from '@/components/ui';
import { ArrowRight, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

interface InterventionOutcome {
  competencyName: string;
  beforeLevel: number;
  afterLevel: number;
  improvement: number;
  successRate: number;
  completions: number;
  totalEnrollments: number;
}

interface InterventionLoopProps {
  interventionName: string;
  outcomes: InterventionOutcome[];
  averageImprovement: number;
  overallSuccessRate: number;
}

export function InterventionLoop({ interventionName, outcomes, averageImprovement, overallSuccessRate }: InterventionLoopProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy-900">Intervention Impact: {interventionName}</h2>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          +{averageImprovement}% avg improvement
        </div>
      </div>

      {/* Outcome Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outcomes.map((outcome) => (
          <Card key={outcome.competencyName} className="p-5">
            <h4 className="text-sm font-medium text-navy-900 mb-3">{outcome.competencyName}</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Before</p>
                <p className="text-lg font-bold text-red-500">{outcome.beforeLevel}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="text-center">
                <p className="text-xs text-gray-500">After</p>
                <p className="text-lg font-bold text-green-600">{outcome.afterLevel}</p>
              </div>
              <div className="ml-auto text-center">
                <p className="text-xs text-gray-500">Gain</p>
                <p className="text-lg font-bold text-green-600">+{outcome.improvement}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${outcome.afterLevel}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{outcome.completions}/{outcome.totalEnrollments} completed</span>
              <span className="text-green-600 font-medium">{Math.round(outcome.successRate * 100)}% success</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Improvement</p>
            <p className="text-xl font-bold text-green-600">+{averageImprovement}%</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-xl font-bold text-blue-600">{Math.round(overallSuccessRate * 100)}%</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Evidence Generated</p>
            <p className="text-xl font-bold text-purple-600">{outcomes.length * 12}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
