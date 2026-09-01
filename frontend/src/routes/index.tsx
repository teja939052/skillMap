import type { RouteObject } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';

// Public pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard';
import Passport from '../pages/student/Passport';
import AssessmentPage from '../pages/student/AssessmentPage';
import GapMapPage from '../pages/student/GapMapPage';
import GrowthPlan from '../pages/student/GrowthPlan';
import StudentOpportunities from '../pages/student/Opportunities';
import Applications from '../pages/student/Applications';
import StudentProjects from '../pages/student/Projects';
import StudentMentorship from '../pages/student/Mentorship';

// Institution pages
import InstitutionDashboard from '../pages/institution/InstitutionDashboard';
import Students from '../pages/institution/Students';
import Departments from '../pages/institution/Departments';
import Curriculum from '../pages/institution/Curriculum';
import IndustryDemand from '../pages/institution/IndustryDemand';
import GapObservatory from '../pages/institution/GapObservatory';
import InstitutionInterventions from '../pages/institution/Interventions';
import InstitutionAnalytics from '../pages/institution/Analytics';
import StudentImportCenter from '../pages/institution/StudentImportCenter';

// Industry pages
import IndustryDashboard from '../pages/industry/IndustryDashboard';
import RoleBlueprintPage from '../pages/industry/RoleBlueprintPage';
import Candidates from '../pages/industry/Candidates';
import PostOpportunity from '../pages/industry/PostOpportunity';
import IndustryProjects from '../pages/industry/Projects';
import Partnerships from '../pages/industry/Partnerships';

// Faculty pages
import FacultyPage from '../pages/faculty/FacultyPage';
import Expertise from '../pages/faculty/Expertise';
import FacultyMentorship from '../pages/faculty/Mentorship';
import Collaboration from '../pages/faculty/Collaboration';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Taxonomy from '../pages/admin/Taxonomy';
import Users from '../pages/admin/Users';
import AuditLogs from '../pages/admin/AuditLogs';
import Demo from '../pages/Demo';

export const routes: RouteObject[] = [
  {
    path: '/',
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'demo', element: <Demo /> },
    ],
  },
  {
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      // Student
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'passport', element: <Passport /> },
      { path: 'assessments', element: <AssessmentPage /> },
      { path: 'gap-map', element: <GapMapPage /> },
      { path: 'growth-plan', element: <GrowthPlan /> },
      { path: 'opportunities', element: <StudentOpportunities /> },
      { path: 'applications', element: <Applications /> },
      { path: 'projects', element: <StudentProjects /> },
      { path: 'mentorship', element: <StudentMentorship /> },
      // Institution
      { path: 'institution', element: <InstitutionDashboard /> },
      { path: 'institution/students', element: <Students /> },
      { path: 'institution/import', element: <StudentImportCenter /> },
      { path: 'institution/departments', element: <Departments /> },
      { path: 'institution/curriculum', element: <Curriculum /> },
      { path: 'institution/demand', element: <IndustryDemand /> },
      { path: 'institution/gaps', element: <GapObservatory /> },
      { path: 'institution/interventions', element: <InstitutionInterventions /> },
      { path: 'institution/analytics', element: <InstitutionAnalytics /> },
      // Industry
      { path: 'industry', element: <IndustryDashboard /> },
      { path: 'industry/roles', element: <RoleBlueprintPage /> },
      { path: 'industry/candidates', element: <Candidates /> },
      { path: 'industry/post', element: <PostOpportunity /> },
      { path: 'industry/projects', element: <IndustryProjects /> },
      { path: 'industry/partnerships', element: <Partnerships /> },
      // Faculty
      { path: 'faculty', element: <FacultyPage /> },
      { path: 'faculty/expertise', element: <Expertise /> },
      { path: 'faculty/mentorship', element: <FacultyMentorship /> },
      { path: 'faculty/collaboration', element: <Collaboration /> },
      // Admin
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/taxonomy', element: <Taxonomy /> },
      { path: 'admin/users', element: <Users /> },
      { path: 'admin/audit', element: <AuditLogs /> },
    ],
  },
];
