import { useState } from 'react';
import { Card } from '@/components/ui';
import { Plus, Target, CheckCircle2, AlertTriangle, ArrowRight, Edit3 } from 'lucide-react';

interface RoleRequirement {
  competencyId: string;
  competencyName: string;
  targetLevel: number;
  importance: 'required' | 'preferred' | 'bonus';
  weight: number;
}

interface RoleBlueprint {
  id: string;
  title: string;
  roleFamily: string;
  status: 'draft' | 'published' | 'archived';
  requirements: RoleRequirement[];
  matchCount?: number;
}

export default function RoleBlueprintPage() {
  const [blueprints] = useState<RoleBlueprint[]>([
    { id: '1', title: 'Backend Engineer', roleFamily: 'Engineering', status: 'published', requirements: [
      { competencyId: '1', competencyName: 'Python', targetLevel: 80, importance: 'required', weight: 1 },
      { competencyId: '2', competencyName: 'SQL', targetLevel: 70, importance: 'required', weight: 0.8 },
      { competencyId: '3', competencyName: 'REST APIs', targetLevel: 70, importance: 'required', weight: 0.8 },
      { competencyId: '4', competencyName: 'Docker', targetLevel: 50, importance: 'preferred', weight: 0.5 },
      { competencyId: '5', competencyName: 'AWS', targetLevel: 60, importance: 'preferred', weight: 0.5 },
    ], matchCount: 24 },
    { id: '2', title: 'Data Scientist', roleFamily: 'Data', status: 'draft', requirements: [
      { competencyId: '1', competencyName: 'Python', targetLevel: 85, importance: 'required', weight: 1 },
      { competencyId: '6', competencyName: 'Machine Learning', targetLevel: 80, importance: 'required', weight: 1 },
      { competencyId: '7', competencyName: 'Statistics', targetLevel: 75, importance: 'required', weight: 0.8 },
    ] },
  ]);

  const importanceColor = (i: string) => i === 'required' ? 'bg-red-100 text-red-700' : i === 'preferred' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Role Blueprints</h1>
          <p className="text-gray-500 mt-1">Define competency requirements for roles</p>
        </div>
        <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-dark flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Blueprint
        </button>
      </div>

      <div className="space-y-4">
        {blueprints.map((bp) => (
          <Card key={bp.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-navy-900 text-lg">{bp.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    bp.status === 'published' ? 'bg-green-100 text-green-700' : bp.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>{bp.status}</span>
                </div>
                <p className="text-sm text-gray-500">{bp.roleFamily} · {bp.requirements.length} requirements</p>
              </div>
              <div className="flex items-center gap-2">
                {bp.matchCount && (
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <Target className="w-4 h-4" /> {bp.matchCount} matches
                  </span>
                )}
                <button className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {bp.requirements.map((req) => (
                <div key={req.competencyId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {req.importance === 'required' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <span className="text-sm font-medium text-navy-900 w-32">{req.competencyName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${importanceColor(req.importance)}`}>{req.importance}</span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Level {req.targetLevel}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: `${req.targetLevel}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button className="text-sm text-accent font-medium flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add Requirement
              </button>
              <button className="text-sm text-gray-500 font-medium flex items-center gap-1 hover:underline">
                Preview Matches <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
