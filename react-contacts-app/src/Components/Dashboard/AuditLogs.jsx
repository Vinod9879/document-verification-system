import React, { useState, useEffect } from 'react';
import auditLogsService from '../../Services/AuditLogsService';
import Card from '../Common/Card';
import Button from '../Common/Button';

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    userId: '',
    activity: '',
    startDate: '',
    endDate: '',
    entityType: '',
    entityId: ''
  });
  
  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalCount: 0
  });
  
  // View states
  const [activeView, setActiveView] = useState('all'); // 'all', 'byUser', 'byActivity', 'byEntity', 'byDate'
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [activeView, pagination.page, pagination.pageSize]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      switch (activeView) {
        case 'all':
          response = await auditLogsService.getAllAuditLogs(pagination.page, pagination.pageSize);
          break;
        case 'byUser':
          if (!filters.userId) {
            setError('Please enter a User ID');
            return;
          }
          response = await auditLogsService.getAuditLogsByUser(filters.userId, pagination.page, pagination.pageSize);
          break;
        case 'byActivity':
          if (!filters.activity) {
            setError('Please enter an Activity');
            return;
          }
          response = await auditLogsService.getAuditLogsByActivity(filters.activity, pagination.page, pagination.pageSize);
          break;
        case 'byEntity':
          if (!filters.entityType || !filters.entityId) {
            setError('Please enter Entity Type and Entity ID');
            return;
          }
          response = await auditLogsService.getAuditLogsByEntity(filters.entityType, filters.entityId, pagination.page, pagination.pageSize);
          break;
        case 'byDate':
          if (!filters.startDate || !filters.endDate) {
            setError('Please enter Start Date and End Date');
            return;
          }
          response = await auditLogsService.getAuditLogsByDateRange(
            auditLogsService.formatDateForAPI(filters.startDate),
            auditLogsService.formatDateForAPI(filters.endDate),
            pagination.page,
            pagination.pageSize
          );
          break;
        default:
          response = await auditLogsService.getAllAuditLogs(pagination.page, pagination.pageSize);
      }
      
      setAuditLogs(response.logs || []);
      setPagination(prev => ({
        ...prev,
        totalCount: response.pagination?.totalCount || 0
      }));
      
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError(error.response?.data?.message || 'Failed to fetch audit logs');
      setAuditLogs([]);
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

  const handleViewChange = (view) => {
    setActiveView(view);
    setFilters({
      userId: '',
      activity: '',
      startDate: '',
      endDate: '',
      entityType: '',
      entityId: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    fetchAuditLogs();
    setMessage('Audit logs refreshed successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const renderFilters = () => {
    switch (activeView) {
      case 'byUser':
        return (
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">User ID</label>
              <input
                type="number"
                className="form-control"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                placeholder="Enter User ID"
              />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <Button variant="primary" onClick={fetchAuditLogs}>
                Search
              </Button>
            </div>
          </div>
        );
      
      case 'byActivity':
        return (
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Activity</label>
              <select
                className="form-select"
                value={filters.activity}
                onChange={(e) => handleFilterChange('activity', e.target.value)}
              >
                <option value="">Select Activity</option>
                <option value="Login">Login</option>
                <option value="Logout">Logout</option>
                <option value="Document Upload">Document Upload</option>
                <option value="Document Extraction">Document Extraction</option>
                <option value="Document Verification">Document Verification</option>
                <option value="User Registration">User Registration</option>
                <option value="User Update">User Update</option>
                <option value="User Delete">User Delete</option>
                <option value="View My Activity">View My Activity</option>
                <option value="View Audit Logs">View Audit Logs</option>
                <option value="Admin Action">Admin Action</option>
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <Button variant="primary" onClick={fetchAuditLogs}>
                Search
              </Button>
            </div>
          </div>
        );
      
      case 'byEntity':
        return (
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Entity Type</label>
              <select
                className="form-select"
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
              >
                <option value="">Select Entity Type</option>
                <option value="Upload">Upload</option>
                <option value="Extraction">Extraction</option>
                <option value="Verification">Verification</option>
                <option value="User">User</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Entity ID</label>
              <input
                type="number"
                className="form-control"
                value={filters.entityId}
                onChange={(e) => handleFilterChange('entityId', e.target.value)}
                placeholder="Enter Entity ID"
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <Button variant="primary" onClick={fetchAuditLogs}>
                Search
              </Button>
            </div>
          </div>
        );
      
      case 'byDate':
        return (
          <div className="row mb-3">
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
            <div className="col-md-6 d-flex align-items-end">
              <Button variant="primary" onClick={fetchAuditLogs}>
                Search
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
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
              <p className="mt-3">Loading audit logs...</p>
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
            <h1 className="h2 mb-0">Audit Logs</h1>
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

      {/* View Selection */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeView === 'all' ? 'active' : ''}`}
                onClick={() => handleViewChange('all')}
              >
                All Logs
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeView === 'byUser' ? 'active' : ''}`}
                onClick={() => handleViewChange('byUser')}
              >
                By User
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeView === 'byActivity' ? 'active' : ''}`}
                onClick={() => handleViewChange('byActivity')}
              >
                By Activity
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeView === 'byEntity' ? 'active' : ''}`}
                onClick={() => handleViewChange('byEntity')}
              >
                By Entity
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeView === 'byDate' ? 'active' : ''}`}
                onClick={() => handleViewChange('byDate')}
              >
                By Date Range
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Audit Logs Table */}
      <div className="row">
        <div className="col-12">
          <Card title={`Audit Logs (${pagination.totalCount} total)`} className="dashboard-card">
            {auditLogs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No audit logs found.</p>
                <Button variant="primary" onClick={handleRefresh}>
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Activity</th>
                      <th>Description</th>
                      <th>Result</th>
                      <th>IP Address</th>
                      <th>Timestamp</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <div>
                            <strong>{log.userName || 'Unknown'}</strong>
                            <br />
                            <small className="text-muted">{log.userEmail || 'N/A'}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${auditLogsService.getActivityBadgeColor(log.activity)}`}>
                            {log.activity}
                          </span>
                        </td>
                        <td>
                          <div style={{ maxWidth: '300px' }}>
                            <div className="text-truncate" title={log.description}>
                              {log.description}
                            </div>
                            {log.relatedEntityType && (
                              <small className="text-muted">
                                Related: {log.relatedEntityType} #{log.relatedEntityId}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          {log.actionResult && (
                            <span className={`badge ${auditLogsService.getActionResultBadgeColor(log.actionResult)}`}>
                              {log.actionResult}
                            </span>
                          )}
                        </td>
                        <td>
                          <small className="text-muted">{log.ipAddress || 'N/A'}</small>
                        </td>
                        <td>
                          <small>{auditLogsService.formatDateForDisplay(log.timestamp)}</small>
                        </td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
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
      {showDetailsModal && selectedLog && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Audit Log Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted">User Information</h6>
                    <p><strong>Name:</strong> {selectedLog.userName || 'Unknown'}</p>
                    <p><strong>Email:</strong> {selectedLog.userEmail || 'N/A'}</p>
                    <p><strong>User ID:</strong> {selectedLog.userId}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">Activity Details</h6>
                    <p><strong>Activity:</strong> 
                      <span className={`badge ${auditLogsService.getActivityBadgeColor(selectedLog.activity)} ms-2`}>
                        {selectedLog.activity}
                      </span>
                    </p>
                    <p><strong>Result:</strong> 
                      {selectedLog.actionResult && (
                        <span className={`badge ${auditLogsService.getActionResultBadgeColor(selectedLog.actionResult)} ms-2`}>
                          {selectedLog.actionResult}
                        </span>
                      )}
                    </p>
                    <p><strong>Timestamp:</strong> {auditLogsService.formatDateForDisplay(selectedLog.timestamp)}</p>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12">
                    <h6 className="text-muted">Description</h6>
                    <p>{selectedLog.description}</p>
                  </div>
                </div>

                {selectedLog.relatedEntityType && (
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <h6 className="text-muted">Related Entity</h6>
                      <p><strong>Type:</strong> {selectedLog.relatedEntityType}</p>
                      <p><strong>ID:</strong> {selectedLog.relatedEntityId}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Technical Details</h6>
                      <p><strong>IP Address:</strong> {selectedLog.ipAddress || 'N/A'}</p>
                      <p><strong>User Agent:</strong> {selectedLog.userAgent || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {selectedLog.additionalData && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <h6 className="text-muted">Additional Data</h6>
                      <pre className="bg-light p-3 rounded">
                        {JSON.stringify(JSON.parse(selectedLog.additionalData), null, 2)}
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
    </div>
  );
};

export default AuditLogs;
