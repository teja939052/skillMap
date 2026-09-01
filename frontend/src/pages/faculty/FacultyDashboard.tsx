import { Card } from '@/components/ui';
import { Users, BookOpen, Award, Lightbulb } from 'lucide-react';

export default function FacultyDashboard() {
  const stats = [
    { label: 'Mentees', value: '12', icon: Users, color: 'bg-blue-500' },
    { label: 'Projects', value: '4', icon: BookOpen, color: 'bg-green-500' },
    { label: 'Verifications', value: '28', icon: Award, color: 'bg-purple-500' },
    { label: 'Collaborations', value: '3', icon: Lightbulb, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Faculty Dashboard</h1>
        <p className="text-gray-500 mt-1">Your mentoring and collaboration overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-navy-900 mb-4">Pending Verifications</h3>
        <div className="space-y-3">
          {[{ student: 'Alex Johnson', evidence: 'Python Certification', date: '2 hours ago' }, { student: 'Maria Garcia', evidence: 'React Project', date: '1 day ago' }].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <span className="text-sm font-medium text-gray-700">{item.student}</span>
                <span className="text-sm text-gray-500 ml-2">— {item.evidence}</span>
              </div>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
