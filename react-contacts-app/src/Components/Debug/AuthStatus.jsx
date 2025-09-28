import React from 'react';
import { useAuth } from '../../Services/AuthService';
import Cookies from 'js-cookie';

const AuthStatus = () => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const token = Cookies.get('jwt_token');

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Authentication Status Debug</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5>Current State:</h5>
                  <ul className="list-unstyled">
                    <li><strong>Loading:</strong> {loading ? '✅ Yes' : '❌ No'}</li>
                    <li><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</li>
                    <li><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</li>
                    <li><strong>Token Present:</strong> {token ? '✅ Yes' : '❌ No'}</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5>User Info:</h5>
                  {user ? (
                    <ul className="list-unstyled">
                      <li><strong>Name:</strong> {user.fullName}</li>
                      <li><strong>Email:</strong> {user.email}</li>
                      <li><strong>Role:</strong> {user.role}</li>
                      <li><strong>ID:</strong> {user.id}</li>
                    </ul>
                  ) : (
                    <p className="text-muted">No user data</p>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <h5>Token Details:</h5>
                {token ? (
                  <div>
                    <p><strong>Token:</strong> {token.substring(0, 20)}...</p>
                    <p><strong>Token Length:</strong> {token.length} characters</p>
                  </div>
                ) : (
                  <p className="text-muted">No token found</p>
                )}
              </div>

              <div className="mt-3">
                <h5>Instructions:</h5>
                <ol>
                  <li>Login as admin or user</li>
                  <li>Refresh this page (F5)</li>
                  <li>Check if authentication persists</li>
                  <li>If it logs out, check browser console for errors</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthStatus;
