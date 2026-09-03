import { useQuery } from '@tanstack/react-query';
import { Card, Badge, Button } from '@/components/ui';
import { Percent, Loader2, BookOpen } from 'lucide-react';
import { matchingApi } from '@/api/matching';
import { Link } from 'react-router-dom';

interface MatchItem {
  opportunityId: string;
  title: string;
  type: string;
  score: number;
  strengths: string[];
  gaps: string[];
  explanation?: {
    competencyScores: Array<{ competencyId: string; requiredLevel: number; actualLevel: number; contribution: number; gap: number }>;
  };
}

export default function Opportunities() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['matched-opportunities'],
    queryFn: async () => {
      const res = await matchingApi.matchOpportunities();
      return res.data as { items: MatchItem[] };
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

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        <p>{error instanceof Error ? error.message : 'Failed to load opportunities'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Matched Opportunities</h1>
        <p className="text-gray-500 mt-1">Ranked by your competency fit — see exactly why you match (or don't)</p>
      </div>

      <div className="space-y-3">
        {items.map((opp) => (
          <Card key={opp.opportunityId} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy-900">{opp.title}</h3>
                  <Badge variant="outline" size="sm">{opp.type}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <Percent className="w-3 h-3" /> {opp.score}% match
                  </span>
                  {opp.strengths.length > 0 && (
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{opp.strengths.length} strengths</span>
                  )}
                  {opp.gaps.length > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">{opp.gaps.length} gaps</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-navy-900">{opp.score}%</div>
                  <span className="text-xs text-gray-500">match score</span>
                </div>
                <Link to={`/opportunities/${opp.opportunityId}`}>
                  <Button size="sm">View</Button>
                </Link>
              </div>
            </div>

            {opp.explanation?.competencyScores && opp.explanation.competencyScores.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Requirement Breakdown</div>
                <div className="space-y-1">
                  {opp.explanation.competencyScores.slice(0, 6).map((cs) => {
                    const status = cs.actualLevel >= cs.requiredLevel ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50';
                    return (
                      <div key={cs.competencyId} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{cs.competencyId}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">req {cs.requiredLevel}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">{cs.actualLevel}</span>
                          <span className={`px-1.5 py-0.5 rounded ${status}`}>
                            {cs.actualLevel >= cs.requiredLevel ? 'meets' : `gap ${cs.gap}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

