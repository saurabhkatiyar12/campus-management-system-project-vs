import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('cms:toggle-sidebar'));
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="cms-menu-button"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold">📚 Campus Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{user?.name} ({user?.role})</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
