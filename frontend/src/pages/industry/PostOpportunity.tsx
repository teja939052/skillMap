import { Card } from '@/components/ui';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';

export default function PostOpportunity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Post Opportunity</h1>
        <p className="text-gray-500 mt-1">Create a new opportunity for students</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input placeholder="e.g. Backend Engineering Intern" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <div className="flex gap-2 mt-1">
              {['Internship', 'Job', 'Project', 'Training'].map((type) => (
                <Badge key={type} variant="outline" className="cursor-pointer hover:bg-gray-100">{type}</Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea className="w-full mt-1 p-3 border border-gray-200 rounded-lg min-h-[120px] text-sm" placeholder="Describe the opportunity..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <Input placeholder="e.g. Remote, Bangalore" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <Input placeholder="e.g. 3 months" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Required Competencies</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Python', 'React', 'SQL', 'Docker', 'AWS'].map((skill) => (
                <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-blue-50">+ {skill}</Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Save as Draft</Button>
            <Button>Publish</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
