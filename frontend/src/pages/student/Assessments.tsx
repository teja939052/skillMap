import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Clock, CheckCircle } from 'lucide-react';

export default function Assessments() {
  const assessments = [
    { id: 1, title: 'Python Advanced', questions: 30, timeLimit: 60, difficulty: 'Advanced', status: 'available' },
    { id: 2, title: 'React Fundamentals', questions: 25, timeLimit: 45, difficulty: 'Foundation', status: 'available' },
    { id: 3, title: 'Database Design', questions: 20, timeLimit: 40, difficulty: 'Competent', status: 'completed', score: 85 },
    { id: 4, title: 'System Architecture', questions: 35, timeLimit: 90, difficulty: 'Advanced', status: 'available' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Assessments</h1>
        <p className="text-gray-500 mt-1">Test and verify your skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-navy-900">{a.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{a.questions} questions</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.timeLimit}min</span>
                </div>
              </div>
              <Badge variant={a.status === 'completed' ? 'success' : 'default'}>
                {a.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : null}
                {a.difficulty}
              </Badge>
            </div>
            {a.status === 'completed' ? (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-green-600 font-medium">Score: {a.score}%</span>
                <Button size="sm" variant="outline">View Results</Button>
              </div>
            ) : (
              <Button size="sm" className="mt-4">Start Assessment</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
