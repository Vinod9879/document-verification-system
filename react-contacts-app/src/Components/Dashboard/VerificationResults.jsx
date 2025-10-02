import React, { useState, useEffect } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import documentService from '../../Services/documentService';

const VerificationResults = ({ documentStatus, extractedData, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mismatchDetails, setMismatchDetails] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerifyDocuments = async () => {
    try {
      setVerifying(true);
      const result = await documentService.verifyDocuments();
      
      // Refresh the document status to show updated verification
      if (onRefresh) {
        await onRefresh();
      }
      
      alert('Documents verified successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying documents: ' + (error.response?.data?.message || error.message));
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (documentStatus) => {
    if (documentStatus?.isVerified) {
      return <span className="badge bg-success">VERIFIED</span>;
    }
    const status = documentStatus?.verificationStatus || 'Pending';
    const statusColors = {
      'Verified': 'bg-success',
      'Rejected': 'bg-danger', 
      'Under Review': 'bg-warning',
      'Pending': 'bg-warning'
    };
    return <span className={`badge ${statusColors[status] || 'bg-warning'}`}>{status.toUpperCase()}</span>;
  };

  const renderFieldComparison = () => {
    if (!extractedData) {
      // Check if documents have been extracted but data is not yet loaded
      if (documentStatus?.hasExtractedData) {
        return (
          <div className="alert alert-warning">
            <h6>Extracted Data Loading...</h6>
            <p className="mb-0">Document extraction has been completed. Loading extracted data...</p>
            <button className="btn btn-sm btn-outline-primary mt-2" onClick={onRefresh}>
              <i className="fas fa-sync-alt me-1"></i> Refresh Data
            </button>
          </div>
        );
      }
      
      return (
        <div className="alert alert-info">
          <h6>No Extracted Data Available</h6>
          <p className="mb-0">Document extraction is required before field comparison can be performed.</p>
        </div>
      );
    }

    // Enhanced field comparison with better data mapping
    const fields = [
      { 
        key: 'name', 
        label: 'Full Name', 
        aadhaar: extractedData.adhaarFullName || extractedData.aadhaarName || 'N/A', 
        pan: extractedData.panFullName || extractedData.panName || 'N/A', 
        ec: extractedData.name || extractedData.applicantName || 'N/A',
        critical: true
      },
      { 
        key: 'dob', 
        label: 'Date of Birth', 
        aadhaar: extractedData.aadhaarDob || extractedData.dob || 'N/A', 
        pan: extractedData.panDob || extractedData.dob || 'N/A', 
        ec: extractedData.ecDob || extractedData.dob || 'N/A',
        critical: true
      },
      { 
        key: 'fatherName', 
        label: 'Father\'s Name', 
        aadhaar: extractedData.aadhaarFatherName || extractedData.fatherName || 'N/A', 
        pan: extractedData.panFatherName || extractedData.fatherName || 'N/A', 
        ec: extractedData.ecFatherName || extractedData.fatherName || 'N/A',
        critical: false
      },
      { 
        key: 'address', 
        label: 'Address', 
        aadhaar: extractedData.aadhaarAddress || extractedData.address || 'N/A', 
        pan: extractedData.panAddress || extractedData.address || 'N/A', 
        ec: extractedData.ecAddress || extractedData.address || 'N/A',
        critical: false
      },
      { 
        key: 'applicationNumber', 
        label: 'Application Number', 
        aadhaar: 'N/A', 
        pan: 'N/A', 
        ec: extractedData.applicationNumber || 'N/A',
        critical: true
      },
      { 
        key: 'village', 
        label: 'Village', 
        aadhaar: 'N/A', 
        pan: 'N/A', 
        ec: extractedData.village || 'N/A',
        critical: false
      },
      { 
        key: 'district', 
        label: 'District', 
        aadhaar: 'N/A', 
        pan: 'N/A', 
        ec: extractedData.district || 'N/A',
        critical: false
      }
    ];

    return (
      <div>
        <div className="alert alert-info mb-3">
          <h6>Cross-Document Field Analysis</h6>
          <p className="mb-0">Comparing extracted data across Aadhaar, PAN, and EC documents to identify discrepancies.</p>
        </div>
        
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th width="20%">Field</th>
                <th width="25%">Aadhaar Card</th>
                <th width="25%">PAN Card</th>
                <th width="25%">EC Document</th>
                <th width="5%">Status</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const values = [field.aadhaar, field.pan, field.ec].filter(v => v && v !== 'N/A' && v.trim());
                const isMatch = values.length > 1 && values.every(v => v === values[0]);
                const hasData = values.length > 0;
                
                return (
                  <tr key={index} className={field.critical ? 'table-warning' : ''}>
                    <td>
                      <strong>{field.label}</strong>
                      {field.critical && <span className="badge bg-warning ms-2">Critical</span>}
                    </td>
                    <td>
                      <span className={field.aadhaar !== 'N/A' ? 'text-success' : 'text-muted'}>
                        {field.aadhaar}
                      </span>
                    </td>
                    <td>
                      <span className={field.pan !== 'N/A' ? 'text-success' : 'text-muted'}>
                        {field.pan}
                      </span>
                    </td>
                    <td>
                      <span className={field.ec !== 'N/A' ? 'text-success' : 'text-muted'}>
                        {field.ec}
                      </span>
                    </td>
                    <td className="text-center">
                      {!hasData ? (
                        <span className="badge bg-secondary">No Data</span>
                      ) : isMatch ? (
                        <span className="badge bg-success">✓ Match</span>
                      ) : (
                        <span className="badge bg-danger">✗ Mismatch</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-3">
          <h6>Summary:</h6>
          <div className="row">
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <h5 className="text-success">{fields.filter(f => {
                    const values = [f.aadhaar, f.pan, f.ec].filter(v => v && v !== 'N/A' && v.trim());
                    return values.length > 1 && values.every(v => v === values[0]);
                  }).length}</h5>
                  <small>Matching Fields</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <h5 className="text-danger">{fields.filter(f => {
                    const values = [f.aadhaar, f.pan, f.ec].filter(v => v && v !== 'N/A' && v.trim());
                    return values.length > 1 && !values.every(v => v === values[0]);
                  }).length}</h5>
                  <small>Mismatched Fields</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <h5 className="text-warning">{fields.filter(f => f.critical).length}</h5>
                  <small>Critical Fields</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMismatchDetails = () => {
    if (!extractedData) {
      // Check if documents have been extracted but data is not yet loaded
      if (documentStatus?.hasExtractedData) {
        return (
          <div className="alert alert-warning">
            <h6>Mismatch Analysis Loading...</h6>
            <p className="mb-0">Document extraction has been completed. Loading data for mismatch analysis...</p>
            <button className="btn btn-sm btn-outline-primary mt-2" onClick={onRefresh}>
              <i className="fas fa-sync-alt me-1"></i> Refresh Data
            </button>
          </div>
        );
      }
      
      return (
        <div className="alert alert-info">
          <h6>No Mismatch Analysis Available</h6>
          <p className="mb-0">Document extraction is required before mismatch analysis can be performed.</p>
        </div>
      );
    }

    // Analyze mismatches from extracted data
    const fields = [
      { 
        key: 'name', 
        label: 'Full Name', 
        aadhaar: extractedData.adhaarFullName || extractedData.aadhaarName || 'N/A', 
        pan: extractedData.panFullName || extractedData.panName || 'N/A', 
        ec: extractedData.name || extractedData.applicantName || 'N/A'
      },
      { 
        key: 'dob', 
        label: 'Date of Birth', 
        aadhaar: extractedData.aadhaarDob || extractedData.dob || 'N/A', 
        pan: extractedData.panDob || extractedData.dob || 'N/A', 
        ec: extractedData.ecDob || extractedData.dob || 'N/A'
      },
      { 
        key: 'fatherName', 
        label: 'Father\'s Name', 
        aadhaar: extractedData.aadhaarFatherName || extractedData.fatherName || 'N/A', 
        pan: extractedData.panFatherName || extractedData.fatherName || 'N/A', 
        ec: extractedData.ecFatherName || extractedData.fatherName || 'N/A'
      }
    ];

    const mismatches = fields.filter(field => {
      const values = [field.aadhaar, field.pan, field.ec].filter(v => v && v !== 'N/A' && v.trim());
      return values.length > 1 && !values.every(v => v === values[0]);
    });

    if (mismatches.length === 0) {
      return (
        <div>
          <div className="alert alert-success">
            <div className="d-flex align-items-center">
              <i className="fas fa-check-circle fa-2x text-success me-3"></i>
              <div>
                <h6 className="mb-1">✅ No Mismatches Detected</h6>
                <p className="mb-0">All critical fields match across the submitted documents.</p>
              </div>
            </div>
          </div>
          
          <div className="card border-success">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Document Verification Summary
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-success">✅ Verification Status</h6>
                  <ul className="list-unstyled">
                    <li><i className="fas fa-check text-success me-2"></i>Name matches across all documents</li>
                    <li><i className="fas fa-check text-success me-2"></i>Date of Birth is consistent</li>
                    <li><i className="fas fa-check text-success me-2"></i>Father's name aligns properly</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-success">📊 Quality Score</h6>
                  <div className="progress mb-2" style={{height: '20px'}}>
                    <div className="progress-bar bg-success" role="progressbar" style={{width: '100%'}}>
                      100% Match
                    </div>
                  </div>
                  <small className="text-muted">All critical fields verified successfully</small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="alert alert-info">
              <h6><i className="fas fa-info-circle me-2"></i>Next Steps</h6>
              <p className="mb-0">Your documents have passed the initial verification. The admin will now perform a detailed review before final approval.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="alert alert-warning">
          <h6>⚠️ Mismatches Detected</h6>
          <p className="mb-0">The following fields show discrepancies between documents:</p>
        </div>

        {mismatches.map((field, index) => {
          const values = [field.aadhaar, field.pan, field.ec].filter(v => v && v !== 'N/A' && v.trim());
          const uniqueValues = [...new Set(values)];
          
          return (
            <div key={index} className="card mb-3">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {field.label} Mismatch
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="border rounded p-2 bg-light">
                      <strong>Aadhaar:</strong><br/>
                      <span className={field.aadhaar !== 'N/A' ? 'text-primary' : 'text-muted'}>
                        {field.aadhaar}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-2 bg-light">
                      <strong>PAN:</strong><br/>
                      <span className={field.pan !== 'N/A' ? 'text-primary' : 'text-muted'}>
                        {field.pan}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-2 bg-light">
                      <strong>EC:</strong><br/>
                      <span className={field.ec !== 'N/A' ? 'text-primary' : 'text-muted'}>
                        {field.ec}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    <strong>Issue:</strong> Found {uniqueValues.length} different values for this field
                  </small>
                </div>
              </div>
            </div>
          );
        })}

        <div className="alert alert-info">
          <h6>Recommendations:</h6>
          <ul className="mb-0">
            <li>Review the mismatched fields carefully</li>
            <li>Ensure all documents belong to the same person</li>
            <li>Check for typos or data entry errors</li>
            <li>Contact support if discrepancies are legitimate</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderDocumentStatus = () => {
    // Check if documents are submitted based on documentStatus
    const hasDocuments = documentStatus?.hasDocuments || false;
    
    const documents = [
      { 
        name: 'Aadhaar', 
        status: hasDocuments ? 'Uploaded' : 'Not Uploaded', 
        confidence: extractedData?.aadhaar?.confidenceScore || extractedData?.confidenceScore 
      },
      { 
        name: 'PAN', 
        status: hasDocuments ? 'Uploaded' : 'Not Uploaded', 
        confidence: extractedData?.pan?.confidenceScore || extractedData?.confidenceScore 
      },
      { 
        name: 'EC', 
        status: hasDocuments ? 'Uploaded' : 'Not Uploaded', 
        confidence: extractedData?.ec?.confidenceScore || extractedData?.confidenceScore 
      }
    ];

    return (
      <div className="row">
        {documents.map((doc, index) => (
          <div key={index} className="col-md-4 mb-3">
            <Card className="h-100">
              <div className="card-body text-center">
                <h6 className="card-title">{doc.name}</h6>
                <p className={`badge ${doc.status === 'Uploaded' ? 'bg-success' : 'bg-secondary'}`}>
                  {doc.status}
                </p>
                {doc.confidence && (
                  <div className="mt-2">
                    <small className="text-muted">Confidence: {doc.confidence}%</small>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  if (!documentStatus) {
    return (
      <Card title="Verification Results">
        <div className="text-center py-4">
          <p className="text-muted">No verification results available yet.</p>
          <Button variant="primary" onClick={onRefresh}>
            Refresh Status
          </Button>
        </div>
      </Card>
    );
  }


  return (
    <div className="verification-results">
      <Card title="Document Verification Results">
        {/* Status Overview */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="text-center">
              <h4 className="text-success">📋</h4>
              <h5>Status</h5>
              {getStatusBadge(documentStatus)}
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4 className="text-info">📊</h4>
              <h5>Verification</h5>
              <span className={`badge ${documentStatus?.verificationStatus === 'Verified' ? 'bg-success' : documentStatus?.verificationStatus === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>
                {documentStatus?.verificationStatus || 'PENDING'}
              </span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4>{documentStatus?.hasDocuments ? '✅' : '⏳'}</h4>
              <h5>Submission</h5>
              <span className={`badge ${documentStatus?.hasDocuments ? 'bg-success' : 'bg-warning'}`}>
                {documentStatus?.hasDocuments ? 'Submitted' : 'Pending'}
              </span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4>{documentStatus?.isVerified ? '✅' : '⏳'}</h4>
              <h5>Verification</h5>
              <span className={`badge ${documentStatus?.isVerified ? 'bg-success' : 'bg-warning'}`}>
                {documentStatus?.isVerified ? 'Verified' : (documentStatus?.verificationStatus || 'Pending')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              Field Comparison
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Document Status
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'mismatches' ? 'active' : ''}`}
              onClick={() => setActiveTab('mismatches')}
            >
              Mismatches
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <div className={`alert ${documentStatus?.isVerified ? 'alert-success' : documentStatus?.verificationStatus === 'Rejected' ? 'alert-danger' : 'alert-info'}`}>
              <h6>Verification Summary</h6>
              <p className="mb-0">
                {documentStatus?.isVerified ? 'All documents have been successfully verified.' :
                 documentStatus?.verificationStatus === 'Rejected' ? 'Documents have been rejected. Please review and resubmit.' :
                 documentStatus?.verificationStatus === 'Under Review' ? 'Documents are currently under review by the admin.' :
                 'Document verification is pending. Please wait for admin review.'}
              </p>
              {documentStatus?.riskScore && (
                <div className="mt-2">
                  <strong>Risk Score:</strong> {documentStatus.riskScore}/100 - 
                  <span className={`badge ms-2 ${documentStatus.riskScore >= 80 ? 'bg-danger' : documentStatus.riskScore >= 50 ? 'bg-warning' : 'bg-success'}`}>
                    {documentStatus.riskScore >= 80 ? 'High Risk' : documentStatus.riskScore >= 50 ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </div>
              )}
              
              {/* Verification Button */}
              {documentStatus?.hasExtractedData && !documentStatus?.isVerified && documentStatus?.verificationStatus !== 'Rejected' && (
                <div className="mt-3">
                  <button 
                    className="btn btn-primary"
                    onClick={handleVerifyDocuments}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        Verify Documents
                      </>
                    )}
                  </button>
                  <small className="text-muted d-block mt-1">
                    Click to verify your documents against the database
                  </small>
                </div>
              )}
            </div>
            
          </div>
        )}

        {activeTab === 'comparison' && (
          <div>
            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-table fa-lg text-info me-3"></i>
              <div>
                <h6 className="mb-1">Cross-Document Field Comparison</h6>
                <small className="text-muted">Side-by-side comparison of extracted data across all submitted documents</small>
              </div>
            </div>
            {renderFieldComparison()}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h6>Document Upload Status</h6>
            {renderDocumentStatus()}
          </div>
        )}

        {activeTab === 'mismatches' && (
          <div>
            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-search-plus fa-lg text-primary me-3"></i>
              <div>
                <h6 className="mb-1">Detailed Mismatch Analysis</h6>
                <small className="text-muted">Comprehensive cross-document field verification and discrepancy detection</small>
              </div>
            </div>
            {renderMismatchDetails()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 d-flex gap-2">
          <Button variant="primary" onClick={onRefresh}>
            Refresh Status
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VerificationResults;
