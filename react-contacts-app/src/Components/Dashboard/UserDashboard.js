import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Services/AuthService';
import userService from '../../Services/UserService';
import documentService from '../../Services/DocumentService';
import Card from '../Common/Card';
import Button from '../Common/Button';
import VerificationResults from './VerificationResults';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Document verification states
  const [documentStatus, setDocumentStatus] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({
    EC: null,
    Aadhaar: null,
    PAN: null
  });

  useEffect(() => {
    fetchUserProfile();
    fetchDocumentStatus();
    fetchUploadHistory();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getUserById(user.id);
      setProfile(profileData);
    } catch (error) {
      setMessage('Failed to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentStatus = async () => {
    try {
      const status = await documentService.getDocumentStatus();
      console.log('Document status response:', status);
      setDocumentStatus(status);
      
      if (status && status.extractedData) {
        const extracted = await documentService.getExtractedData();
        console.log('Extracted data response:', extracted);
        setExtractedData(extracted);
      }
    } catch (error) {
      console.log('No documents uploaded yet or API error:', error);
      // Don't set mock data - let the user upload real documents
      setDocumentStatus(null);
      setExtractedData(null);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      const history = await documentService.getUploadHistory();
      console.log('Upload history response:', history);
      
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
      console.log('No upload history available:', error);
      // No mock data - show empty state
      setUploadHistory([]);
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
      
      // Refresh data
      await fetchDocumentStatus();
      await fetchUploadHistory();
      
      // Clear selected files
      setSelectedFiles({ EC: null, Aadhaar: null, PAN: null });
    } catch (error) {
      setMessage('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleVerification = async () => {
    try {
      setVerifying(true);
      setMessage('');
      
      await documentService.verifyDocuments();
      setMessage('Verification process initiated. Please wait...');
      
      // Refresh status
      await fetchDocumentStatus();
    } catch (error) {
      setMessage('Failed to start verification. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const getRiskScoreColor = (score) => {
    if (score <= 30) return 'success';
    if (score <= 70) return 'warning';
    return 'danger';
  };

  const getRiskScoreText = (score) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 70) return 'Medium Risk';
    return 'High Risk';
  };

  const viewUploadDetails = (upload) => {
    // Show detailed information about the upload
    const details = `
Upload Date: ${new Date(upload.submittedAt).toLocaleString()}
Status: ${upload.isVerified ? 'Verified' : 'Pending'}
Risk Score: ${upload.riskScore}/100 - ${getRiskScoreText(upload.riskScore)}
Documents: ${upload.ecPath ? 'EC ✓' : 'EC ✗'} | ${upload.aadhaarPath ? 'Aadhaar ✓' : 'Aadhaar ✗'} | ${upload.panPath ? 'PAN ✓' : 'PAN ✗'}
Verification Notes: ${upload.verificationNotes || 'None'}
Field Mismatches: ${upload.fieldMismatches || 'None'}
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
          <h1 className="h2 mb-4">Welcome, {user?.fullName || 'User'}!</h1>
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

      {/* Document Summary Section */}
      {documentStatus && (
        <div className="row mb-4">
          <div className="col-md-3">
            <Card title="Current Status" className="text-center">
              <h4 className={`text-${documentStatus.isVerified ? 'success' : 'warning'}`}>
                {documentStatus.isVerified ? '✅ Verified' : '⏳ Pending'}
              </h4>
              <small className="text-muted">Latest Submission</small>
            </Card>
          </div>
          <div className="col-md-3">
            <Card title="Risk Score" className="text-center">
              <h4 className={`text-${getRiskScoreColor(documentStatus.riskScore)}`}>
                {documentStatus.riskScore}/100
              </h4>
              <small className="text-muted">{getRiskScoreText(documentStatus.riskScore)}</small>
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
                    <label className="form-label">Aadhaar Card (PDF)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept=".pdf"
                      onChange={(e) => handleFileChange('Aadhaar', e.target.files[0])}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">PAN Card (PDF)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept=".pdf"
                      onChange={(e) => handleFileChange('PAN', e.target.files[0])}
                    />
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
            <Card title="Document Verification Status" className="dashboard-card">
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center">
                    <h6 className="text-muted">Status</h6>
                    <span className={`badge bg-${documentStatus.isVerified ? 'success' : 'warning'}`}>
                      {documentStatus.isVerified ? 'Verified' : 'Pending'}
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
                    <h6 className="text-muted">Submitted</h6>
                    <span className="badge bg-info">
                      {documentStatus.isSubmitted ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <Button 
                      variant="outline-primary" 
                      onClick={handleVerification}
                      disabled={verifying || !documentStatus.isSubmitted}
                    >
                      {verifying ? 'Verifying...' : 'Verify Documents'}
                    </Button>
                  </div>
                </div>
              </div>
              {documentStatus.verificationNotes && (
                <div className="mt-3">
                  <h6>Verification Notes:</h6>
                  <p className="text-muted">{documentStatus.verificationNotes}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Verification Results Section */}
      <div className="row mb-4">
        <div className="col-12">
          <VerificationResults 
            documentStatus={documentStatus}
            extractedData={extractedData}
            onRefresh={fetchDocumentStatus}
          />
        </div>
      </div>

      {/* Extracted Data Section */}
      {extractedData && (
        <div className="row mb-4">
          <div className="col-12">
            <Card title="Extracted Document Data" className="dashboard-card">
              <div className="row">
                <div className="col-md-4">
                  <h6>EC Document:</h6>
                  <ul className="list-unstyled">
                    <li><strong>Name:</strong> {extractedData.name || 'N/A'}</li>
                    <li><strong>Survey No:</strong> {extractedData.surveyNumber || 'N/A'}</li>
                    <li><strong>Address:</strong> {extractedData.address || 'N/A'}</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>Aadhaar Card:</h6>
                  <ul className="list-unstyled">
                    <li><strong>Name:</strong> {extractedData.name || 'N/A'}</li>
                    <li><strong>Aadhaar No:</strong> {extractedData.aadhaarNumber || 'N/A'}</li>
                    <li><strong>DOB:</strong> {extractedData.dob || 'N/A'}</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>PAN Card:</h6>
                  <ul className="list-unstyled">
                    <li><strong>Name:</strong> {extractedData.name || 'N/A'}</li>
                    <li><strong>PAN No:</strong> {extractedData.panNumber || 'N/A'}</li>
                    <li><strong>DOB:</strong> {extractedData.dob || 'N/A'}</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

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
                          <span className={`badge ${getRiskScoreColor(upload.riskScore)}`}>
                            {upload.riskScore}/100 - {getRiskScoreText(upload.riskScore)}
                          </span>
                        </td>
                        <td>
                          {upload.verificationNotes ? (
                            <small className="text-muted">{upload.verificationNotes}</small>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
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
              <Button variant="outline-secondary" disabled>
                Edit Profile (Coming Soon)
              </Button>
              <Button variant="outline-info" disabled>
                Change Password (Coming Soon)
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
    </div>
  );
};

export default UserDashboard;
