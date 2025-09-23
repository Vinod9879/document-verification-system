import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const documentService = {
  // User Dashboard APIs
  async getUserProfile() {
    const response = await api.get('/UserDashboard/profile');
    return response.data;
  },

  async updateUserProfile(profileData) {
    const response = await api.put('/UserDashboard/profile', profileData);
    return response.data;
  },

  async uploadDocuments(formData) {
    const response = await api.post('/UserDashboard/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getDocumentStatus() {
    const response = await api.get('/UserDashboard/document-status');
    return response.data;
  },

  async getExtractedData() {
    const response = await api.get('/UserDashboard/extracted-data');
    return response.data;
  },

  async verifyDocuments() {
    const response = await api.post('/UserDashboard/verify-documents');
    return response.data;
  },

  async getUploadHistory() {
    const response = await api.get('/UserDashboard/upload-history');
    return response.data;
  },

  // Admin Dashboard APIs
  async getAllUsers(page = 1, pageSize = 10) {
    const response = await api.get(`/AdminDashboard/users?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async getUserDetails(userId) {
    const response = await api.get(`/AdminDashboard/users/${userId}`);
    return response.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.put(`/AdminDashboard/users/${userId}/role`, { role });
    return response.data;
  },

  async getAllDocuments(page = 1, pageSize = 10) {
    const response = await api.get(`/AdminDashboard/documents?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  async getDocumentDetails(documentId) {
    const response = await api.get(`/AdminDashboard/documents/${documentId}`);
    return response.data;
  },

  async triggerVerification(documentId) {
    const response = await api.post(`/AdminDashboard/documents/${documentId}/verify`);
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get('/AdminDashboard/analytics');
    return response.data;
  },

  async downloadDocument(documentId, documentType) {
    const response = await api.get(`/AdminDashboard/documents/${documentId}/download/${documentType}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getActivityLogs(page = 1, pageSize = 20) {
    const response = await api.get(`/AdminDashboard/activity-logs?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },
};

export default documentService;
