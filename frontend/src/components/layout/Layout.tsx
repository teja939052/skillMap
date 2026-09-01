import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, Award, Target, TrendingUp, Briefcase, Users,
  Building2, GraduationCap, LogOut, Menu, X, Bell, Search,
  FolderKanban, BarChart3, BookOpen, User
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Passport', path: '/passport', icon: <Award className="w-5 h-5" /> },
  { label: 'Assessments', path: '/assessments', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Skill Gaps', path: '/gap-map', icon: <Target className="w-5 h-5" /> },
  { label: 'Growth Plan', path: '/growth-plan', icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Opportunities', path: '/opportunities', icon: <Briefcase className="w-5 h-5" /> },
  { path: '/projects', label: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
  { label: 'Mentorship', path: '/mentorship', icon: <Users className="w-5 h-5" /> },
];

const institutionNav: NavItem[] = [
  { label: 'Overview', path: '/institution', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Students', path: '/institution/students', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Departments', path: '/institution/departments', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Curriculum', path: '/institution/curriculum', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Industry Demand', path: '/institution/demand', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Gap Observatory', path: '/institution/gaps', icon: <Target className="w-5 h-5" /> },
  { label: 'Interventions', path: '/institution/interventions', icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Analytics', path: '/institution/analytics', icon: <BarChart3 className="w-5 h-5" /> },
];

const industryNav: NavItem[] = [
  { label: 'Overview', path: '/industry', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Role Blueprints', path: '/industry/roles', icon: <Target className="w-5 h-5" /> },
  { label: 'Candidates', path: '/industry/candidates', icon: <Users className="w-5 h-5" /> },
  { label: 'Opportunities', path: '/industry/opportunities', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Projects', path: '/industry/projects', icon: <FolderKanban className="w-5 h-5" /> },
  { label: 'Partnerships', path: '/industry/partnerships', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Analytics', path: '/industry/analytics', icon: <BarChart3 className="w-5 h-5" /> },
];

const facultyNav: NavItem[] = [
  { label: 'Dashboard', path: '/faculty', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Expertise', path: '/faculty/expertise', icon: <Award className="w-5 h-5" /> },
  { label: 'Mentorship', path: '/faculty/mentorship', icon: <Users className="w-5 h-5" /> },
  { label: 'Collaboration', path: '/faculty/collaboration', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Assessments', path: '/assessments', icon: <BookOpen className="w-5 h-5" /> },
];

export default function Layout() {
  const [collapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = user?.role === 'industry' ? industryNav :
                   user?.role === 'faculty' ? facultyNav :
                   user?.role === 'institution_admin' ? institutionNav :
                   studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} hidden md:flex flex-col bg-navy-900 text-white transition-all duration-200`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-800">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm">SM</div>
          {!collapsed && <span className="font-semibold text-lg">Skill Map</span>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-navy-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-300 hover:bg-navy-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-navy-900 text-white flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm">SM</div>
                <span className="font-semibold text-lg">Skill Map</span>
              </div>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 py-4 space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                      isActive ? 'bg-accent text-white' : 'text-gray-300 hover:bg-navy-800'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search competencies, opportunities..."
                className="pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/demo" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700">Demo Mode</Link>
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-navy-700" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-navy-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
