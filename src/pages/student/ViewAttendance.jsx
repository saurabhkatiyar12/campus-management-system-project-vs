import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/auth-context';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';

export const ViewAttendance = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedByDate, setGroupedByDate] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/attendance?studentId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        // Group by course or date for better visualization
        const grouped = {};
        data.forEach(record => {
          if (!grouped[record.course]) {
            grouped[record.course] = [];
          }
          grouped[record.course].push(record);
        });

        setAttendance(data);
        setGroupedByDate(grouped);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchAttendance();
  }, [user?.id, token]);

  const calculateCourseStats = (records) => {
    if (records.length === 0) return { percentage: 0, present: 0, total: 0 };
    const present = records.filter(r => r.status === 'present').length;
    const percentage = Math.round((present / records.length) * 100);
    return { percentage, present, total: records.length };
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">My Attendance</h2>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([course, records]) => {
                const stats = calculateCourseStats(records);
                return (
                  <div key={course} className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{course}</h3>
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Attendance</span>
                          <span className="font-semibold">{stats.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              stats.percentage >= 75 ? 'bg-green-500' : stats.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{stats.present}/{stats.total} days</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {records.map((record) => (
                        <div
                          key={record.id}
                          className={`p-2 rounded text-center text-sm font-medium ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <div>{new Date(record.date).toLocaleDateString()}</div>
                          <div>{record.status === 'present' ? '✓' : '✗'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {attendance.length === 0 && (
                <div className="text-center text-gray-600">No attendance records yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
