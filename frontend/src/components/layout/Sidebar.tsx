import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, GraduationCap, Building2, BookOpen, BarChart3,
  Telescope, Wrench, LineChart, Briefcase, Send, FolderKanban,
  Users, Brain, GitBranch, TreePine, ScrollText, Target, TrendingUp,
  UserSearch, PlusCircle, Handshake, FileCheck, LogOut, ChevronLeft,
  ChevronRight, Menu, Sparkles, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Avatar } from '@/components/ui';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, GraduationCap, Building2, BookOpen, BarChart3,
  Telescope, Wrench, LineChart, Briefcase, Send, FolderKanban,
  Users, Brain, GitBranch, TreePine, ScrollText, Target, TrendingUp,
  UserSearch, PlusCircle, Handshake, FileCheck, Shield,
};

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

function getNavItems(role: string): NavItem[] {
  const maps: Record<string, NavItem[]> = {
    student: [
      { label: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
      { label: 'Passport', path: '/student/passport', icon: 'FileCheck' },
      { label: 'Assessments', path: '/student/assessments', icon: 'GraduationCap' },
      { label: 'Gap Map', path: '/student/gap-map', icon: 'Target' },
      { label: 'Growth Plan', path: '/student/growth-plan', icon: 'TrendingUp' },
      { label: 'Opportunities', path: '/student/opportunities', icon: 'Briefcase' },
      { label: 'Applications', path: '/student/applications', icon: 'Send' },
      { label: 'Projects', path: '/student/projects', icon: 'FolderKanban' },
      { label: 'Mentorship', path: '/student/mentorship', icon: 'Users' },
    ],
    institution_admin: [
      { label: 'Dashboard', path: '/institution/dashboard', icon: 'LayoutDashboard' },
      { label: 'Students', path: '/institution/students', icon: 'GraduationCap' },
      { label: 'Departments', path: '/institution/departments', icon: 'Building2' },
      { label: 'Curriculum', path: '/institution/curriculum', icon: 'BookOpen' },
      { label: 'Industry Demand', path: '/institution/industry-demand', icon: 'BarChart3' },
      { label: 'Gap Observatory', path: '/institution/gap-observatory', icon: 'Telescope' },
      { label: 'Interventions', path: '/institution/interventions', icon: 'Wrench' },
      { label: 'Analytics', path: '/institution/analytics', icon: 'LineChart' },
    ],
    industry: [
      { label: 'Dashboard', path: '/industry/dashboard', icon: 'LayoutDashboard' },
      { label: 'Role Blueprints', path: '/industry/role-blueprints', icon: 'FileCheck' },
      { label: 'Candidates', path: '/industry/candidates', icon: 'UserSearch' },
      { label: 'Post Opportunity', path: '/industry/post-opportunity', icon: 'PlusCircle' },
      { label: 'Projects', path: '/industry/projects', icon: 'FolderKanban' },
      { label: 'Partnerships', path: '/industry/partnerships', icon: 'Handshake' },
    ],
    faculty: [
      { label: 'Dashboard', path: '/faculty/dashboard', icon: 'LayoutDashboard' },
      { label: 'Expertise', path: '/faculty/expertise', icon: 'Brain' },
      { label: 'Mentorship', path: '/faculty/mentorship', icon: 'Users' },
      { label: 'Collaboration', path: '/faculty/collaboration', icon: 'GitBranch' },
    ],
    platform_admin: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
      { label: 'Taxonomy', path: '/admin/taxonomy', icon: 'TreePine' },
      { label: 'Users', path: '/admin/users', icon: 'Users' },
      { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'ScrollText' },
    ],
  };
  return maps[role] ?? [];
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navItems = getNavItems(user?.role ?? 'student');

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="h-5 w-5 text-navy-700" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-navy-900 text-white flex flex-col transition-all duration-250',
          collapsed ? 'w-[72px]' : 'w-64',
          'lg:relative lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('flex items-center h-16 px-4 border-b border-navy-700', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight">Skill Map</span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] ?? LayoutDashboard;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-gray-300 hover:bg-navy-800 hover:text-white',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-navy-700 p-3">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn('text-gray-300 hover:text-white hover:bg-navy-800', collapsed ? 'w-full justify-center' : 'flex-1')}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Logout</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-gray-300 hover:text-white hover:bg-navy-800 !px-2"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
