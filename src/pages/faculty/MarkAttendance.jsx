import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';

export const MarkAttendance = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data);
      // Initialize attendance
      const att = {};
      data.forEach(s => {
        att[s.id] = 'present';
      });
      setAttendance(att);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const records = students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: attendance[s.id]
      }));

      const response = await fetch('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          course: selectedCourse,
          date: selectedDate,
          records
        })
      });

      if (response.ok) {
        alert('Attendance marked successfully!');
        setSelectedCourse('');
        setSelectedDate('');
      } else {
        alert('Error marking attendance');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error marking attendance');
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
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Mark Attendance</h2>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <input
                    type="text"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    placeholder="e.g., Mathematics 101"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-4">Students</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <label className="font-medium text-gray-700">{student.name}</label>
                      <select
                        value={attendance[student.id]}
                        onChange={(e) => setAttendance({ ...attendance, [student.id]: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="present">✓ Present</option>
                        <option value="absent">✗ Absent</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedCourse || !selectedDate}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Marking...' : 'Mark Attendance'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
