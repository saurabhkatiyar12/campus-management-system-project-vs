import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, faculty: 0, students: 0, notices: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = await response.json();

        const noticesRes = await fetch('http://localhost:5000/api/notices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const notices = await noticesRes.json();

        setStats({
          totalUsers: users.length,
          faculty: users.filter(u => u.role === 'faculty').length,
          students: users.filter(u => u.role === 'student').length,
          notices: notices.length
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
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h2>
          
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
                <h3 className="text-gray-600 font-semibold mb-2">Total Users</h3>
                <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
                <h3 className="text-gray-600 font-semibold mb-2">Faculty</h3>
                <p className="text-4xl font-bold text-green-600">{stats.faculty}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
                <h3 className="text-gray-600 font-semibold mb-2">Students</h3>
                <p className="text-4xl font-bold text-purple-600">{stats.students}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition">
                <h3 className="text-gray-600 font-semibold mb-2">Notices</h3>
                <p className="text-4xl font-bold text-orange-600">{stats.notices}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
