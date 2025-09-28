import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Services/AuthService';

const NavBar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <span className="me-2">🛡️</span>
          <span className="fw-bold">RiskDoc</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthenticated && (
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                  <span className="me-1">🏠</span>
                  Dashboard
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <Link to="/documents" className="nav-link">
                  <span className="me-1">📄</span>
                  Documents
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <Link to="/my-activity" className="nav-link">
                  <span className="me-1">📊</span>
                  My Activity
                </Link>
              </li>
            )}
            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <Link to="/admin-dashboard" className="nav-link">
                  <span className="me-1">👥</span>
                  Admin Panel
                </Link>
              </li>
            )}
            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <Link to="/audit-logs" className="nav-link">
                  <span className="me-1">📋</span>
                  Audit Logs
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <span className="text-light me-2">👤</span>
                  <span className="text-light">{user?.fullName || 'User'}</span>
                  {isAdmin && (
                    <span className="badge bg-danger ms-2">Admin</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm"
                >
                  <span className="me-1">🚪</span>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  User Login
                </Link>
                <Link to="/admin-login" className="btn btn-warning btn-sm">
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;