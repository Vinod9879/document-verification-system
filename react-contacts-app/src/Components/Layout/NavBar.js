import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Services/AuthService';
import Button from '../Common/Button';

const NavBar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Risk Management
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
            )}
            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin-dashboard">
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-3">
                    Welcome, <strong>{user?.fullName || 'User'}</strong>
                    {isAdmin && <span className="badge bg-danger ms-2">Admin</span>}
                  </span>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-light btn-sm me-2" 
                    onClick={handleLogout}
                    title="Quick Sign Out"
                  >
                    <i className="fas fa-sign-out-alt me-1"></i>
                    Quick Sign Out
                  </button>
                </li>
                <li className="nav-item">
                  <Link 
                    className="btn btn-outline-warning btn-sm" 
                    to="/signout"
                    title="Formal Sign Out"
                  >
                    <i className="fas fa-door-open me-1"></i>
                    Sign Out
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    User Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin-login">
                    Admin Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
