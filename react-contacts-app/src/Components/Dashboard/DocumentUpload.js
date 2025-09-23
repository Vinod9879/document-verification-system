import React, { useState } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';

const DocumentUpload = ({ onUpload, uploading }) => {
  const [selectedFiles, setSelectedFiles] = useState({
    EC: null,
    Aadhaar: null,
    PAN: null
  });

  const handleFileChange = (documentType, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleUpload = () => {
    if (!selectedFiles.EC || !selectedFiles.Aadhaar || !selectedFiles.PAN) {
      alert('Please select all three documents (EC, Aadhaar, PAN)');
      return;
    }
    onUpload(selectedFiles);
  };

  return (
    <Card title="Document Upload" className="dashboard-card">
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
              <small className="text-success">✓ {selectedFiles.EC.name}</small>
            )}
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
            {selectedFiles.Aadhaar && (
              <small className="text-success">✓ {selectedFiles.Aadhaar.name}</small>
            )}
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
            {selectedFiles.PAN && (
              <small className="text-success">✓ {selectedFiles.PAN.name}</small>
            )}
          </div>
        </div>
      </div>
      <div className="text-center">
        <Button 
          variant="primary" 
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </Button>
      </div>
    </Card>
  );
};

export default DocumentUpload;
