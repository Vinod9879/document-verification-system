import React, { useState, useEffect } from 'react';
import auditLogsService from '../../Services/AuditLogsService';
import Card from '../Common/Card';
import Button from '../Common/Button';

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    activity: '',
    startDate: '',
    endDate: ''
  });
  
  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    totalCount: 0
  });
  
  // View states
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMyActivity();
  }, [pagination.page, pagination.pageSize]);

  const fetchMyActivity = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await auditLogsService.getMyActivity(
        filters.activity || null,
        filters.startDate ? auditLogsService.formatDateForAPI(filters.startDate) : null,
        filters.endDate ? auditLogsService.formatDateForAPI(filters.endDate) : null,
        pagination.page,
        pagination.pageSize
      );
      
      setActivities(response.logs || []);
      setPagination(prev => ({
        ...prev,
        totalCount: response.pagination?.totalCount || 0
      }));
      
    } catch (error) {
      console.error('Error fetching my activity:', error);
      setError(error.response?.data?.message || 'Failed to fetch your activity');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMyActivity();
  };

  const handleClearFilters = () => {
    setFilters({
      activity: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    fetchMyActivity();
    setMessage('Activity refreshed successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const getActivityIcon = (activity) => {
    const icons = {
      'Login': '🔐',
      'Logout': '🚪',
      'Document Upload': '📤',
      'Document Extraction': '🔍',
      'Document Verification': '✅',
      'User Registration': '👤',
      'User Update': '✏️',
      'View My Activity': '📊',
      'Admin Action': '⚙️'
    };
    
    return icons[activity] || '📝';
  };

  const getActivityDescription = (activity) => {
    const descriptions = {
      'Login': 'You logged into your account',
      'Logout': 'You logged out of your account',
      'Document Upload': 'You uploaded documents for verification',
      'Document Extraction': 'Your documents were processed for data extraction',
      'Document Verification': 'Your documents were verified by admin',
      'User Registration': 'You created your account',
      'User Update': 'You updated your profile information',
      'View My Activity': 'You viewed your activity history',
      'Admin Action': 'An admin performed an action on your account'
    };
    
    return descriptions[activity] || activity;
  };

  if (loading) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="mt-5 text-center">
            <div className="card-body">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your activity...</p>
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
            <h1 className="h2 mb-0">My Activity</h1>
            <Button variant="primary" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {message && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <Card title="Filter Activity" className="mb-4">
            <div className="row">
              <div className="col-md-3">
                <label className="form-label">Activity Type</label>
                <select
                  className="form-select"
                  value={filters.activity}
                  onChange={(e) => handleFilterChange('activity', e.target.value)}
                >
                  <option value="">All Activities</option>
                  <option value="Login">Login</option>
                  <option value="Logout">Logout</option>
                  <option value="Document Upload">Document Upload</option>
                  <option value="Document Extraction">Document Extraction</option>
                  <option value="Document Verification">Document Verification</option>
                  <option value="User Registration">User Registration</option>
                  <option value="User Update">User Update</option>
                  <option value="View My Activity">View My Activity</option>
                  <option value="Admin Action">Admin Action</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div className="col-md-3 d-flex align-items-end gap-2">
                <Button variant="primary" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="row">
        <div className="col-12">
          <Card title={`Your Activity History (${pagination.totalCount} total)`} className="dashboard-card">
            {activities.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No activity found.</p>
                <Button variant="primary" onClick={handleRefresh}>
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="activity-timeline">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="activity-item mb-3">
                    <div className="row">
                      <div className="col-md-1 text-center">
                        <div className="activity-icon">
                          {getActivityIcon(activity.activity)}
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
                                <br />
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleViewDetails(activity)}
                                  className="mt-1"
                                >
                                  Details
                                </Button>
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
          </Card>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalCount > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                  {pagination.totalCount} entries
                </span>
              </div>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <div className="btn-group">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page * pagination.pageSize >= pagination.totalCount}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedActivity && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {getActivityIcon(selectedActivity.activity)} Activity Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted">Activity Information</h6>
                    <p><strong>Type:</strong> 
                      <span className={`badge ${auditLogsService.getActivityBadgeColor(selectedActivity.activity)} ms-2`}>
                        {selectedActivity.activity}
                      </span>
                    </p>
                    <p><strong>Result:</strong> 
                      {selectedActivity.actionResult && (
                        <span className={`badge ${auditLogsService.getActionResultBadgeColor(selectedActivity.actionResult)} ms-2`}>
                          {selectedActivity.actionResult}
                        </span>
                      )}
                    </p>
                    <p><strong>Timestamp:</strong> {auditLogsService.formatDateForDisplay(selectedActivity.timestamp)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">Technical Details</h6>
                    <p><strong>IP Address:</strong> {selectedActivity.ipAddress || 'N/A'}</p>
                    <p><strong>User Agent:</strong> {selectedActivity.userAgent || 'N/A'}</p>
                    {selectedActivity.relatedEntityType && (
                      <p><strong>Related:</strong> {selectedActivity.relatedEntityType} #{selectedActivity.relatedEntityId}</p>
                    )}
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12">
                    <h6 className="text-muted">Description</h6>
                    <p>{selectedActivity.description}</p>
                  </div>
                </div>

                {selectedActivity.additionalData && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <h6 className="text-muted">Additional Information</h6>
                      <pre className="bg-light p-3 rounded">
                        {JSON.stringify(JSON.parse(selectedActivity.additionalData), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .activity-timeline {
          position: relative;
        }
        
        .activity-item {
          position: relative;
        }
        
        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          border: 2px solid #dee2e6;
        }
        
        .activity-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 19px;
          top: 40px;
          width: 2px;
          height: calc(100% + 1rem);
          background: #dee2e6;
          z-index: 1;
        }
        
        .activity-item .card {
          border-left: 3px solid #007bff;
        }
      `}</style>
    </div>
  );
};

export default UserActivity;
