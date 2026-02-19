import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';

export const ViewNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setNotices(data);
      } catch (err) {
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [token]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Notices & Announcements</h2>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="space-y-4">
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <div key={notice.id} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${getPriorityColor(notice.priority)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">{notice.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{notice.content}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>👤 {notice.postedByName} ({notice.postedByRole})</span>
                      <span>📅 {new Date(notice.createdAt).toLocaleDateString()} {new Date(notice.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-600 bg-white rounded-xl shadow-lg p-8">
                  No notices at this time.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
