export const APP_NAME = 'Skill Map';
export const APP_TAGLINE = 'Academia × Industry Competency Intelligence Platform';

export const PROFICIENCY_LEVELS = [
  { level: 0, label: 'Unassessed', color: '#9CA3AF' },
  { level: 1, label: 'Aware', color: '#EF4444' },
  { level: 2, label: 'Foundation', color: '#F59E0B' },
  { level: 3, label: 'Competent', color: '#EAB308' },
  { level: 4, label: 'Advanced', color: '#10B981' },
  { level: 5, label: 'Expert', color: '#3B82F6' },
] as const;

export const NAV_ITEMS = {
  student: [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
    { label: 'Passport', path: '/student/passport', icon: 'Passport' },
    { label: 'Assessments', path: '/student/assessments', icon: 'FileCheck' },
    { label: 'Gap Map', path: '/student/gap-map', icon: 'Target' },
    { label: 'Growth Plan', path: '/student/growth-plan', icon: 'TrendingUp' },
    { label: 'Opportunities', path: '/student/opportunities', icon: 'Briefcase' },
    { label: 'Applications', path: '/student/applications', icon: 'Send' },
    { label: 'Projects', path: '/student/projects', icon: 'FolderKanban' },
    { label: 'Mentorship', path: '/student/mentorship', icon: 'Users' },
  ],
  institution: [
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
    { label: 'Role Blueprints', path: '/industry/role-blueprints', icon: 'Blueprint' },
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
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Taxonomy', path: '/admin/taxonomy', icon: 'TreePine' },
    { label: 'Users', path: '/admin/users', icon: 'Users' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'ScrollText' },
  ],
} as const;
