import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';

export const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ attendance: 0, assignments: 0, notices: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Attendance
        const attRes = await fetch(`http://localhost:5000/api/attendance?studentId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const att = await attRes.json();
        const total = att.length;
        const present = att.filter(a => a.status === 'present').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        // Assignments
        const assignRes = await fetch('http://localhost:5000/api/assignments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const assigns = await assignRes.json();

        // Notices
        const noticeRes = await fetch('http://localhost:5000/api/notices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const notices = await noticeRes.json();

        setStats({
          attendance: percentage,
          assignments: assigns.length,
          notices: notices.length
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchStats();
  }, [user?.id, token]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Student Dashboard</h2>
          
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
                  <h3 className="text-gray-600 font-semibold mb-2">Attendance</h3>
                  <p className="text-4xl font-bold text-blue-600">{stats.attendance}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
                  <h3 className="text-gray-600 font-semibold mb-2">Assignments</h3>
                  <p className="text-4xl font-bold text-green-600">{stats.assignments}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
                  <h3 className="text-gray-600 font-semibold mb-2">Notices</h3>
                  <p className="text-4xl font-bold text-purple-600">{stats.notices}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <ul className="space-y-2">
                  <li><Link to="/student/view-attendance" className="text-blue-600 hover:underline">✓ View My Attendance</Link></li>
                  <li><Link to="/student/view-assignments" className="text-blue-600 hover:underline">📝 View Assignments</Link></li>
                  <li><Link to="/student/view-notices" className="text-blue-600 hover:underline">📢 View Notices</Link></li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
