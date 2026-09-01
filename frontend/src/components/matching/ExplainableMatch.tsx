import { Card } from '@/components/ui';
import { CheckCircle2, XCircle, AlertTriangle, Award, Shield } from 'lucide-react';

interface MatchExplanation {
  score: number;
  competencyScores: Array<{
    competencyId: string;
    competencyName: string;
    requiredLevel: number;
    actualLevel: number;
    contribution: number;
    gap: number;
  }>;
  strengths: string[];
  gaps: string[];
  eligibilityPassed: boolean;
  algorithmVersion: string;
  calculatedAt: string;
}

interface ExplainableMatchProps {
  candidateName: string;
  match: MatchExplanation & { previousScore?: number; improvementSource?: string };
  delta?: { previousScore: number; currentScore: number; source?: string };
  onShortlist?: () => void;
  onViewPassport?: () => void;
}

export function ExplainableMatch({ candidateName, match, delta, onShortlist, onViewPassport }: ExplainableMatchProps) {
  const scoreColor = match.score >= 80 ? 'text-green-600' : match.score >= 60 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = match.score >= 80 ? 'bg-green-50' : match.score >= 60 ? 'bg-amber-50' : 'bg-red-50';
  const showDelta = delta || (match as any).previousScore !== undefined;
  const prev = delta?.previousScore ?? (match as any).previousScore;
  const imp = prev !== undefined ? match.score - prev : undefined;
  const source = delta?.source || (match as any).improvementSource || 'AWS Bootcamp #18';

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-navy-900 text-lg">{candidateName}</h3>
          <p className="text-sm text-gray-500">Algorithm: {match.algorithmVersion} • {match.calculatedAt ? new Date(match.calculatedAt).toLocaleTimeString() : ''}</p>
          {showDelta && imp !== undefined && (
            <div className={`mt-1 text-sm font-medium ${imp > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
              {imp > 0 ? `+${imp} from ${prev}%` : `${prev}%` } {source ? `• Improved since: ${source}` : ''}
            </div>
          )}
        </div>
        <div className={`${scoreBg} px-4 py-2 rounded-lg text-center`}>
          <div className={`text-3xl font-bold ${scoreColor}`}>{match.score}%</div>
          <div className="text-xs text-gray-500">MATCH {showDelta && imp !== undefined && imp > 0 ? `(+${imp})` : ''}</div>
        </div>
      </div>

      {/* Competency Breakdown */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-700">Competency Breakdown</h4>
        {match.competencyScores.map((cs) => {
          const isMet = cs.gap <= 0;
          const isClose = cs.gap > 0 && cs.gap <= 15;
          return (
            <div key={cs.competencyId} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {isMet ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isClose ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-navy-900">{cs.competencyName}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={isMet ? 'text-green-600' : 'text-red-600'}>{cs.actualLevel}</span>
                    <span className="text-gray-400">/ {cs.requiredLevel}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 relative">
                  <div className="bg-navy-900 h-2 rounded-full" style={{ width: `${Math.min(100, (cs.actualLevel / 100) * 100)}%` }} />
                  <div className="absolute top-0 right-0 bg-accent h-2 rounded-full opacity-30" style={{ width: `${Math.min(100, (cs.requiredLevel / 100) * 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Strengths</span>
          </div>
          <p className="text-sm text-green-600">{match.strengths.length} competencies met</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Gaps</span>
          </div>
          <p className="text-sm text-red-600">{match.gaps.length} competencies missing</p>
        </div>
      </div>

      {/* Evidence Confidence */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
        <Shield className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-700">Evidence confidence: HIGH — based on verified assessments and projects</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {onViewPassport && (
          <button onClick={onViewPassport} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50">
            View Passport
          </button>
        )}
        {onShortlist && (
          <button onClick={onShortlist} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark flex items-center justify-center gap-2">
            <Award className="w-4 h-4" /> Shortlist
          </button>
        )}
      </div>
    </Card>
  );
}

export function MatchRoom({ matches }: { matches: Array<{ candidateName: string; match: MatchExplanation }> }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy-900">Opportunity Match Room</h2>
        <span className="text-sm text-gray-500">{matches.length} candidates discovered</span>
      </div>
      <div className="space-y-4">
        {matches.map((m, i) => (
          <ExplainableMatch key={i} candidateName={m.candidateName} match={m.match} />
        ))}
      </div>
    </div>
  );
}
