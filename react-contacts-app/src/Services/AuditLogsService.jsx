import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Configure axios for audit logs API calls
const auditLogsApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor to include JWT token
auditLogsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('jwt_token='))
      ?.split('=')[1];
    
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
auditLogsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const auditLogsService = {
  // Admin-only endpoints
  getAllAuditLogs: async (page = 1, pageSize = 50) => {
    try {
      const response = await auditLogsApi.get(`/auditlogs?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all audit logs:', error);
      throw error;
    }
  },

  getAuditLogsByUser: async (userId, page = 1, pageSize = 50) => {
    try {
      const response = await auditLogsApi.get(`/auditlogs/user/${userId}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs by user:', error);
      throw error;
    }
  },

  getAuditLogsByActivity: async (activity, page = 1, pageSize = 50) => {
    try {
      const response = await auditLogsApi.get(`/auditlogs/activity/${activity}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs by activity:', error);
      throw error;
    }
  },

  getAuditLogsByEntity: async (entityType, entityId, page = 1, pageSize = 50) => {
    try {
      const response = await auditLogsApi.get(`/auditlogs/entity/${entityType}/${entityId}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs by entity:', error);
      throw error;
    }
  },

  getAuditLogsByDateRange: async (startDate, endDate, page = 1, pageSize = 50) => {
    try {
      const response = await auditLogsApi.get(`/auditlogs/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs by date range:', error);
      throw error;
    }
  },

  // User endpoint - users can view their own activity
  getMyActivity: async (activity = null, startDate = null, endDate = null, page = 1, pageSize = 50) => {
    try {
      let url = `/auditlogs/my-activity?page=${page}&pageSize=${pageSize}`;
      
      if (activity) url += `&activity=${encodeURIComponent(activity)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await auditLogsApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching my activity:', error);
      throw error;
    }
  },

  // Helper method to format date for API calls
  formatDateForAPI: (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  },

  // Helper method to format date for display
  formatDateForDisplay: (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  // Helper method to get activity badge color
  getActivityBadgeColor: (activity) => {
    const activityColors = {
      'Login': 'bg-success',
      'Logout': 'bg-secondary',
      'Document Upload': 'bg-primary',
      'Document Extraction': 'bg-info',
      'Document Verification': 'bg-warning',
      'User Registration': 'bg-success',
      'User Update': 'bg-primary',
      'User Delete': 'bg-danger',
      'View My Activity': 'bg-info',
      'View Audit Logs': 'bg-secondary',
      'Admin Action': 'bg-warning'
    };
    
    return activityColors[activity] || 'bg-secondary';
  },

  // Helper method to get action result badge color
  getActionResultBadgeColor: (result) => {
    const resultColors = {
      'Success': 'bg-success',
      'Failed': 'bg-danger',
      'Pending': 'bg-warning',
      'Error': 'bg-danger'
    };
    
    return resultColors[result] || 'bg-secondary';
  }
};

export default auditLogsService;
