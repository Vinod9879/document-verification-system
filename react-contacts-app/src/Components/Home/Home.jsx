import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-vh-100 bg-gradient-primary">
      {/* Hero Section */}
      <div className="container-fluid py-5">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-10 col-xl-8">
            <div className="text-center text-white mb-5">
              {/* Logo/Brand */}
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-20 rounded-circle p-4 mb-3">
                  <span className="text-white fs-1">🛡️</span>
                </div>
                <h1 className="display-3 fw-bold mb-3">RiskDoc</h1>
                <p className="lead fs-4 mb-4 opacity-75">
                  Secure document verification and risk assessment platform
                </p>
                <p className="fs-5 mb-5 opacity-90">
                  Manage your documents with confidence and transparency
                </p>
              </div>

              {/* Feature Cards */}
              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="card bg-white bg-opacity-10 border-0 rounded-4 h-100">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <span className="text-white fs-2">🛡️</span>
                      </div>
                      <h5 className="card-title text-white fw-bold">Secure Verification</h5>
                      <p className="card-text text-white-50 small">
                        Advanced document verification with AI-powered risk assessment
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card bg-white bg-opacity-10 border-0 rounded-4 h-100">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <span className="text-white fs-2">👥</span>
                      </div>
                      <h5 className="card-title text-white fw-bold">User Management</h5>
                      <p className="card-text text-white-50 small">
                        Comprehensive user management with role-based access control
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card bg-white bg-opacity-10 border-0 rounded-4 h-100">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <span className="text-white fs-2">⚙️</span>
                      </div>
                      <h5 className="card-title text-white fw-bold">Admin Dashboard</h5>
                      <p className="card-text text-white-50 small">
                        Powerful admin tools for monitoring and managing the system
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row justify-content-center">
                <div className="col-lg-6">
                  <div className="card bg-white bg-opacity-15 border-0 rounded-4 shadow-lg">
                    <div className="card-body p-5">
                      <h3 className="card-title text-white text-center mb-4 fw-bold">
                        Get Started Today
                      </h3>
                      
                      <div className="d-grid gap-3">
                        <Link 
                          to="/login"
                          className="btn btn-light btn-lg fw-semibold d-flex align-items-center justify-content-center gap-2"
                        >
                          <span>🔐</span>
                          User Login
                        </Link>
                        
                        <Link 
                          to="/register"
                          className="btn btn-outline-light btn-lg fw-semibold d-flex align-items-center justify-content-center gap-2"
                        >
                          <span>👤</span>
                          User Registration
                        </Link>
                        
                        <Link 
                          to="/admin-login"
                          className="btn btn-warning btn-lg fw-semibold d-flex align-items-center justify-content-center gap-2"
                        >
                          <span>👨‍💼</span>
                          Admin Login
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="row g-3 mt-5">
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center gap-2 text-white-50">
                    <span>✅</span>
                    <span className="small">Secure & Encrypted</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center gap-2 text-white-50">
                    <span>🔒</span>
                    <span className="small">Role-Based Access</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center gap-2 text-white-50">
                    <span>📊</span>
                    <span className="small">Real-time Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="position-fixed bottom-0 start-0 end-0 bg-dark bg-opacity-75 py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <Link to="/login" className="btn btn-link text-white text-decoration-none">
                → User Login
              </Link>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-white-50">
                © 2024 Risk Management System. Secure • Reliable • Trusted
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
