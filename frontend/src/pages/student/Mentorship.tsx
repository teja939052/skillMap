import { Card } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { Button } from '@/components/ui';

export default function Mentorship() {
  const mentors = [
    { name: 'Dr. Sarah Chen', expertise: 'Machine Learning', organization: 'Tech University', sessions: 5 },
    { name: 'James Rodriguez', expertise: 'Backend Architecture', company: 'CloudScale', sessions: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Mentorship</h1>
        <p className="text-gray-500 mt-1">Your mentors and guidance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mentors.map((mentor, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-4">
              <Avatar name={mentor.name} size="lg" />
              <div>
                <h3 className="font-semibold text-navy-900">{mentor.name}</h3>
                <p className="text-sm text-gray-600">{mentor.expertise}</p>
                <p className="text-xs text-gray-500 mt-1">{mentor.organization} · {mentor.sessions} sessions</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="mt-4 w-full">Schedule Session</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
