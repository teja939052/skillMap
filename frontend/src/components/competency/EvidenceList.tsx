import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { formatRelativeTime } from '@/utils/format';
import { CheckCircle, Clock, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import type { EvidenceResponse } from '@/types';

interface EvidenceListProps {
  evidence: EvidenceResponse[];
  showOwner?: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'verified': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
    case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'expired': return <AlertCircle className="h-4 w-4 text-gray-400" />;
    default: return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'verified': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'danger';
    case 'expired': return 'default';
    default: return 'default';
  }
}

export default function EvidenceList({ evidence, showOwner: _showOwner = false }: EvidenceListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence Records</CardTitle>
      </CardHeader>
      <CardContent>
        {evidence.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No evidence submitted yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {getStatusIcon(item.verificationStatus)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-navy-900 text-sm truncate">{item.title}</h4>
                    <Badge variant={getStatusVariant(item.verificationStatus)} size="sm">
                      {item.verificationStatus}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="capitalize">{item.type.replace('_', ' ')}</span>
                    <span>Level {item.proficiencyLevel}</span>
                    {item.score && <span>Score: {item.score}%</span>}
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </div>
                </div>
                {item.artifactUrl && (
                  <a
                    href={item.artifactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
