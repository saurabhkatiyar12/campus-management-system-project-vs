import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';

export const FacultyDashboard = () => {
  const [stats, setStats] = useState({ assignments: 0, notices: 0, students: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const assignRes = await fetch('http://localhost:5000/api/assignments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const assigns = await assignRes.json();

        const noticeRes = await fetch('http://localhost:5000/api/notices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const notices = await noticeRes.json();

        const studentRes = await fetch('http://localhost:5000/api/users/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const students = await studentRes.json();

        setStats({
          assignments: assigns.length,
          notices: notices.length,
          students: students.length
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Faculty Dashboard</h2>
          
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
                <h3 className="text-gray-600 font-semibold mb-2">Assignments Created</h3>
                <p className="text-4xl font-bold text-blue-600">{stats.assignments}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
                <h3 className="text-gray-600 font-semibold mb-2">Notices Posted</h3>
                <p className="text-4xl font-bold text-green-600">{stats.notices}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
                <h3 className="text-gray-600 font-semibold mb-2">Total Students</h3>
                <p className="text-4xl font-bold text-purple-600">{stats.students}</p>
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <ul className="space-y-2">
                <li><Link to="/faculty/mark-attendance" className="text-blue-600 hover:underline">✓ Mark Attendance</Link></li>
                <li><Link to="/faculty/attendance-report" className="text-blue-600 hover:underline">📈 View Attendance Report</Link></li>
                <li><Link to="/faculty/manage-assignments" className="text-blue-600 hover:underline">📝 Create Assignment</Link></li>
                <li><Link to="/faculty/post-notice" className="text-blue-600 hover:underline">📢 Post Notice</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
