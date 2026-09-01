import { Card } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Calendar } from 'lucide-react';

export default function Mentorship() {
  const mentees = [
    { name: 'Alex Johnson', focus: 'ML Research', sessions: 8, nextSession: 'Tomorrow' },
    { name: 'Maria Garcia', focus: 'Backend Development', sessions: 5, nextSession: 'Fri, 3pm' },
    { name: 'David Kim', focus: 'Cloud Architecture', sessions: 3, nextSession: 'Mon, 10am' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Mentorship</h1>
        <p className="text-gray-500 mt-1">Your mentees and sessions</p>
      </div>

      <div className="space-y-3">
        {mentees.map((m, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={m.name} />
                <div>
                  <h3 className="font-semibold text-navy-900">{m.name}</h3>
                  <p className="text-sm text-gray-600">{m.focus}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{m.sessions} sessions</span>
                    <Badge variant="outline" size="sm" className="flex items-center gap-1"><Calendar className="w-3 h-3" />{m.nextSession}</Badge>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline">Schedule</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
