import React, { useState, useEffect } from 'react';
import documentService from '../../Services/documentService';

const VerificationResultsModal = ({ uploadId, isOpen, onClose }) => {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && uploadId) {
      fetchVerificationResults();
    }
  }, [isOpen, uploadId]);

  const fetchVerificationResults = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching verification results for uploadId:', uploadId);
      const data = await documentService.getVerificationResults(uploadId);
      console.log('API Response:', data);
      setVerificationData(data);
    } catch (error) {
      console.error('Error fetching verification results:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to fetch verification results: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Match': return '✅';
      case 'Mismatch': return '❌';
      case 'No Data': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Match': return 'success';
      case 'Mismatch': return 'danger';
      case 'No Data': return 'warning';
      default: return 'secondary';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High Risk': return 'danger';
      case 'Medium Risk': return 'warning';
      case 'Low Risk': return 'success';
      default: return 'secondary';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-clipboard-check me-2"></i>
              Verification Results - Document #{uploadId}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading verification results...</p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

             {verificationData && (
               <>
                 {/* Tab Navigation */}
                 <ul className="nav nav-tabs mb-4" id="verificationTabs" role="tablist">
                   <li className="nav-item" role="presentation">
                     <button 
                       className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                       onClick={() => setActiveTab('overview')}
                       type="button"
                     >
                       <i className="fas fa-chart-pie me-2"></i>Overview
                     </button>
                   </li>
                   <li className="nav-item" role="presentation">
                     <button 
                       className={`nav-link ${activeTab === 'fieldComparison' ? 'active' : ''}`}
                       onClick={() => setActiveTab('fieldComparison')}
                       type="button"
                     >
                       <i className="fas fa-list-check me-2"></i>Field Comparison
                     </button>
                   </li>
                   <li className="nav-item" role="presentation">
                     <button 
                       className={`nav-link ${activeTab === 'documentStatus' ? 'active' : ''}`}
                       onClick={() => setActiveTab('documentStatus')}
                       type="button"
                     >
                       <i className="fas fa-file-alt me-2"></i>Document Status
                     </button>
                   </li>
                   <li className="nav-item" role="presentation">
                     <button 
                       className={`nav-link ${activeTab === 'mismatches' ? 'active' : ''}`}
                       onClick={() => setActiveTab('mismatches')}
                       type="button"
                     >
                       <i className="fas fa-exclamation-triangle me-2"></i>Mismatches
                     </button>
                   </li>
                   <li className="nav-item" role="presentation">
                     <button 
                       className={`nav-link ${activeTab === 'crossDocument' ? 'active' : ''}`}
                       onClick={() => setActiveTab('crossDocument')}
                       type="button"
                     >
                       <i className="fas fa-exchange-alt me-2"></i>Cross-Document Analysis
                     </button>
                   </li>
                 </ul>

                 {/* Tab Content */}
                 <div className="tab-content">
                   {/* Overview Tab */}
                   {activeTab === 'overview' && (
                     <div className="tab-pane fade show active">
                       {/* Header Information */}
                       <div className="row mb-4">
                         <div className="col-md-6">
                           <div className="card border-0 bg-light">
                             <div className="card-body">
                               <h6 className="card-title">
                                 <i className="fas fa-user me-2"></i>User Information
                               </h6>
                               <p className="mb-1"><strong>Name:</strong> {verificationData.UserName || verificationData.userName}</p>
                               <p className="mb-1"><strong>Email:</strong> {verificationData.UserEmail || verificationData.userEmail}</p>
                               <p className="mb-0"><strong>Uploaded:</strong> {new Date(verificationData.UploadedAt || verificationData.uploadedAt).toLocaleString()}</p>
                             </div>
                           </div>
                         </div>
                         <div className="col-md-6">
                           <div className="card border-0 bg-light">
                             <div className="card-body">
                               <h6 className="card-title">
                                 <i className="fas fa-shield-alt me-2"></i>Verification Summary
                               </h6>
                               <p className="mb-1">
                                 <strong>Status:</strong> 
                                 <span className={`badge bg-${getRiskColor(verificationData.RiskLevel || verificationData.riskLevel)} ms-2`}>
                                   {verificationData.VerificationStatus || verificationData.verificationStatus}
                                 </span>
                               </p>
                               <p className="mb-1"><strong>Risk Score:</strong> {verificationData.RiskScore || verificationData.riskScore}/100</p>
                               <p className="mb-0"><strong>Risk Level:</strong> 
                                 <span className={`badge bg-${getRiskColor(verificationData.RiskLevel || verificationData.riskLevel)} ms-2`}>
                                   {verificationData.RiskLevel || verificationData.riskLevel}
                                 </span>
                               </p>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Statistics */}
                       <div className="row mb-4">
                         <div className="col-md-3">
                           <div className="card text-center">
                             <div className="card-body">
                               <h4 className="text-success">{verificationData.Statistics?.MatchedFields || verificationData.statistics?.matchedFields || 0}</h4>
                               <p className="card-text">Matched Fields</p>
                             </div>
                           </div>
                         </div>
                         <div className="col-md-3">
                           <div className="card text-center">
                             <div className="card-body">
                               <h4 className="text-danger">{verificationData.Statistics?.MismatchedFields || verificationData.statistics?.mismatchedFields || 0}</h4>
                               <p className="card-text">Mismatched Fields</p>
                             </div>
                           </div>
                         </div>
                         <div className="col-md-3">
                           <div className="card text-center">
                             <div className="card-body">
                               <h4 className="text-warning">{verificationData.Statistics?.NoDataFields || verificationData.statistics?.noDataFields || 0}</h4>
                               <p className="card-text">No Data Fields</p>
                             </div>
                           </div>
                         </div>
                         <div className="col-md-3">
                           <div className="card text-center">
                             <div className="card-body">
                               <h4 className="text-info">{verificationData.Statistics?.MatchPercentage || verificationData.statistics?.matchPercentage || 0}%</h4>
                               <p className="card-text">Match Percentage</p>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Recommendations */}
                       <div className="card">
                         <div className="card-header">
                           <h6 className="mb-0">
                             <i className="fas fa-lightbulb me-2"></i>
                             Recommendations
                           </h6>
                         </div>
                         <div className="card-body">
                           {verificationData.riskLevel === 'High Risk' ? (
                             <div className="alert alert-danger">
                               <h6 className="alert-heading">High Risk - Immediate Action Required</h6>
                               <ul className="mb-0">
                                 <li>Multiple field mismatches detected</li>
                                 <li>Manual review recommended</li>
                                 <li>Contact user for document clarification</li>
                                 <li>Consider additional verification steps</li>
                               </ul>
                             </div>
                           ) : verificationData.riskLevel === 'Medium Risk' ? (
                             <div className="alert alert-warning">
                               <h6 className="alert-heading">Medium Risk - Review Required</h6>
                               <ul className="mb-0">
                                 <li>Some field mismatches detected</li>
                                 <li>Manual review recommended</li>
                                 <li>Verify document authenticity</li>
                               </ul>
                             </div>
                           ) : (
                             <div className="alert alert-success">
                               <h6 className="alert-heading">Low Risk - Proceed with Caution</h6>
                               <ul className="mb-0">
                                 <li>Most fields match successfully</li>
                                 <li>Minor discrepancies may be acceptable</li>
                                 <li>Standard verification process applies</li>
                               </ul>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Field Comparison Tab */}
                   {activeTab === 'fieldComparison' && (
                     <div className="tab-pane fade show active">
                       {console.log('Field Comparison Tab Active - showing verification results table')}
                       <div className="table-responsive">
                         <table className="table table-hover">
                           <thead>
                             <tr>
                               <th>Field</th>
                               <th>Extracted</th>
                               <th>Original</th>
                               <th>Mismatch</th>
                             </tr>
                           </thead>
                           <tbody>
                             {Object.entries(verificationData.FieldMatches || verificationData.fieldMatches || {}).map(([fieldName, fieldData]) => (
                               <tr key={fieldName}>
                                 <td>
                                   <strong>{fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
                                 </td>
                                 <td>
                                   <span className="text-primary">
                                     {fieldData.extracted || 'N/A'}
                                   </span>
                                 </td>
                                 <td>
                                   <span className="text-success">
                                     {fieldData.original || 'N/A'}
                                   </span>
                                 </td>
                                 <td>
                                   <span className={`badge bg-${getStatusColor(fieldData.status)}`}>
                                     {getStatusIcon(fieldData.status)} {fieldData.status}
                                   </span>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     </div>
                   )}

                   {/* Document Status Tab */}
                   {activeTab === 'documentStatus' && (
                     <div className="tab-pane fade show active">
                       {/* Original EC Data Details */}
                       <div className="card">
                         <div className="card-header">
                           <h6 className="mb-0">
                             <i className="fas fa-file-alt me-2"></i>
                             Original EC Data Details
                           </h6>
                         </div>
                         <div className="card-body">
                           <div className="row">
                             <div className="col-md-6">
                               <div className="mb-3">
                                 <strong>Owner Name:</strong>
                                 <span className="ms-2 text-muted">
                                   {verificationData.FieldMatches?.ownerName?.original || verificationData.fieldMatches?.ownerName?.original || 'N/A'}
                                 </span>
                               </div>
                               <div className="mb-3">
                                 <strong>Extent:</strong>
                                 <span className="ms-2 text-muted">
                                   {verificationData.FieldMatches?.extent?.original || verificationData.fieldMatches?.extent?.original || 'N/A'}
                                 </span>
                               </div>
                               <div className="mb-3">
                                 <strong>Land Type:</strong>
                                 <span className="ms-2 text-muted">
                                   {verificationData.FieldMatches?.landType?.original || verificationData.fieldMatches?.landType?.original || 'N/A'}
                                 </span>
                               </div>
                               <div className="mb-3">
                                 <strong>Ownership Type:</strong>
                                 <span className="ms-2 text-muted">
                                   {verificationData.FieldMatches?.ownershipType?.original || verificationData.fieldMatches?.ownershipType?.original || 'N/A'}
                                 </span>
                               </div>
                             </div>
                             <div className="col-md-6">
                               <div className="mb-3">
                                 <strong>Is Main Owner:</strong>
                                 <span className="ms-2">
                                   <span className={`badge ${(verificationData.FieldMatches?.isMainOwner?.original || verificationData.fieldMatches?.isMainOwner?.original) === 'Yes' ? 'bg-success' : 'bg-secondary'}`}>
                                     {verificationData.FieldMatches?.isMainOwner?.original || verificationData.fieldMatches?.isMainOwner?.original || 'N/A'}
                                   </span>
                                 </span>
                               </div>
                               <div className="mb-3">
                                 <strong>Is Govt Restricted:</strong>
                                 <span className="ms-2">
                                   <span className={`badge ${(verificationData.FieldMatches?.isGovtRestricted?.original || verificationData.fieldMatches?.isGovtRestricted?.original) === 'Yes' ? 'bg-danger' : 'bg-success'}`}>
                                     {verificationData.FieldMatches?.isGovtRestricted?.original || verificationData.fieldMatches?.isGovtRestricted?.original || 'N/A'}
                                   </span>
                                 </span>
                               </div>
                               <div className="mb-3">
                                 <strong>Is Court Stay:</strong>
                                 <span className="ms-2">
                                   <span className={`badge ${(verificationData.FieldMatches?.isCourtStay?.original || verificationData.fieldMatches?.isCourtStay?.original) === 'Yes' ? 'bg-warning' : 'bg-success'}`}>
                                     {verificationData.FieldMatches?.isCourtStay?.original || verificationData.fieldMatches?.isCourtStay?.original || 'N/A'}
                                   </span>
                                 </span>
                               </div>
                               <div className="mb-3">
                                 <strong>Is Alienated:</strong>
                                 <span className="ms-2">
                                   <span className={`badge ${(verificationData.FieldMatches?.isAlienated?.original || verificationData.fieldMatches?.isAlienated?.original) === 'Yes' ? 'bg-danger' : 'bg-success'}`}>
                                     {verificationData.FieldMatches?.isAlienated?.original || verificationData.fieldMatches?.isAlienated?.original || 'N/A'}
                                   </span>
                                 </span>
                               </div>
                               <div className="mb-3">
                                 <strong>Any Transaction:</strong>
                                 <span className="ms-2">
                                   <span className={`badge ${(verificationData.FieldMatches?.anyTransaction?.original || verificationData.fieldMatches?.anyTransaction?.original) === 'Yes' ? 'bg-info' : 'bg-secondary'}`}>
                                     {verificationData.FieldMatches?.anyTransaction?.original || verificationData.fieldMatches?.anyTransaction?.original || 'N/A'}
                                   </span>
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Mismatches Tab */}
                   {activeTab === 'mismatches' && (
                     <div className="tab-pane fade show active">
                       {(verificationData.Statistics?.MismatchedFields || verificationData.statistics?.mismatchedFields || 0) > 0 ? (
                         <div className="card">
                           <div className="card-header bg-warning text-dark">
                             <h6 className="mb-0">
                               <i className="fas fa-exclamation-triangle me-2"></i>
                               Mismatched Fields Details
                             </h6>
                           </div>
                           <div className="card-body">
                             {Object.entries(verificationData.FieldMatches || verificationData.fieldMatches || {})
                               .filter(([_, fieldData]) => fieldData.status === 'Mismatch')
                               .map(([fieldName, fieldData]) => (
                                 <div key={fieldName} className="alert alert-warning">
                                   <h6 className="alert-heading">
                                     {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                   </h6>
                                   <p className="mb-1">
                                     <strong>Extracted:</strong> {fieldData.extracted || 'N/A'}
                                   </p>
                                   <p className="mb-0">
                                     <strong>Original:</strong> {fieldData.original || 'N/A'}
                                   </p>
                                 </div>
                               ))}
                           </div>
                         </div>
                       ) : (
                         <div className="alert alert-success">
                           <h6 className="alert-heading">No Mismatches Found</h6>
                           <p className="mb-0">All fields match successfully between extracted and original data.</p>
                         </div>
                       )}
                     </div>
                   )}

                   {/* Cross-Document Analysis Tab */}
                   {activeTab === 'crossDocument' && (
                     <div className="tab-pane fade show active">
                       <div className="card">
                         <div className="card-header">
                           <h6 className="mb-0">
                             <i className="fas fa-exchange-alt me-2"></i>
                             Cross-Document Field Analysis
                           </h6>
                         </div>
                         <div className="card-body">
                           <p className="text-muted mb-4">
                             Comparing extracted data across Aadhaar, PAN, and EC documents to identify discrepancies.
                           </p>
                           
                           <div className="table-responsive">
                             <table className="table table-bordered">
                               <thead className="table-dark">
                                 <tr>
                                   <th>Field</th>
                                   <th>Aadhaar Card</th>
                                   <th>PAN Card</th>
                                   <th>EC Document</th>
                                   <th>Status</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 <tr>
                                   <td><strong>Full Name</strong> <span className="badge bg-danger">Critical</span></td>
                                   <td>{verificationData.FieldMatches?.aadhaarName?.extracted || 'N/A'}</td>
                                   <td>{verificationData.FieldMatches?.panName?.extracted || 'N/A'}</td>
                                   <td>N/A</td>
                                   <td>
                                     <span className={`badge ${verificationData.FieldMatches?.aadhaarName?.extracted === verificationData.FieldMatches?.panName?.extracted ? 'bg-success' : 'bg-danger'}`}>
                                       {verificationData.FieldMatches?.aadhaarName?.extracted === verificationData.FieldMatches?.panName?.extracted ? 'Match' : 'Mismatch'}
                                     </span>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td><strong>Date of Birth</strong> <span className="badge bg-danger">Critical</span></td>
                                   <td>{verificationData.FieldMatches?.dob?.extracted || 'N/A'}</td>
                                   <td>{verificationData.FieldMatches?.dob?.extracted || 'N/A'}</td>
                                   <td>N/A</td>
                                   <td>
                                     <span className="badge bg-success">Match</span>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td><strong>Village</strong></td>
                                   <td>N/A</td>
                                   <td>N/A</td>
                                   <td>{verificationData.FieldMatches?.village?.extracted || 'N/A'}</td>
                                   <td>
                                     <span className={`badge ${verificationData.FieldMatches?.village?.status === 'Match' ? 'bg-success' : 'bg-warning'}`}>
                                       {verificationData.FieldMatches?.village?.status || 'No Data'}
                                     </span>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td><strong>District</strong></td>
                                   <td>N/A</td>
                                   <td>N/A</td>
                                   <td>{verificationData.FieldMatches?.district?.extracted || 'N/A'}</td>
                                   <td>
                                     <span className={`badge ${verificationData.FieldMatches?.district?.status === 'Match' ? 'bg-success' : 'bg-warning'}`}>
                                       {verificationData.FieldMatches?.district?.status || 'No Data'}
                                     </span>
                                   </td>
                                 </tr>
                               </tbody>
                             </table>
                           </div>
                           
                           <div className="row mt-4">
                             <div className="col-md-4">
                               <div className="card text-center">
                                 <div className="card-body">
                                   <h4 className="text-success">0</h4>
                                   <p className="card-text">Matching Fields</p>
                                 </div>
                               </div>
                             </div>
                             <div className="col-md-4">
                               <div className="card text-center">
                                 <div className="card-body">
                                   <h4 className="text-danger">0</h4>
                                   <p className="card-text">Mismatched Fields</p>
                                 </div>
                               </div>
                             </div>
                             <div className="col-md-4">
                               <div className="card text-center">
                                 <div className="card-body">
                                   <h4 className="text-warning">3</h4>
                                   <p className="card-text">Critical Fields</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>

              </>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              <i className="fas fa-print me-2"></i>Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationResultsModal;
