import React, { useState } from 'react';

const SimpleAdminTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAdminLogin = async () => {
    setLoading(true);
    setResult('Testing admin login...\n');
    
    try {
      // Try the correct port (backend is running on 5000)
      const response = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ SUCCESS! Admin login worked!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ FAILED! Status: ${response.status}\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      }
      
    } catch (error) {
      setResult(`❌ ERROR: ${error.message}\n\nThis usually means:\n1. Backend is not running\n2. Wrong port (try 5000, 5001, 5194)\n3. CORS issue\n4. HTTPS certificate issue`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>Simple Admin Login Test</h3>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary w-100" 
                onClick={testAdminLogin}
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Admin Login'}
              </button>
              
              {result && (
                <div className="mt-3">
                  <h5>Result:</h5>
                  <pre style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '5px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {result}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminTest;
