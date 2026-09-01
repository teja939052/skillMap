import { useState } from 'react';
import { Card } from '@/components/ui';
import { BookOpen, Clock, CheckCircle2, Award, ArrowRight, Play, BarChart3 } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  description: string;
  competencyCount: number;
  questionCount: number;
  timeLimit?: number;
  difficulty: string;
  status: 'available' | 'completed' | 'in_progress';
  bestScore?: number;
  attempts?: number;
}

export default function AssessmentPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');

  const assessments: Assessment[] = [
    { id: '1', title: 'Python Advanced', description: 'Advanced Python concepts including decorators, generators, and async programming', competencyCount: 3, questionCount: 30, timeLimit: 60, difficulty: 'Advanced', status: 'available' },
    { id: '2', title: 'Database Design Fundamentals', description: 'SQL, normalization, indexing, and query optimization', competencyCount: 2, questionCount: 25, timeLimit: 45, difficulty: 'Foundation', status: 'available' },
    { id: '3', title: 'System Architecture', description: 'Distributed systems, microservices, and scalability patterns', competencyCount: 4, questionCount: 35, timeLimit: 90, difficulty: 'Advanced', status: 'available' },
    { id: '4', title: 'React Fundamentals', description: 'Components, hooks, state management, and performance', competencyCount: 2, questionCount: 25, timeLimit: 45, difficulty: 'Foundation', status: 'completed', bestScore: 85, attempts: 2 },
    { id: '5', title: 'Docker & Containers', description: 'Containerization, Docker Compose, and orchestration basics', competencyCount: 2, questionCount: 20, timeLimit: 30, difficulty: 'Competent', status: 'completed', bestScore: 72, attempts: 1 },
  ];

  const difficultyColor = (d: string) => {
    if (d === 'Advanced') return 'bg-red-100 text-red-700';
    if (d === 'Competent') return 'bg-purple-100 text-purple-700';
    if (d === 'Foundation') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  const filtered = assessments.filter((a) => activeTab === 'available' ? a.status === 'available' : a.status === 'completed');

  // Beautiful skill interpretation for P11 — after backend assessment
  const backendProfile = {
    overall: 74, python: 4.4, sql: 4.0, rest: 3.5, git: 3.8, docker: 2.1, cloud: 1.8,
    strongest: ['Python', 'SQL'], gaps: ['Docker', 'Cloud'],
    unlocked: 3, nextUnlock: 11,
    version: { assessmentVersion: 1, questionVersion: 1, scoringVersion: 2 },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Assessments</h1>
          <p className="text-gray-500 mt-1">Test your skills and build evidence for your competency passport</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Award className="w-4 h-4" />
          Verified assessments build trust
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg"><BookOpen className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">Available</p><p className="text-lg font-bold text-navy-900">{assessments.filter(a => a.status === 'available').length}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Completed</p><p className="text-lg font-bold text-navy-900">{assessments.filter(a => a.status === 'completed').length}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
          <div><p className="text-sm text-gray-500">Avg Score</p><p className="text-lg font-bold text-navy-900">78%</p></div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['available', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-900'
            }`}
          >
            {tab === 'available' ? 'Available' : 'Completed'}
          </button>
        ))}
      </div>

      {/* Your Backend Profile — beautiful P11 result */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy-900">YOUR BACKEND PROFILE</h3>
          <span className="text-xs text-gray-500">Assessment v{backendProfile.version.assessmentVersion} • Questions v{backendProfile.version.questionVersion} • Scoring v{backendProfile.version.scoringVersion}</span>
        </div>
        <div className="grid grid-cols-7 gap-3 text-center mb-6">
          <div className="col-span-2">
            <div className="text-3xl font-bold text-navy-900">{backendProfile.overall}%</div>
            <div className="text-xs text-gray-500">Overall readiness</div>
            <div className="text-xs text-emerald-600 mt-1">Adaptive: L3→L4→L5 per skill</div>
          </div>
          {[
            { k: 'Python', v: backendProfile.python }, { k: 'SQL', v: backendProfile.sql }, { k: 'REST APIs', v: backendProfile.rest },
            { k: 'Git', v: backendProfile.git }, { k: 'Docker', v: backendProfile.docker }, { k: 'Cloud', v: backendProfile.cloud },
          ].map((c) => (
            <div key={c.k} className={`p-2 rounded-lg ${c.v >= 4 ? 'bg-emerald-50 border border-emerald-200' : c.v >= 3 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="text-xs text-gray-500">{c.k}</div>
              <div className="text-sm font-bold">{c.v} / 5</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg"><div className="font-medium text-emerald-700">Strongest: {backendProfile.strongest.join(', ')}</div><div className="text-xs text-gray-500">Evidence HIGH • verified assessment</div></div>
          <div className="bg-white p-3 rounded-lg"><div className="font-medium text-red-700">Priority gaps: {backendProfile.gaps.join(', ')}</div><div className="text-xs text-gray-500">Needs work: IAM, Deployment • Recommended → Cloud Fundamentals</div></div>
          <div className="bg-navy-900 text-white p-3 rounded-lg"><div className="font-medium">{backendProfile.unlocked} opportunities match you today</div><div className="text-xs text-gray-300">Complete Cloud Fundamentals to unlock {backendProfile.nextUnlock} more</div></div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Evidence created → Passport updated → Gaps recalculated → Opportunities re-ranked • Explainable to professor: difficulty adjusts per demonstrated performance</p>
      </Card>

      {/* Assessment List */}
      <div className="space-y-3">
        {filtered.map((a) => (
          <Card key={a.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-navy-900">{a.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor(a.difficulty)}`}>{a.difficulty}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{a.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {a.questionCount} questions</span>
                  {a.timeLimit && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.timeLimit} min</span>}
                  <span>{a.competencyCount} competencies</span>
                  {a.status === 'completed' && (
                    <>
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" /> Best: {a.bestScore}%</span>
                      <span>{a.attempts} attempt(s)</span>
                    </>
                  )}
                </div>
              </div>
              <div className="ml-4">
                {a.status === 'available' ? (
                  <button className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-dark">
                    <Play className="w-4 h-4" /> Start
                  </button>
                ) : (
                  <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50">
                    View Results <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
