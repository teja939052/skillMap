import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import { Button } from '@/components/ui';
import { proficiencyLabel, proficiencyColor } from '@/utils/format';
import { Award, TrendingUp, FileCheck, Target } from 'lucide-react';

interface PassportEntry {
  competencyId: string;
  name: string;
  type: string;
  domain: string;
  level: number;
  verifiedCount: number;
  totalEvidence: number;
}

interface CompetencyPassportProps {
  entries: PassportEntry[];
  overallScore?: number;
}

export default function CompetencyPassport({ entries, overallScore: _overallScore = 0 }: CompetencyPassportProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredEntries = activeTab === 'all'
    ? entries
    : entries.filter((e) => {
        if (activeTab === 'verified') return e.verifiedCount > 0;
        if (activeTab === 'developing') return e.level > 0 && e.level < 3;
        if (activeTab === 'mastered') return e.level >= 3;
        return true;
      });

  const masteredCount = entries.filter((e) => e.level >= 3).length;
  const developingCount = entries.filter((e) => e.level > 0 && e.level < 3).length;
  const unassessedCount = entries.filter((e) => e.level === 0).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center py-5">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Award className="h-5 w-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-navy-900">{entries.length}</p>
            <p className="text-xs text-gray-500">Total Competencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-5">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">{masteredCount}</p>
            <p className="text-xs text-gray-500">Mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-5">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
              <FileCheck className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">{developingCount}</p>
            <p className="text-xs text-gray-500">Developing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-5">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <Target className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-navy-900">{unassessedCount}</p>
            <p className="text-xs text-gray-500">Unassessed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Competency Passport</CardTitle>
            <Button variant="outline" size="sm">Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({entries.length})</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="mastered">Mastered</TabsTrigger>
              <TabsTrigger value="developing">Developing</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="space-y-3 mt-2">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No competencies in this category</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <div
                      key={entry.competencyId}
                      className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-navy-900 text-sm">{entry.name}</h4>
                          <Badge variant="outline" size="sm">{entry.type}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <ProgressBar value={entry.level} max={5} size="sm" className="w-32" />
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${proficiencyColor(entry.level)}`}>
                            {proficiencyLabel(entry.level)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">{entry.verifiedCount}/{entry.totalEvidence} verified</p>
                        <p className="text-xs font-medium text-navy-700">Lv. {entry.level}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
