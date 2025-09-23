import React, { useState, useEffect } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';

const VerificationResults = ({ documentStatus, extractedData, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mismatchDetails, setMismatchDetails] = useState(null);

  useEffect(() => {
    if (documentStatus?.fieldMismatches) {
      try {
        setMismatchDetails(JSON.parse(documentStatus.fieldMismatches));
      } catch (e) {
        setMismatchDetails({ raw: documentStatus.fieldMismatches });
      }
    }
  }, [documentStatus]);

  const getRiskLevel = (riskScore) => {
    if (riskScore <= 30) return { level: 'LOW', color: 'success', icon: '✅' };
    if (riskScore <= 70) return { level: 'MEDIUM', color: 'warning', icon: '⚠️' };
    return { level: 'HIGH', color: 'danger', icon: '❌' };
  };

  const getStatusBadge = (isVerified, riskScore) => {
    if (isVerified) {
      return <span className="badge bg-success">VERIFIED</span>;
    }
    if (riskScore <= 70) {
      return <span className="badge bg-warning">PENDING REVIEW</span>;
    }
    return <span className="badge bg-danger">REJECTED</span>;
  };

  const renderFieldComparison = () => {
    if (!extractedData) return null;

    // Handle both old mock structure and new real structure
    const fields = [
      { 
        key: 'name', 
        label: 'Name', 
        aadhaar: extractedData.aadhaar?.name || extractedData.name, 
        pan: extractedData.pan?.name || extractedData.name, 
        ec: extractedData.ec?.name || extractedData.name 
      },
      { 
        key: 'dob', 
        label: 'Date of Birth', 
        aadhaar: extractedData.aadhaar?.dob || extractedData.dob, 
        pan: extractedData.pan?.dob || extractedData.dob, 
        ec: extractedData.ec?.dob || extractedData.dob 
      },
      { 
        key: 'fatherName', 
        label: 'Father\'s Name', 
        aadhaar: extractedData.aadhaar?.fatherName || extractedData.fatherName, 
        pan: extractedData.pan?.fatherName || extractedData.fatherName, 
        ec: extractedData.ec?.fatherName || extractedData.fatherName 
      },
      { 
        key: 'address', 
        label: 'Address', 
        aadhaar: extractedData.aadhaar?.address || extractedData.address, 
        pan: extractedData.pan?.address || extractedData.address, 
        ec: extractedData.ec?.address || extractedData.address 
      }
    ];

    return (
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Field</th>
              <th>Aadhaar</th>
              <th>PAN</th>
              <th>EC</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const values = [field.aadhaar, field.pan, field.ec].filter(v => v && v.trim());
              const isMatch = values.length > 1 && values.every(v => v === values[0]);
              
              return (
                <tr key={index}>
                  <td><strong>{field.label}</strong></td>
                  <td>{field.aadhaar || '-'}</td>
                  <td>{field.pan || '-'}</td>
                  <td>{field.ec || '-'}</td>
                  <td>
                    {isMatch ? (
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
    );
  };

  const renderMismatchDetails = () => {
    if (!mismatchDetails) return null;

    if (typeof mismatchDetails === 'object' && mismatchDetails.raw) {
      return (
        <div className="alert alert-warning">
          <h6>Mismatch Details:</h6>
          <p>{mismatchDetails.raw}</p>
        </div>
      );
    }

    return (
      <div className="alert alert-warning">
        <h6>Field Mismatches Detected:</h6>
        <ul className="mb-0">
          {Object.entries(mismatchDetails).map(([field, details]) => (
            <li key={field}>
              <strong>{field}:</strong> {details}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderDocumentStatus = () => {
    const documents = [
      { 
        name: 'Aadhaar', 
        status: (extractedData?.aadhaar || extractedData?.aadhaarNumber) ? 'Uploaded' : 'Not Uploaded', 
        confidence: extractedData?.aadhaar?.confidenceScore || extractedData?.confidenceScore 
      },
      { 
        name: 'PAN', 
        status: (extractedData?.pan || extractedData?.panNumber) ? 'Uploaded' : 'Not Uploaded', 
        confidence: extractedData?.pan?.confidenceScore || extractedData?.confidenceScore 
      },
      { 
        name: 'EC', 
        status: (extractedData?.ec || extractedData?.surveyNumber) ? 'Uploaded' : 'Not Uploaded', 
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

  const riskInfo = getRiskLevel(documentStatus.riskScore);

  return (
    <div className="verification-results">
      <Card title="Document Verification Results">
        {/* Status Overview */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="text-center">
              <h4 className={`text-${riskInfo.color}`}>{riskInfo.icon}</h4>
              <h5>Status</h5>
              {getStatusBadge(documentStatus.isVerified, documentStatus.riskScore)}
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4 className={`text-${riskInfo.color}`}>{documentStatus.riskScore}%</h4>
              <h5>Risk Score</h5>
              <span className={`badge bg-${riskInfo.color}`}>{riskInfo.level} RISK</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4>{documentStatus.isSubmitted ? '✅' : '⏳'}</h4>
              <h5>Submission</h5>
              <span className={`badge ${documentStatus.isSubmitted ? 'bg-success' : 'bg-warning'}`}>
                {documentStatus.isSubmitted ? 'Submitted' : 'Pending'}
              </span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4>{documentStatus.isVerified ? '✅' : '⏳'}</h4>
              <h5>Verification</h5>
              <span className={`badge ${documentStatus.isVerified ? 'bg-success' : 'bg-warning'}`}>
                {documentStatus.isVerified ? 'Verified' : 'Pending'}
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
            <div className="alert alert-info">
              <h6>Verification Summary</h6>
              <p className="mb-0">{documentStatus.verificationNotes || 'No additional notes available.'}</p>
            </div>
            
            {documentStatus.fieldMismatches && (
              <div className="alert alert-warning">
                <h6>⚠️ Issues Detected</h6>
                <p className="mb-0">{documentStatus.fieldMismatches}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div>
            <h6>Cross-Document Field Comparison</h6>
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
            <h6>Detailed Mismatch Analysis</h6>
            {renderMismatchDetails()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 d-flex gap-2">
          <Button variant="primary" onClick={onRefresh}>
            Refresh Status
          </Button>
          {!documentStatus.isVerified && (
            <Button variant="outline-secondary">
              Contact Support
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VerificationResults;
