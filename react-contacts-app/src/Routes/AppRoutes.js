import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../Components/Home/Home';
import UserLogin from '../Components/Auth/UserLogin';
import UserRegister from '../Components/Auth/UserRegister';
import AdminLogin from '../Components/Auth/AdminLogin';
import SignOut from '../Components/Auth/SignOut';
import UserDashboard from '../Components/Dashboard/UserDashboard';
import AdminDashboard from '../Components/Dashboard/AdminDashboard';
import AdminLoginDebug from '../Components/Debug/AdminLoginDebug';
import SimpleAdminTest from '../Components/Debug/SimpleAdminTest';
import AuthStatus from '../Components/Debug/AuthStatus';
import { useAuth } from '../Services/AuthService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-debug" element={<AdminLoginDebug />} />
      <Route path="/simple-test" element={<SimpleAdminTest />} />
      <Route path="/auth-status" element={<AuthStatus />} />
      <Route path="/signout" element={<SignOut />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
