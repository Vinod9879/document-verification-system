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
  
  // For FormData uploads, don't override Content-Type - let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

const documentService = {
  // User Dashboard APIs
  async uploadDocuments(formData) {
    // Don't set Content-Type header - let the browser set it automatically with boundary
    const response = await api.post('/UserDashboard/upload-documents', formData);
    return response.data;
  },

  async extractDocumentsUser(uploadId) {
    // Call the extraction endpoint for user
    const response = await api.post(`/UserDashboard/extract/${uploadId}`);
    return response.data;
  },

  // Admin Dashboard APIs
  async getUploadedDocuments() {
    const response = await api.get('/AdminDashboard/uploaded-documents');
    return response.data;
  },

  async extractDocumentsAdmin(uploadId) {
    // Call the extraction endpoint for admin
    const response = await api.post(`/AdminDashboard/extract/${uploadId}`);
    return response.data;
  },

  // Legacy methods for backward compatibility
  async getUserProfile() {
    const response = await api.get('/UserDashboard/profile');
    return response.data;
  },

  async updateUserProfile(profileData) {
    const response = await api.put('/UserDashboard/profile', profileData);
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.put('/UserDashboard/change-password', passwordData);
    return response.data;
  },

  async getDocumentStatus() {
    const response = await api.get('/UserDashboard/document-status');
    return response.data;
  },

  async getUploadHistory() {
    const response = await api.get('/UserDashboard/upload-history');
    return response.data;
  },

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
    const response = await api.get(`/AdminDashboard/uploaded-documents`);
    return response.data;
  },

  async getDocumentDetails(documentId) {
    const response = await api.get(`/AdminDashboard/documents/${documentId}`);
    return response.data;
  },


  async triggerVerification(documentId) {
    const response = await api.post(`/AdminDashboard/verify/${documentId}`);
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

  async getProcessingStatus(documentId) {
    const response = await api.get(`/UserDashboard/processing-status/${documentId}`);
    return response.data;
  },

  async getDocumentExtractedData(documentId) {
    // Get extracted data from the backend
    const response = await api.get(`/AdminDashboard/extracted-data/${documentId}`);
    return response.data;
  },

  async getAllExtractedData() {
    const response = await api.get(`/AdminDashboard/all-extracted-data`);
    return response.data;
  },

  async getUserDocuments(userId) {
    const response = await api.get(`/AdminDashboard/users/${userId}/documents`);
    return response.data;
  },

  async verifyDocuments() {
    const response = await api.post('/UserDashboard/verify-documents');
    return response.data;
  },

  async getGeoLocation(uploadId) {
    const response = await api.get(`/AdminDashboard/geolocation/${uploadId}`);
    return response.data;
  },
};

export default documentService;
