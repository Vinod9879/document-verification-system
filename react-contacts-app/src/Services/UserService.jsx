import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const userService = {
  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/AdminDashboard/users`);
      return response.data.users || response.data; // Handle both response formats
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/AdminDashboard/users/${id}`);
      return response.data.user || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new user (Admin only)
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/AdminDashboard/users`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user (Admin only)
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/AdminDashboard/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/AdminDashboard/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user API error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update user profile (User only)
  updateProfile: async (userData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/UserDashboard/profile`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;
