import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { MarkAttendance } from './pages/faculty/MarkAttendance';
import { AttendanceReport } from './pages/faculty/AttendanceReport';
import { ManageAssignments } from './pages/faculty/ManageAssignments';
import { PostNotice } from './pages/faculty/PostNotice';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ViewAttendance } from './pages/student/ViewAttendance';
import { ViewAssignments } from './pages/student/ViewAssignments';
import { ViewNotices } from './pages/student/ViewNotices';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/manage-users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            } 
          />

          {/* Faculty Routes */}
          <Route 
            path="/faculty/dashboard" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faculty/mark-attendance" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <MarkAttendance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faculty/attendance-report" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <AttendanceReport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faculty/manage-assignments" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <ManageAssignments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faculty/post-notice" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <PostNotice />
              </ProtectedRoute>
            } 
          />

          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/view-attendance" 
            element={
              <ProtectedRoute requiredRole="student">
                <ViewAttendance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/view-assignments" 
            element={
              <ProtectedRoute requiredRole="student">
                <ViewAssignments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/view-notices" 
            element={
              <ProtectedRoute requiredRole="student">
                <ViewNotices />
              </ProtectedRoute>
            } 
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
