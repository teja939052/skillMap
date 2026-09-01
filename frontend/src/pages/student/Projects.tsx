import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { ExternalLink } from 'lucide-react';

export default function Projects() {
  const projects = [
    { title: 'E-commerce API', tech: 'Node.js, MongoDB', status: 'completed', description: 'RESTful API with auth, payments, and inventory' },
    { title: 'Task Management App', tech: 'React, Firebase', status: 'in_progress', description: 'Real-time collaborative task manager' },
    { title: 'ML Sentiment Analyzer', tech: 'Python, TensorFlow', status: 'completed', description: 'NLP model for social media sentiment' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Projects</h1>
          <p className="text-gray-500 mt-1">Your project portfolio</p>
        </div>
        <Button size="sm">Add Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-navy-900">{proj.title}</h3>
              <Badge variant={proj.status === 'completed' ? 'success' : 'default'}>
                {proj.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{proj.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{proj.tech}</span>
              <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
