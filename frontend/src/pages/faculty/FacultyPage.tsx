import { useState } from 'react';
import { Card } from '@/components/ui';
import { Search, BookOpen, Users, Plus, ChevronRight } from 'lucide-react';

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  expertise: Array<{ name: string; level: number }>;
  availability: 'available' | 'limited' | 'unavailable';
  researchCount: number;
  mentorshipCount: number;
}

export default function FacultyPage() {
  const [activeTab, setActiveTab] = useState<'directory' | 'research' | 'fdp'>('directory');

  const faculty: FacultyMember[] = [
    { id: '1', name: 'Dr. Sarah Chen', title: 'Professor', department: 'Computer Science', expertise: [{ name: 'Machine Learning', level: 95 }, { name: 'NLP', level: 88 }], availability: 'available', researchCount: 12, mentorshipCount: 8 },
    { id: '2', name: 'Dr. Rajesh Kumar', title: 'Associate Professor', department: 'Data Science', expertise: [{ name: 'Data Engineering', level: 90 }, { name: 'Cloud Computing', level: 82 }], availability: 'limited', researchCount: 8, mentorshipCount: 5 },
    { id: '3', name: 'Dr. Priya Sharma', title: 'Assistant Professor', department: 'Software Engineering', expertise: [{ name: 'Distributed Systems', level: 85 }, { name: 'DevOps', level: 78 }], availability: 'available', researchCount: 5, mentorshipCount: 3 },
  ];

  const availabilityColor = (a: string) => a === 'available' ? 'bg-green-100 text-green-700' : a === 'limited' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Faculty — Connect expertise to opportunity</h1>
          <p className="text-gray-500 mt-1">Same Skill Map data, different job: mentorship • FDP • industry projects • consultancy</p>
        </div>
        <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-dark flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Faculty
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['directory', 'research', 'fdp'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-900'
            }`}
          >
            {tab === 'directory' ? 'Directory' : tab === 'research' ? 'Research' : 'FDP'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, expertise, or department..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faculty.map((f) => (
          <Card key={f.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-navy-700">{f.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h3 className="font-medium text-navy-900">{f.name}</h3>
                  <p className="text-xs text-gray-500">{f.title} · {f.department}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${availabilityColor(f.availability)}`}>
                {f.availability}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {f.expertise.map((e) => (
                <div key={e.name} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{e.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-accent h-1.5 rounded-full" style={{ width: `${e.level}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{e.level}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {f.researchCount} research</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {f.mentorshipCount} mentees</span>
              <button className="ml-auto text-accent font-medium flex items-center gap-1 hover:underline">
                View <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
