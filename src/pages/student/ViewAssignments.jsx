import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/auth-context';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';

export const ViewAssignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitForm, setSubmitForm] = useState({ assignmentId: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/assignments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/assignments/${submitForm.assignmentId}/submit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: submitForm.content })
      });

      if (response.ok) {
        alert('Assignment submitted successfully!');
        setSubmitForm({ assignmentId: '', content: '' });
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = (assignment) => {
    return assignment.submissions && assignment.submissions.some(s => s.studentId === user?.id);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Assignments</h2>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const submitted = isSubmitted(assignment);
                const isOverdue = new Date(assignment.dueDate) < new Date();
                
                return (
                  <div key={assignment.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        submitted ? 'bg-green-100 text-green-800' : 
                        isOverdue ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {submitted ? '✓ Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{assignment.description}</p>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>📚 {assignment.course}</span>
                      <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      <span>👤 {assignment.createdByName}</span>
                    </div>

                    {!submitted && (
                      <form onSubmit={handleSubmit} className="mt-4">
                        <textarea
                          placeholder="Enter your solution/submission"
                          value={submitForm.assignmentId === assignment.id ? submitForm.content : ''}
                          onChange={(e) => {
                            setSubmitForm({ assignmentId: assignment.id, content: e.target.value });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                          rows="3"
                        />
                        <button
                          type="submit"
                          disabled={submitting || submitForm.assignmentId !== assignment.id}
                          onClick={() => setSubmitForm({ assignmentId: assignment.id, content: submitForm.content })}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Submit Assignment'}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
