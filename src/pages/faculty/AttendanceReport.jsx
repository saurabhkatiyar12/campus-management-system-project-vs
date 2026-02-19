import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';

export const AttendanceReport = () => {
  const [course, setCourse] = useState('');
  const [month, setMonth] = useState('');
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (course) params.append('course', course);
      if (month) params.append('month', month);

      const response = await fetch(`http://localhost:5000/api/attendance/report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Attendance Report</h2>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Course name"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchReport}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {report.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Student Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Present</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((item) => (
                    <tr key={item.studentId} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{item.studentName}</td>
                      <td className="px-6 py-3">{item.present}</td>
                      <td className="px-6 py-3">{item.total}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                item.percentage >= 75 ? 'bg-green-500' : item.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="font-semibold">{item.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && report.length === 0 && (
            <div className="text-center text-gray-600">No attendance records found. Generate a report to view data.</div>
          )}
        </div>
      </div>
    </div>
  );
};
