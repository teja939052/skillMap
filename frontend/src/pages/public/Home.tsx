import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Target, BarChart3, Users, Award, TrendingUp,
  Building2, GraduationCap, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Radar, GitBranch, Shield, Zap
} from 'lucide-react';
import { Button } from '@/components/ui';
import Card, { CardContent } from '@/components/ui/Card';

function InspectorSection({ icon: Icon, title, color, children, defaultOpen = false }: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-accent/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="font-semibold text-navy-900 text-lg">{title}</span>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-100">
          <div className="text-gray-600 leading-relaxed">{children}</div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-navy-900">Skill Map</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-navy-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-navy-900 transition-colors">How It Works</a>
            <a href="#roles" className="text-sm text-gray-600 hover:text-navy-900 transition-colors">For Everyone</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-navy-900/5" />
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            Students × Colleges × Companies — Connected
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-navy-900 leading-tight mb-6 tracking-tight">
            Stop guessing.
            <br />
            <span className="text-accent">Start matching.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Skill Map connects students, colleges, and companies in one place.
            Students find the right skills and opportunities. Companies find the right candidates.
            Colleges see exactly what to teach next.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">Sign In</Button>
            </Link>
          </div>

          {/* Hero Visual — Competency Flow Diagram */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {[
                  { icon: GraduationCap, label: 'Student', sub: 'Builds evidence', color: 'bg-blue-500' },
                  { icon: Radar, label: 'Competency Map', sub: 'Verified skills', color: 'bg-accent' },
                  { icon: Target, label: 'Gap Analysis', sub: 'Identifies gaps', color: 'bg-orange-500' },
                  { icon: Building2, label: 'Industry Match', sub: 'Opportunities', color: 'bg-green-500' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                        <item.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-navy-900 text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.sub}</div>
                    </div>
                    {i < 3 && (
                      <ArrowRight className="h-6 w-6 text-gray-300 hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Roles */}
      <section id="roles" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-3">One Platform, Four Users</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Students, colleges, companies, and faculty — each with their own workspace.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: GraduationCap, title: 'Students', desc: 'Build your competency passport, identify skill gaps, discover matched opportunities.', color: 'bg-blue-500' },
              { icon: Building2, title: 'Institutions', desc: 'Align curriculum with real-time industry demand. Track cohort outcomes at scale.', color: 'bg-purple-500' },
              { icon: Users, title: 'Industry', desc: 'Define role blueprints. Discover candidates with verified, evidence-backed profiles.', color: 'bg-green-500' },
              { icon: Award, title: 'Faculty', desc: 'Guide students, verify evidence, collaborate with industry on curriculum design.', color: 'bg-orange-500' },
            ].map((role) => (
              <Card key={role.title} hover className="group">
                <CardContent className="py-6">
                  <div className={`h-14 w-14 rounded-xl ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <role.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-lg mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{role.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Insider Sections */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-3">How Skill Map Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Click each section to see how students, colleges, and companies connect.</p>
          </div>
          <div className="space-y-4">
            <InspectorSection icon={Radar} title="Your Skill Profile" color="bg-blue-500" defaultOpen>
              <p className="mb-3">Every student gets a personal skill profile that grows with every test, project, and certificate you add.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Upload proof: assessments, projects, certifications, internships</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Faculty verifies your submissions</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Your skill levels update automatically as you improve</span></li>
              </ul>
            </InspectorSection>

            <InspectorSection icon={Target} title="Skill Gap Analysis" color="bg-orange-500">
              <p className="mb-3">See exactly what skills you have — and what skills companies are looking for.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Visual charts show your skills vs. what companies need</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Color-coded: skills you have, skills to learn, skills missing</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>See how you compare to other students</span></li>
              </ul>
            </InspectorSection>

            <InspectorSection icon={GitBranch} title="Your Learning Path" color="bg-purple-500">
              <p className="mb-3">Shows you exactly what to learn next to reach your goal — step by step.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Personalized suggestions based on the role you want</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Tracks courses, workshops, and projects you complete</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Shows if training actually improved your skills</span></li>
              </ul>
            </InspectorSection>

            <InspectorSection icon={Zap} title="Opportunity Matching" color="bg-accent">
              <p className="mb-3">Companies post internships and jobs. Skill Map shows you exactly why you match — or don't.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>See your match score and which skills matched</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Opportunities ranked by how well you fit</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Companies see your verified skills, not just a resume</span></li>
              </ul>
            </InspectorSection>

            <InspectorSection icon={Shield} title="Verified Skills" color="bg-green-500">
              <p className="mb-3">Your skills are backed by real proof — tests, projects, certificates, and faculty verification.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Faculty verify your submitted work</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Every certificate has a QR code for instant verification</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Companies trust what they see — it's all verified</span></li>
              </ul>
            </InspectorSection>

            <InspectorSection icon={BarChart3} title="College Dashboard" color="bg-navy-700">
              <p className="mb-3">Colleges see exactly what skills their students have — and what the job market needs.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Live view of skill levels across all students</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Alerts when student skills don't match what companies want</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> <span>Track whether training actually improved outcomes</span></li>
              </ul>
            </InspectorSection>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-3">Skill Map vs Traditional</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">See why competency-first beats resume-first.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-3 bg-navy-900 text-white">
              <div className="p-5 font-semibold text-sm">What you get</div>
              <div className="p-5 font-semibold text-sm text-center">Normal placement portal</div>
              <div className="p-5 font-semibold text-sm text-center bg-accent">Skill Map</div>
            </div>
            {[
              ['Skills', 'Self-reported on resume', 'Verified by tests + faculty'],
              ['Finding candidates', 'Resume keyword search', 'Skill match with exact % score'],
              ['Skill gaps', 'Student guesses', 'Shown clearly — what to learn next'],
              ['Training', 'No connection to jobs', 'College sees demand, runs training, tracks results'],
              ['Progress', 'Just CGPA', 'Real skill improvement, measured'],
              ['Matching', 'Apply and wait', 'See exactly why you matched'],
              ['Outcome', 'Placement numbers only', 'Skills improved + placed'],
            ].map(([criteria, traditional, skillmap], i) => (
              <div key={criteria} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="p-4 font-medium text-navy-900 text-sm">{criteria}</div>
                <div className="p-4 text-center flex items-center justify-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                  <span className="text-sm text-gray-500">{traditional}</span>
                </div>
                <div className="p-4 text-center flex items-center justify-center gap-2 bg-accent/5">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm text-navy-900 font-medium">{skillmap}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-3">Everything You Need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">One platform. Students, colleges, companies, and faculty — all connected.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Skill Profile', desc: 'Your personal skill page — tests, projects, certificates, all in one place.', color: 'bg-blue-500' },
              { icon: BarChart3, title: 'Skill Gap Finder', desc: 'See exactly which skills you have and which ones companies want.', color: 'bg-orange-500' },
              { icon: TrendingUp, title: 'Learning Path', desc: 'Tells you exactly what to learn next to reach your goal.', color: 'bg-purple-500' },
              { icon: Users, title: 'Opportunity Match', desc: 'Get matched with internships and jobs that fit your skills.', color: 'bg-green-500' },
              { icon: Award, title: 'Verified Skills', desc: 'Faculty-verified skills and QR-code certificates companies trust.', color: 'bg-teal-500' },
              { icon: Building2, title: 'College Dashboard', desc: 'Colleges see skill gaps across all students and what the market needs.', color: 'bg-navy-700' },
            ].map((feature) => (
              <Card key={feature.title} hover className="group">
                <CardContent className="py-6">
                  <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-navy-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to connect skills with opportunity?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Students find the right skills and internships. Colleges see what to teach. Companies find the right candidates.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-gray-600 text-white hover:bg-white/10">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-navy-900">Skill Map</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-xs text-gray-500 hover:text-accent transition-colors">Terms</Link>
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-accent transition-colors">Privacy</Link>
          </div>
          <p className="text-xs text-gray-500">SIH 2026 — Academia × Industry Competency Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}
