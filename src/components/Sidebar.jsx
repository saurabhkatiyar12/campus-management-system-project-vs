import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';

export const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const isDesktop = () => window.matchMedia('(min-width: 769px)').matches;
  const [isOpen, setIsOpen] = useState(isDesktop);

  const adminLinks = [
    { path: '/admin/dashboard', label: '📊 Dashboard' },
    { path: '/admin/manage-users', label: '👥 Manage Users' }
  ];

  const facultyLinks = [
    { path: '/faculty/dashboard', label: '📊 Dashboard' },
    { path: '/faculty/mark-attendance', label: '✓ Mark Attendance' },
    { path: '/faculty/attendance-report', label: '📈 Attendance Report' },
    { path: '/faculty/manage-assignments', label: '📝 Assignments' },
    { path: '/faculty/post-notice', label: '📢 Post Notice' }
  ];

  const studentLinks = [
    { path: '/student/dashboard', label: '📊 Dashboard' },
    { path: '/student/view-attendance', label: '✓ My Attendance' },
    { path: '/student/view-assignments', label: '📝 Assignments' },
    { path: '/student/view-notices', label: '📢 Notices' }
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'faculty' ? facultyLinks : studentLinks;

  useEffect(() => {
    const onResize = () => {
      if (isDesktop()) {
        setIsOpen(true);
      }
    };
    const onToggle = () => {
      setIsOpen(prev => !prev);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('cms:toggle-sidebar', onToggle);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('cms:toggle-sidebar', onToggle);
    };
  }, []);

  return (
    <>
      {isOpen && <button type="button" className="sidebar-backdrop" onClick={() => setIsOpen(false)} aria-label="Close sidebar overlay" />}
      <aside className={`sidebar-shell bg-slate-800 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} min-h-screen flex flex-col ${isOpen ? 'sidebar-open' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 hover:bg-slate-700 transition-colors"
      >
        {isOpen ? '←' : '→'}
      </button>
      <nav className="flex-1 px-4 py-6 space-y-3">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              } ${!isOpen && 'text-center'}`
            }
          >
            {isOpen ? link.label : link.label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
      </aside>
    </>
  );
};
