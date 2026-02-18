import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";
import { CookieConsent } from "@/components/CookieConsent";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { A11yChecker } from "@/components/accessibility/A11yChecker";
import { initializeErrorTracking } from "@/lib/sentry";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import StudentOpportunities from "./pages/student/Opportunities";
import StudentOpportunityDetails from "./pages/student/OpportunityDetails";
import StudentApplications from "./pages/student/Applications";
import StudentPortfolio from "./pages/student/Portfolio";
import StudentTasks from "./pages/student/Tasks";
import StudentMessages from "./pages/student/Messages";
import StudentNotifications from "./pages/student/Notifications";
import StudentAlumniConnect from "./pages/student/AlumniConnect";
import StudentAlumniGroups from "./pages/student/AlumniGroups";
import StudentAlumniGroupDetail from "./pages/student/AlumniGroupDetail";
import StudentAdvancedSearch from "./features/search/AdvancedSearch";
import StudentProfile from "./pages/student/Profile";
import StudentBrowseRecruiters from "./pages/student/BrowseRecruiters";
import StudentRecruiterProfile from "./pages/student/RecruiterProfile";
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import RecruiterPostOpportunity from "./pages/recruiter/PostOpportunity";
import RecruiterManageApplicants from "./pages/recruiter/ManageApplicants";
import RecruiterSubmissions from "./pages/recruiter/Submissions";
import RecruiterMessages from "./pages/recruiter/Messages";
import RecruiterNotifications from "./pages/recruiter/Notifications";
import RecruiterProfile from "./pages/recruiter/Profile";
import RecruiterBrowseStudents from "./pages/recruiter/BrowseStudents";
import RecruiterStudentProfile from "./pages/recruiter/StudentProfile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminActivities from "./pages/admin/Activities";
import AdminLogin from "./pages/admin/AdminLogin";
import AboutUs from "./pages/AboutUs";
import Feedback from "./pages/Feedback";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import DesignSystemDemo from "./pages/DesignSystemDemo";
import StudentLayout from "./layouts/StudentLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import AdminLayout from "./layouts/AdminLayout";

initializeErrorTracking();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function AuthenticatedRedirect() {
  const { user, role, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (user && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  return <Landing />;
}

function LoginRedirect() {
  const { user, role, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (user && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  return <Login />;
}

const AppRoutes = () => (
  <>
    <SkipLink />
    <SessionTimeoutWarning />
    <Routes>
      <Route path="/" element={<AuthenticatedRedirect />} />
      <Route path="/login" element={<LoginRedirect />} />

      {/* Student Routes */}
      <Route element={
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/opportunities" element={<StudentOpportunities />} />
        <Route path="/student/opportunities/:id" element={<StudentOpportunityDetails />} />
        <Route path="/student/applications" element={<StudentApplications />} />
        <Route path="/student/portfolio" element={<StudentPortfolio />} />
        <Route path="/student/tasks" element={<StudentTasks />} />
        <Route path="/student/messages" element={<StudentMessages />} />
        <Route path="/student/notifications" element={<StudentNotifications />} />
        <Route path="/student/alumni" element={<StudentAlumniConnect />} />
        <Route path="/student/alumni/groups" element={<StudentAlumniGroups />} />
        <Route path="/student/alumni/groups/:groupId" element={<StudentAlumniGroupDetail />} />
        <Route path="/student/search" element={<StudentAdvancedSearch />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/profile/:userId" element={<StudentProfile />} />
        <Route path="/student/browse-recruiters" element={<StudentBrowseRecruiters />} />
        <Route path="/student/recruiter/:userId" element={<StudentRecruiterProfile />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* Admin Routes */}
      <Route element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/activities" element={<AdminActivities />} />
      </Route>

      {/* Recruiter Routes */}
      <Route element={
        <ProtectedRoute allowedRoles={["recruiter"]}>
          <RecruiterLayout />
        </ProtectedRoute>
      }>
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/post" element={<RecruiterPostOpportunity />} />
        <Route path="/recruiter/opportunities/:id/applicants" element={<RecruiterManageApplicants />} />
        <Route path="/recruiter/submissions" element={<RecruiterSubmissions />} />
        <Route path="/recruiter/messages" element={<RecruiterMessages />} />
        <Route path="/recruiter/notifications" element={<RecruiterNotifications />} />
        <Route path="/recruiter/profile" element={<RecruiterProfile />} />
        <Route path="/recruiter/browse-students" element={<RecruiterBrowseStudents />} />
        <Route path="/recruiter/student/:userId" element={<RecruiterStudentProfile />} />
      </Route>

      {/* Public Pages */}
      <Route path="/about" element={<AboutUs />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/design-system" element={<DesignSystemDemo />} />

      {/* Settings */}
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            {import.meta.env.DEV && <A11yChecker />}
            <OfflineIndicator />
            <AppRoutes />
            <CookieConsent />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
