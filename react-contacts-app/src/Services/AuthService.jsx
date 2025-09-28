import axios from 'axios';
import Cookies from 'js-cookie';
import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Add request interceptor to include JWT token
axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('jwt_token');
    if (token) {
      // Verify token and get user info
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  // Retry token verification if there was a network error
  useEffect(() => {
    const token = Cookies.get('jwt_token');
    if (token && !isAuthenticated && !loading) {
      // Retry after 2 seconds if we have a token but aren't authenticated
      const retryTimer = setTimeout(() => {
        console.log('Retrying token verification...');
        verifyToken();
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [isAuthenticated, loading]);

  const verifyToken = async () => {
    try {
      console.log('Verifying token...');
      const response = await axios.get('/auth/verify');
      console.log('Token verification successful:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      setIsAdmin(response.data.role === 'Admin');
    } catch (error) {
      console.error('Token verification failed:', error);
      console.error('Error details:', error.response?.data);
      // Only remove token if it's actually invalid (401) or expired
      if (error.response?.status === 401) {
        Cookies.remove('jwt_token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      } else {
        // For network errors, keep the token and try again later
        console.log('Network error, keeping token for retry');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      Cookies.set('jwt_token', token, { expires: 7, secure: false, sameSite: 'lax' });
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.role === 'Admin');
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const adminLogin = async (username, password) => {
    try {
      const response = await axios.post('/auth/admin-login', { username, password });
      const { token, user } = response.data;
      
      Cookies.set('jwt_token', token, { expires: 7, secure: false, sameSite: 'lax' });
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(true);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Admin login failed' 
      };
    }
  };

  const logout = () => {
    Cookies.remove('jwt_token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isAdmin,
    user,
    loading,
    login,
    register,
    adminLogin,
    logout,
    verifyToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export individual functions for direct use
export const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  adminLogin: async (username, password) => {
    try {
      const response = await axios.post('/auth/admin-login', { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
