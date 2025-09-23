import React, { useState, useEffect } from 'react';
import userService from '../../Services/UserService';
import documentService from '../../Services/DocumentService';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Navigation from '../Layout/Navigation';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    role: 'User'
  });
  
  // New states for document management
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
    fetchDocuments();
    fetchActivityLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from API...');
      const usersData = await userService.getAllUsers();
      console.log('Users data received:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const documentsData = await documentService.getAllDocuments();
      setDocuments(documentsData.documents || []);
    } catch (error) {
      console.log('Failed to load documents');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await documentService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.log('Failed to load analytics');
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const logsData = await documentService.getActivityLogs();
      setActivityLogs(logsData.logs || []);
    } catch (error) {
      console.log('Failed to load activity logs');
    }
  };

  const handleTriggerVerification = async (documentId) => {
    try {
      await documentService.triggerVerification(documentId);
      setMessage('Verification triggered successfully');
      fetchDocuments();
    } catch (error) {
      setMessage('Failed to trigger verification');
    }
  };

  const handleDownloadDocument = async (documentId, documentType) => {
    try {
      const blob = await documentService.downloadDocument(documentId, documentType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}_${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setMessage('Failed to download document');
    }
  };

  const handleDeleteUser = async (userId) => {
    console.log('Delete button clicked for user ID:', userId);
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        console.log('Proceeding with delete for user ID:', userId);
        await userService.deleteUser(userId);
        setMessage('User deleted successfully.');
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Delete user error:', error);
        setMessage('Failed to delete user. Please try again.');
      }
    } else {
      console.log('Delete cancelled by user');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      role: user.role || 'User'
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUser(selectedUser.id, editForm);
      setMessage('User updated successfully.');
      setShowEditModal(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Update user error:', error);
      setMessage('Failed to update user. Please try again.');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🔹 Filter users based on search input
  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="mt-5 text-center">
            <div className="card-body">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading users...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h2 mb-0">Admin Dashboard</h1>
            <Button variant="primary" onClick={fetchUsers}>
              Refresh Users
            </Button>
          </div>
        </div>
      </div>

      {/* 🔹 Search bar */}
      <div className="row mb-3">
        <div className="col-12">
          <input
            type="text"
            className="form-control"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div className="row">
          <div className="col-12">
            <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-warning'}`} role="alert">
              {message}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Users Management
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                Document Monitoring
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics & Reports
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                Activity Logs
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {activeTab === 'analytics' && analytics && (
        <div className="row mb-4">
          <div className="col-md-3">
            <Card title="Total Users" className="text-center">
              <h3 className="text-primary">{analytics.userStats?.totalUsers || 0}</h3>
              <small className="text-muted">Regular: {analytics.userStats?.totalRegularUsers || 0} | Admin: {analytics.userStats?.totalAdmins || 0}</small>
            </Card>
          </div>
          <div className="col-md-3">
            <Card title="Document Uploads" className="text-center">
              <h3 className="text-info">{analytics.documentStats?.totalUploads || 0}</h3>
              <small className="text-muted">Submitted: {analytics.documentStats?.submittedUploads || 0}</small>
            </Card>
          </div>
          <div className="col-md-3">
            <Card title="Verification Status" className="text-center">
              <h3 className="text-success">{analytics.documentStats?.verifiedUploads || 0}</h3>
              <small className="text-muted">Pending: {analytics.documentStats?.pendingVerification || 0}</small>
            </Card>
          </div>
          <div className="col-md-3">
            <Card title="Risk Summary" className="text-center">
              <div className="row">
                <div className="col-4">
                  <small className="text-success">Low: {analytics.riskScoreSummary?.lowRisk || 0}</small>
                </div>
                <div className="col-4">
                  <small className="text-warning">Med: {analytics.riskScoreSummary?.mediumRisk || 0}</small>
                </div>
                <div className="col-4">
                  <small className="text-danger">High: {analytics.riskScoreSummary?.highRisk || 0}</small>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Document Monitoring */}
      {activeTab === 'documents' && (
        <div className="row mb-4">
          <div className="col-12">
            <Card title="Document Monitoring" className="dashboard-card">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Documents</th>
                      <th>Status</th>
                      <th>Risk Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.userName}</td>
                        <td>{doc.userEmail}</td>
                        <td>
                          <span className={`badge ${doc.hasEC ? 'bg-success' : 'bg-secondary'} me-1`}>EC</span>
                          <span className={`badge ${doc.hasAadhaar ? 'bg-success' : 'bg-secondary'} me-1`}>Aadhaar</span>
                          <span className={`badge ${doc.hasPAN ? 'bg-success' : 'bg-secondary'}`}>PAN</span>
                        </td>
                        <td>
                          <span className={`badge ${doc.isVerified ? 'bg-success' : 'bg-warning'}`}>
                            {doc.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${doc.riskScore <= 30 ? 'bg-success' : doc.riskScore <= 70 ? 'bg-warning' : 'bg-danger'}`}>
                            {doc.riskScore}/100
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleTriggerVerification(doc.id)}
                          >
                            Verify
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Activity Logs */}
      {activeTab === 'activity' && (
        <div className="row mb-4">
          <div className="col-12">
            <Card title="Activity Logs" className="dashboard-card">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Activity</th>
                      <th>Description</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.userName}</td>
                        <td><span className="badge bg-info">{log.activity}</span></td>
                        <td>{log.description}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
      <div className="row">
        <div className="col-12">
          <Card title={`All Users (${filteredUsers.length})`} className="dashboard-card">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No users found.</p>
                <Button variant="primary" onClick={fetchUsers}>
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="row">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="col-md-6 col-lg-4 mb-3">
                    <Card className="h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="user-avatar me-3">
                            {getInitials(user.fullName)}
                          </div>
                          <div>
                            <h6 className="card-title mb-1">{user.fullName}</h6>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="row">
                            <div className="col-6">
                              <small className="text-muted">Phone</small>
                              <p className="mb-1">{user.phone}</p>
                            </div>
                            <div className="col-6">
                              <small className="text-muted">Role</small>
                              <p className="mb-1">
                                <span className={`badge ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                                  {user.role}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-6">
                              <small className="text-muted">City</small>
                              <p className="mb-1">{user.city}</p>
                            </div>
                            <div className="col-6">
                              <small className="text-muted">State</small>
                              <p className="mb-1">{user.state}</p>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-6">
                              <small className="text-muted">Pincode</small>
                              <p className="mb-1">{user.pincode}</p>
                            </div>
                            <div className="col-6">
                              <small className="text-muted">Joined</small>
                              <p className="mb-1">{formatDate(user.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <Navigation
                          onEdit={() => handleEditUser(user)}
                          onView={() => handleViewUser(user)}
                          onDelete={() => handleDeleteUser(user.id)}
                        />
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <div className="user-avatar mx-auto mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                      {getInitials(selectedUser.fullName)}
                    </div>
                    <h5>{selectedUser.fullName}</h5>
                    <span className={`badge ${selectedUser.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-sm-6">
                        <h6 className="text-muted">Email</h6>
                        <p>{selectedUser.email}</p>
                      </div>
                      <div className="col-sm-6">
                        <h6 className="text-muted">Phone</h6>
                        <p>{selectedUser.phone}</p>
                      </div>
                      <div className="col-sm-6">
                        <h6 className="text-muted">City</h6>
                        <p>{selectedUser.city}</p>
                      </div>
                      <div className="col-sm-6">
                        <h6 className="text-muted">State</h6>
                        <p>{selectedUser.state}</p>
                      </div>
                      <div className="col-sm-6">
                        <h6 className="text-muted">Pincode</h6>
                        <p>{selectedUser.pincode}</p>
                      </div>
                      <div className="col-sm-6">
                        <h6 className="text-muted">Member Since</h6>
                        <p>{formatDate(selectedUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Close
                </Button>
                <Button variant="warning" onClick={() => {
                  setShowModal(false);
                  handleEditUser(selectedUser);
                }}>
                  Edit User
                </Button>
                <Button variant="danger" onClick={() => {
                  setShowModal(false);
                  handleDeleteUser(selectedUser.id);
                }}>
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User: {selectedUser.fullName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="fullName"
                          value={editForm.fullName}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select
                          className="form-select"
                          name="role"
                          value={editForm.role}
                          onChange={handleEditFormChange}
                          required
                        >
                          <option value="User">User</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={editForm.city}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={editForm.state}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Pincode</label>
                        <input
                          type="text"
                          className="form-control"
                          name="pincode"
                          value={editForm.pincode}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Update User
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
