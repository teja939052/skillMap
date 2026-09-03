import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import {
  Shield, CheckCircle2, XCircle, Clock, Loader2,
} from 'lucide-react';
import { evidenceApi, type TrustScoreByCompetency } from '@/api/evidence';

const TRUST_COLORS: Record<string, string> = {
  assessment: 'bg-blue-100 text-blue-700',
  project: 'bg-purple-100 text-purple-700',
  certification: 'bg-green-100 text-green-700',
  faculty_verification: 'bg-emerald-100 text-emerald-700',
  industry_verification: 'bg-indigo-100 text-indigo-700',
  experience: 'bg-gray-100 text-gray-700',
  self_declaration: 'bg-amber-100 text-amber-700',
  internship_outcome: 'bg-teal-100 text-teal-700',
  mentor_attestation: 'bg-cyan-100 text-cyan-700',
  github: 'bg-slate-100 text-slate-700',
  research: 'bg-pink-100 text-pink-700',
  workshop: 'bg-orange-100 text-orange-700',
  industry_project: 'bg-violet-100 text-violet-700',
  faculty_mentoring: 'bg-lime-100 text-lime-700',
  hackathon: 'bg-yellow-100 text-yellow-700',
  peer_endorsement: 'bg-stone-100 text-stone-700',
};

function formatTrust(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export default function EvidenceWallet() {
  const user = useAuthStore((s) => s.user);
  const [trust, setTrust] = useState<TrustScoreByCompetency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    evidenceApi.getTrustScores()
      .then((res) => setTrust(res.data || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load evidence wallet'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        <p>{error}</p>
      </div>
    );
  }

  const avgConfidence = trust.length > 0 ? Math.round(trust.reduce((s, t) => s + t.confidence, 0) / trust.length * 100) : 0;
  const totalEvidence = trust.reduce((s, t) => s + t.evidenceCount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Evidence Wallet</h1>
        <p className="text-gray-500 mt-1">Your verifiable skill portfolio — trust score computed from source quality, verification, and recency.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-sm text-gray-500">Skills with Evidence</div>
          <div className="text-3xl font-bold text-navy-900 mt-1">{trust.length}</div>
          <div className="text-xs text-gray-500 mt-1">{totalEvidence} total items</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500">Avg Trust Score</div>
          <div className="text-3xl font-bold text-navy-900 mt-1">{avgConfidence}%</div>
          <div className="text-xs text-gray-500 mt-1">Weighted by source & verification</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500">Verification Status</div>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Verified evidence carries highest weight</span>
          </div>
        </Card>
      </div>

      {trust.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No evidence yet</p>
          <p className="text-sm text-gray-500 mt-1">Complete an assessment or upload a project to start building your skill passport.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {trust.map((skill) => (
            <Card key={skill.competencyId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-navy-900 text-lg">{skill.competencyId}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">{skill.evidenceCount} item{skill.evidenceCount !== 1 ? 's' : ''}</span>
                    <span className="text-xs text-gray-400">Top source: {skill.topSource || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-navy-900">{formatTrust(skill.confidence)}</div>
                  <div className="text-xs text-gray-500">trust score</div>
                </div>
              </div>
              <ProgressBar value={skill.confidence * 100} className="h-2 mb-4" />
              <div className="space-y-2">
                {skill.items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${TRUST_COLORS[item.type] || 'bg-gray-100 text-gray-700'}`}>
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-navy-900">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">Lvl {item.proficiencyLevel}</span>
                      <span className="text-xs font-medium text-accent">Trust {formatTrust(item.trustScore)}</span>
                      {item.verificationStatus === 'verified' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : item.verificationStatus === 'pending' ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
