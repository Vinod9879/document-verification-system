import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Services/AuthService';
import documentService from '../../Services/documentService';
import Card from '../Common/Card';
import Button from '../Common/Button';
import toast from 'react-hot-toast';

const DocumentExtraction = () => {
  const { user, isAdmin } = useAuth();
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({
    EC: null,
    Aadhaar: null,
    PAN: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUploadedDocuments();
    }
  }, [isAdmin]);

  const fetchUploadedDocuments = async () => {
    try {
      setLoading(true);
      const documents = await documentService.getUploadedDocuments();
      setUploadedDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
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
      toast.error('Please select all three documents (EC, Aadhaar, PAN)');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Uploading documents...', { id: 'upload' });

      const formData = new FormData();
      formData.append('EC', selectedFiles.EC);
      formData.append('Aadhaar', selectedFiles.Aadhaar);
      formData.append('PAN', selectedFiles.PAN);

      const response = await documentService.uploadDocuments(formData);
      
      toast.success('Documents uploaded successfully!', { id: 'upload' });
      setUploadId(response.uploadId);
      
      // Clear selected files
      setSelectedFiles({ EC: null, Aadhaar: null, PAN: null });
      
      // Refresh documents list if admin
      if (isAdmin) {
        await fetchUploadedDocuments();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const [extractingDocuments, setExtractingDocuments] = useState(new Set());

  const handleExtractDocuments = async (uploadId) => {
    try {
      setExtractingDocuments(prev => new Set(prev).add(uploadId));
      setExtracting(true);
      toast.loading('Extracting data from documents...', { id: 'extract' });

      const response = isAdmin 
        ? await documentService.extractDocumentsAdmin(uploadId)
        : await documentService.extractDocumentsUser(uploadId);
      
      toast.success('Data extracted successfully!', { id: 'extract' });
      
      // Show extracted data
      if (response.extractedData) {
        console.log('Extracted Data:', response.extractedData);
        toast.success('Check console for extracted data details');
      }
      
      // Refresh documents list if admin
      if (isAdmin) {
        await fetchUploadedDocuments();
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('Failed to extract data from documents', { id: 'extract' });
    } finally {
      setExtracting(false);
      setExtractingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(uploadId);
        return newSet;
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <p className="mt-3">Loading documents...</p>
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
          <h1 className="h2 mb-4">
            {isAdmin ? 'Document Management' : 'Document Upload & Extraction'}
          </h1>
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="row mb-4">
        <div className="col-12">
          <Card title="Upload Documents" className="dashboard-card">
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
                  {selectedFiles.EC && (
                    <small className="text-muted">
                      Selected: {selectedFiles.EC.name} ({formatFileSize(selectedFiles.EC.size)})
                    </small>
                  )}
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
                  {selectedFiles.Aadhaar && (
                    <small className="text-muted">
                      Selected: {selectedFiles.Aadhaar.name} ({formatFileSize(selectedFiles.Aadhaar.size)})
                    </small>
                  )}
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
                  {selectedFiles.PAN && (
                    <small className="text-muted">
                      Selected: {selectedFiles.PAN.name} ({formatFileSize(selectedFiles.PAN.size)})
                    </small>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button 
                variant="primary" 
                onClick={handleDocumentUpload}
                disabled={uploading}
                className="me-2"
              >
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </Button>
              {uploadId && (
                <Button 
                  variant="success" 
                  onClick={() => handleExtractDocuments(uploadId)}
                  disabled={extracting}
                >
                  {extracting ? 'Extracting...' : 'Extract Data'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Admin: Uploaded Documents List */}
      {isAdmin && (
        <div className="row mb-4">
          <div className="col-12">
            <Card 
              title="Uploaded Documents" 
              className="dashboard-card"
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">All Uploaded Documents</h5>
                <Button 
                  variant="outline-primary" 
                  onClick={fetchUploadedDocuments}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              
              {uploadedDocuments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Upload Date</th>
                        <th>Files</th>
                        <th>Extracted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedDocuments.map((doc) => (
                        <tr key={doc.id}>
                          <td>{doc.id}</td>
                          <td>{doc.userName}</td>
                          <td>{doc.userEmail}</td>
                          <td>
                            {new Date(doc.createdAt).toLocaleDateString()}
                            <br />
                            <small className="text-muted">
                              {new Date(doc.createdAt).toLocaleTimeString()}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              <span className={`badge ${doc.ECPath ? 'bg-success' : 'bg-secondary'}`}>
                                EC
                              </span>
                              <span className={`badge ${doc.AadhaarPath ? 'bg-success' : 'bg-secondary'}`}>
                                Aadhaar
                              </span>
                              <span className={`badge ${doc.PANPath ? 'bg-success' : 'bg-secondary'}`}>
                                PAN
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${doc.hasExtractedData ? 'bg-success' : 'bg-warning'}`}>
                              {doc.hasExtractedData ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleExtractDocuments(doc.id)}
                              disabled={extracting || doc.hasExtractedData || extractingDocuments.has(doc.id)}
                              title={doc.hasExtractedData ? "Already extracted" : extractingDocuments.has(doc.id) ? "Extracting..." : "Extract data from documents"}
                            >
                              {extractingDocuments.has(doc.id) ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  Extracting...
                                </>
                              ) : doc.hasExtractedData ? 'Extracted' : 'Extract Data'}
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
      )}

      {/* User: Upload Status */}
      {!isAdmin && uploadId && (
        <div className="row mb-4">
          <div className="col-12">
            <Card title="Upload Status" className="dashboard-card">
              <div className="alert alert-success">
                <h6>Documents Uploaded Successfully!</h6>
                <p className="mb-2">Upload ID: {uploadId}</p>
                <p className="mb-0">You can now extract data from your uploaded documents.</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentExtraction;
