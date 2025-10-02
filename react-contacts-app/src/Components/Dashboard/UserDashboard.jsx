import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Services/AuthService';
import userService from '../../Services/UserService';
import documentService from '../../Services/documentService';
import auditLogsService from '../../Services/AuditLogsService';
import Card from '../Common/Card';
import Button from '../Common/Button';
import VerificationResults from './VerificationResults';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Document upload states
  const [documentStatus, setDocumentStatus] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({
    EC: null,
    Aadhaar: null,
    PAN: null
  });

  // Profile editing states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    fullName: '',
    phone: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);
  
  // Tab and activity states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userActivities, setUserActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchDocumentStatus();
    fetchUploadHistory();
    fetchUserActivities();
    
    // Auto-refresh document status every 30 seconds
    const interval = setInterval(() => {
      fetchDocumentStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await documentService.getUserProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Profile loading error:', error);
      setMessage('Failed to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentStatus = async () => {
    try {
      setRefreshing(true);
      const status = await documentService.getDocumentStatus();
      
      // Check if status has changed
      if (documentStatus && status) {
        const statusChanged = documentStatus.isVerified !== status.isVerified;
        if (statusChanged) {
          setStatusUpdated(true);
          setTimeout(() => setStatusUpdated(false), 3000); // Hide notification after 3 seconds
        }
      }
      
      setDocumentStatus(status);
      
      // If documents have been extracted, fetch the extracted data
      if (status && status.hasExtractedData && status.uploadId) {
        try {
          const extractedDataResponse = await documentService.getDocumentExtractedData(status.uploadId);
          setExtractedData(extractedDataResponse);
        } catch (extractError) {
          setExtractedData(null);
        }
      } else {
        setExtractedData(null);
      }
      
    } catch (error) {
      // No documents uploaded yet or API error
      setDocumentStatus(null);
      setExtractedData(null);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      const history = await documentService.getUploadHistory();
      
      // Handle different response structures
      if (Array.isArray(history)) {
        setUploadHistory(history);
      } else if (history && Array.isArray(history.uploads)) {
        setUploadHistory(history.uploads);
      } else if (history && Array.isArray(history.data)) {
        setUploadHistory(history.data);
      } else {
        // No history available
        setUploadHistory([]);
      }
    } catch (error) {
      // No upload history available
      setUploadHistory([]);
    }
  };

  const fetchUserActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await auditLogsService.getMyActivity(null, null, null, 1, 10);
      setUserActivities(response.logs || []);
    } catch (error) {
      // Failed to load user activities
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleFileChange = (documentType, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleDocumentUpload = async () => {
    if (!selectedFiles.EC || !selectedFiles.Aadhaar || !selectedFiles.PAN) {
      setMessage('Please select all three documents (EC, Aadhaar, PAN)');
      return;
    }

    try {
      setUploading(true);
      setMessage('');

      const formData = new FormData();
      formData.append('EC', selectedFiles.EC);
      formData.append('Aadhaar', selectedFiles.Aadhaar);
      formData.append('PAN', selectedFiles.PAN);

      const response = await documentService.uploadDocuments(formData);
      
      if (response.isSecondRound) {
        setMessage('Second round documents uploaded successfully! New verification will be processed...');
      } else {
        setMessage('Documents uploaded successfully! Processing...');
      }
      
      // Force immediate refresh first
      await fetchDocumentStatus();
      await fetchUploadHistory();
      
      // Then refresh again after a delay to ensure backend processing is complete
      setTimeout(async () => {
        await fetchDocumentStatus();
        await fetchUploadHistory();
        
        // Check processing status if document ID is returned
        if (response.documentId) {
          await checkProcessingStatus(response.documentId);
        }
      }, 2000);
      
      // Clear selected files
      setSelectedFiles({ EC: null, Aadhaar: null, PAN: null });
    } catch (error) {
      setMessage('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  const checkProcessingStatus = async (documentId) => {
    try {
      const status = await documentService.getProcessingStatus(documentId);
      setProcessingStatus(status);
      
      // If still processing, check again in 5 seconds
      if (status.ProcessingStatus === 'Processing') {
        setTimeout(() => checkProcessingStatus(documentId), 5000);
      }
    } catch (error) {
      // Error checking processing status
    }
  };


  const viewUploadDetails = (upload) => {
    // Show detailed information about the upload
    const details = `
Upload Date: ${new Date(upload.submittedAt).toLocaleString()}
Status: ${upload.isVerified ? 'Verified' : 'Pending'}
Documents: ${upload.ecPath ? 'EC ✓' : 'EC ✗'} | ${upload.aadhaarPath ? 'Aadhaar ✓' : 'Aadhaar ✗'} | ${upload.panPath ? 'PAN ✓' : 'PAN ✗'}
    `;
    alert(details);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRiskScoreColor = (riskScore) => {
    if (riskScore >= 80) return 'danger';
    if (riskScore >= 50) return 'warning';
    return 'success';
  };

  const getRiskScoreText = (riskScore) => {
    if (riskScore >= 80) return 'High Risk';
    if (riskScore >= 50) return 'Medium Risk';
    return 'Low Risk';
  };

  const getStatusText = (status) => {
    if (!status) return '⏳ No Documents';
    
    if (status.isVerified) return '✅ Verified';
    
    if (status.verificationStatus === 'Rejected') return '❌ Rejected';
    if (status.verificationStatus === 'Under Review') return '🔍 Under Review';
    if (status.verificationStatus === 'Verified') return '✅ Verified';
    
    if (status.hasExtractedData) return '⏳ Awaiting Verification';
    if (status.hasDocuments) return '📄 Documents Uploaded';
    
    return '⏳ Pending';
  };

  const getStatusColor = (status) => {
    if (!status) return 'secondary';
    
    if (status.isVerified) return 'success';
    
    if (status.verificationStatus === 'Rejected') return 'danger';
    if (status.verificationStatus === 'Under Review') return 'info';
    if (status.verificationStatus === 'Verified') return 'success';
    
    if (status.hasExtractedData) return 'warning';
    if (status.hasDocuments) return 'primary';
    
    return 'warning';
  };

  const getStatusDescription = (status) => {
    if (!status) return 'No documents uploaded yet';
    
    if (status.isVerified) return 'All documents verified successfully';
    
    if (status.verificationStatus === 'Rejected') return 'Documents rejected - please resubmit';
    if (status.verificationStatus === 'Under Review') return 'Documents under admin review';
    if (status.verificationStatus === 'Verified') return 'All documents verified successfully';
    
    if (status.hasExtractedData) return 'Documents extracted - awaiting verification';
    if (status.hasDocuments) return 'Documents uploaded - awaiting extraction';
    
    return 'Awaiting document upload';
  };

  // Profile editing handlers
  const handleEditProfile = () => {
    if (profile) {
      setEditProfileData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || ''
      });
    }
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      setMessage('');
      
      const response = await documentService.updateUserProfile(editProfileData);
      
      setMessage('Profile updated successfully!');
      setShowEditProfile(false);
      
      // Refresh profile data
      await fetchUserProfile();
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Cannot update profile after document submission.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to update your profile.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found. Please log in again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setMessage(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePassword(true);
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setUpdating(true);
      setMessage('');
      
      const response = await documentService.changePassword(passwordData);
      
      setMessage('Password changed successfully!');
      setShowChangePassword(false);
    } catch (error) {
      console.error('Password change error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Current password is incorrect.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to change your password.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found. Please log in again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setMessage(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="mt-5 text-center">
            <div className="card-body">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your profile...</p>
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
            <h1 className="h2 mb-0">Welcome, {user?.fullName || 'User'}!</h1>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => {
                if (activeTab === 'dashboard') {
                  fetchDocumentStatus();
                  fetchUploadHistory();
                } else if (activeTab === 'activity') {
                fetchUserActivities();
              }
            }}>
              Refresh
            </Button>
              <Button 
                variant="outline-danger" 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <span className="me-1">🚪</span>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                My Activity
              </button>
            </li>
          </ul>
        </div>
      </div>

      {message && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              {message}
            </div>
          </div>
        </div>
      )}

      {statusUpdated && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              <strong>Status Updated!</strong> Your document verification status has been refreshed.
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setStatusUpdated(false)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {processingStatus && processingStatus.ProcessingStatus === 'Processing' && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info" role="alert">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <strong>Processing Documents...</strong>
                <span className="ms-2">Estimated completion: {processingStatus.EstimatedCompletion ? new Date(processingStatus.EstimatedCompletion).toLocaleTimeString() : 'Soon'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <>
          {/* Document Summary Section */}
      {documentStatus && (
        <div className="row mb-4">
          <div className="col-md-3">
            <Card title="Current Status" className="text-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className={`text-${getStatusColor(documentStatus)} mb-0`}>
                  {getStatusText(documentStatus)}
                </h4>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={fetchDocumentStatus}
                  disabled={refreshing}
                  title="Refresh Status"
                >
                  {refreshing ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="fas fa-sync-alt"></i>
                  )}
                </button>
              </div>
              <small className="text-muted">Latest Submission</small>
            </Card>
          </div>
          <div className="col-md-3">
            <Card title="Verification Status" className="text-center">
              <h4 className={`text-${getStatusColor(documentStatus)}`}>
                {getStatusText(documentStatus)}
              </h4>
              <small className="text-muted">
                {getStatusDescription(documentStatus)}
              </small>
            </Card>
          </div>
          <div className="col-md-3">
            <Card title="Total Uploads" className="text-center">
              <h4 className="text-info">{uploadHistory.length}</h4>
              <small className="text-muted">Document Submissions</small>
            </Card>
          </div>
          <div className="col-md-3">
            <Card title="Last Upload" className="text-center">
              <h6 className="text-muted">
                {uploadHistory.length > 0 ? 
                  new Date(uploadHistory[0].submittedAt).toLocaleDateString() : 
                  'No uploads yet'
                }
              </h6>
              <small className="text-muted">Most Recent</small>
            </Card>
          </div>
        </div>
      )}

      {/* Document Upload Section - Always allow uploads */}
      <div className="row mb-4">
          <div className="col-12">
            <Card title="Document Upload" className="dashboard-card">
              {documentStatus?.isSubmitted && (
                <div className="alert alert-warning mb-3">
                  <strong>Second Round Submission:</strong> You are submitting new documents. 
                  Previous verification results will be reset and new verification will be processed.
                </div>
              )}
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">EC Document (PDF)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept=".pdf"
                      onChange={(e) => handleFileChange('EC', e.target.files[0])}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Aadhaar Card (PNG)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept=".png"
                      onChange={(e) => handleFileChange('Aadhaar', e.target.files[0])}
                    />
                    <small className="text-muted">Upload Aadhaar card as PNG image</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">PAN Card (PNG)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept=".png"
                      onChange={(e) => handleFileChange('PAN', e.target.files[0])}
                    />
                    <small className="text-muted">Upload PAN card as PNG image</small>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Button 
                  variant="primary" 
                  onClick={handleDocumentUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Documents'}
                </Button>
              </div>
            </Card>
          </div>
        </div>

      {/* Document Status Section */}
      {documentStatus && (
        <div className="row mb-4">
          <div className="col-12">
            <Card 
              title={
                <div className="d-flex justify-content-between align-items-center">
                  <span>Document Verification Status</span>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchDocumentStatus}
                    disabled={refreshing}
                    title="Refresh Status"
                  >
                    {refreshing ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="fas fa-sync-alt"></i>
                    )}
                  </button>
                </div>
              } 
              className="dashboard-card"
            >
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center">
                    <h6 className="text-muted">Status</h6>
                    <span className={`badge bg-${getStatusColor(documentStatus)}`}>
                      {getStatusText(documentStatus)}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h6 className="text-muted">Risk Score</h6>
                    <span className={`badge bg-${getRiskScoreColor(documentStatus.riskScore)}`}>
                      {documentStatus.riskScore}/100 - {getRiskScoreText(documentStatus.riskScore)}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h6 className="text-muted">Verification Status</h6>
                    <span className={`badge bg-${getStatusColor(documentStatus)}`}>
                      {getStatusText(documentStatus)}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h6 className="text-muted">Submitted</h6>
                    <span className="badge bg-info">
                      {documentStatus.hasDocuments ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Verification Results Section */}
      <div className="row mb-4">
        <div className="col-12">
          {refreshing && (
            <div className="alert alert-info">
              <i className="fas fa-spinner fa-spin me-2"></i>
              Refreshing document status...
            </div>
          )}
          <VerificationResults 
            documentStatus={documentStatus}
            extractedData={extractedData}
            onRefresh={fetchDocumentStatus}
          />
        </div>
      </div>


      {/* Upload History Section */}
      {uploadHistory.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <Card title="Document Upload History" className="dashboard-card">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Upload Date</th>
                      <th>Documents</th>
                      <th>Status</th>
                      <th>Risk Score</th>
                      <th>Verification Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadHistory.map((upload, index) => (
                      <tr key={upload.id || index}>
                        <td>
                          <div>
                            <strong>{new Date(upload.submittedAt).toLocaleDateString()}</strong>
                            <br />
                            <small className="text-muted">
                              {new Date(upload.submittedAt).toLocaleTimeString()}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            <span className={`badge ${upload.ecPath ? 'bg-success' : 'bg-secondary'}`}>
                              EC
                            </span>
                            <span className={`badge ${upload.aadhaarPath ? 'bg-success' : 'bg-secondary'}`}>
                              Aadhaar
                            </span>
                            <span className={`badge ${upload.panPath ? 'bg-success' : 'bg-secondary'}`}>
                              PAN
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${upload.isVerified ? 'bg-success' : 'bg-warning'}`}>
                            {upload.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${upload.isVerified ? 'bg-success' : 'bg-warning'}`}>
                            {upload.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">-</span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => viewUploadDetails(upload)}
                          >
                            View Details
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

      <div className="row">
        <div className="col-md-8">
          <Card title="Your Profile Information" className="dashboard-card">
            {profile ? (
              <div className="row">
                <div className="col-md-3 text-center mb-3">
                  <div className="user-avatar mx-auto">
                    {getInitials(profile.fullName)}
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="row">
                    <div className="col-sm-6">
                      <h6 className="text-muted">Full Name</h6>
                      <p className="mb-3">{profile.fullName}</p>
                    </div>
                    <div className="col-sm-6">
                      <h6 className="text-muted">Email</h6>
                      <p className="mb-3">{profile.email}</p>
                    </div>
                    <div className="col-sm-6">
                      <h6 className="text-muted">Phone</h6>
                      <p className="mb-3">{profile.phone}</p>
                    </div>
                    <div className="col-sm-6">
                      <h6 className="text-muted">Role</h6>
                      <p className="mb-3">
                        <span className="badge bg-primary">{profile.role}</span>
                      </p>
                    </div>
                    <div className="col-sm-6">
                      <h6 className="text-muted">City</h6>
                      <p className="mb-3">{profile.city}</p>
                    </div>
                    <div className="col-sm-6">
                      <h6 className="text-muted">State</h6>
                      <p className="mb-3">{profile.state}</p>
                    </div>
                    <div className="col-sm-6">
                      <h6 className="text-muted">Pincode</h6>
                      <p className="mb-3">{profile.pincode}</p>
                    </div>
                    <div className="col-sm-6">
                      <h6 className="text-muted">Member Since</h6>
                      <p className="mb-3">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">No profile information available.</p>
                <Button variant="primary" onClick={fetchUserProfile}>
                  Refresh Profile
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="col-md-4">
          <Card title="Quick Actions" className="dashboard-card">
            <div className="d-grid gap-2">
              <Button variant="outline-primary" onClick={fetchUserProfile}>
                Refresh Profile
              </Button>
              <Button variant="outline-secondary" onClick={handleEditProfile}>
                Edit Profile
              </Button>
              <Button variant="outline-info" onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </Card>

          <Card title="Account Status" className="dashboard-card">
            <div className="text-center">
              <div className="user-avatar mx-auto mb-3">
                {getInitials(user?.fullName || 'U')}
              </div>
              <h5>{user?.fullName || 'User'}</h5>
              <p className="text-muted">{user?.email}</p>
              <span className="badge bg-success">Active</span>
            </div>
          </Card>
        </div>
      </div>
        </>
      )}

      {/* Activity Tab Content */}
      {activeTab === 'activity' && (
        <div className="row">
          <div className="col-12">
            <Card title="My Activity History" className="dashboard-card">
              {activitiesLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading your activity...</p>
                </div>
              ) : userActivities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No activity found.</p>
                  <Button variant="primary" onClick={fetchUserActivities}>
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className="activity-timeline">
                  {userActivities.map((activity, index) => (
                    <div key={activity.id} className="activity-item mb-3">
                      <div className="row">
                        <div className="col-md-1 text-center">
                          <div className="activity-icon">
                            {activity.activity === 'Login' ? '🔐' : 
                             activity.activity === 'Logout' ? '🚪' :
                             activity.activity === 'Document Upload' ? '📤' :
                             activity.activity === 'Document Extraction' ? '🔍' :
                             activity.activity === 'Document Verification' ? '✅' :
                             activity.activity === 'User Registration' ? '👤' :
                             activity.activity === 'User Update' ? '✏️' :
                             activity.activity === 'View My Activity' ? '📊' :
                             activity.activity === 'Admin Action' ? '⚙️' : '📝'}
                          </div>
                        </div>
                        <div className="col-md-11">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="card-title mb-1">
                                    <span className={`badge ${auditLogsService.getActivityBadgeColor(activity.activity)} me-2`}>
                                      {activity.activity}
                                    </span>
                                    {activity.actionResult && (
                                      <span className={`badge ${auditLogsService.getActionResultBadgeColor(activity.actionResult)}`}>
                                        {activity.actionResult}
                                      </span>
                                    )}
                                  </h6>
                                  <p className="card-text mb-2">{activity.description}</p>
                                  {activity.relatedEntityType && (
                                    <small className="text-muted">
                                      Related: {activity.relatedEntityType} #{activity.relatedEntityId}
                                    </small>
                                  )}
                                </div>
                                <div className="text-end">
                                  <small className="text-muted">
                                    {auditLogsService.formatDateForDisplay(activity.timestamp)}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="card-footer text-center">
                <Button variant="outline-primary" onClick={fetchUserActivities}>
                  Refresh Activity
                </Button>
                <small className="text-muted ms-3">
                  Showing recent {userActivities.length} activities
                </small>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditProfile(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProfileData.fullName}
                    onChange={(e) => setEditProfileData({...editProfileData, fullName: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProfileData.phone}
                    onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProfileData.city}
                    onChange={(e) => setEditProfileData({...editProfileData, city: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProfileData.state}
                    onChange={(e) => setEditProfileData({...editProfileData, state: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProfileData.pincode}
                    onChange={(e) => setEditProfileData({...editProfileData, pincode: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowEditProfile(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveProfile} disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowChangePassword(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowChangePassword(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSavePassword} disabled={updating}>
                  {updating ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
