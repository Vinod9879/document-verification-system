import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const AdminLoginDebug = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [testResult, setTestResult] = useState('');

  const testAdminLogin = async () => {
    setDebugInfo('Testing admin login...\n');
    
    const ports = [
      { name: 'HTTPS 5001', url: 'https://localhost:5001/api' },
      { name: 'HTTP 5000', url: 'http://localhost:5000/api' },
      { name: 'HTTPS 5194', url: 'https://localhost:5194/api' },
      { name: 'HTTP 5194', url: 'http://localhost:5194/api' }
    ];
    
    for (const port of ports) {
      try {
        setDebugInfo(prev => prev + `\n=== Testing ${port.name} ===\n`);
        setDebugInfo(prev => prev + `URL: ${port.url}\n`);
        
        // Test admin login endpoint
        const response = await fetch(`${port.url}/auth/admin-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          mode: 'cors',
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
          })
        });
        
        setDebugInfo(prev => prev + `Response Status: ${response.status}\n`);
        
        const data = await response.text();
        setDebugInfo(prev => prev + `Response Body: ${data}\n`);
        
        if (response.ok) {
          setTestResult(`✅ Admin login test successful on ${port.name}!`);
          setDebugInfo(prev => prev + `\n🎉 SUCCESS! Backend is running on ${port.name}\n`);
          return; // Exit early on success
        } else {
          setDebugInfo(prev => prev + `❌ Failed on ${port.name}\n`);
        }
        
      } catch (error) {
        setDebugInfo(prev => prev + `Error on ${port.name}: ${error.message}\n`);
      }
    }
    
    setTestResult('❌ Admin login test failed on all ports');
  };

  const testUserLogin = async () => {
    setDebugInfo('Testing user login...\n');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      });
      
      setDebugInfo(prev => prev + `User Login Response Status: ${response.status}\n`);
      const data = await response.text();
      setDebugInfo(prev => prev + `User Login Response Body: ${data}\n`);
      
    } catch (error) {
      setDebugInfo(prev => prev + `User Login Error: ${error.message}\n`);
    }
  };

  const testBackendHealth = async () => {
    setDebugInfo('Testing backend health...\n');
    
    const ports = [
      { name: 'HTTPS 5001', url: 'https://localhost:5001' },
      { name: 'HTTP 5000', url: 'http://localhost:5000' },
      { name: 'HTTPS 5194', url: 'https://localhost:5194' },
      { name: 'HTTP 5194', url: 'http://localhost:5194' }
    ];
    
    for (const port of ports) {
      try {
        setDebugInfo(prev => prev + `\n=== Testing ${port.name} ===\n`);
        setDebugInfo(prev => prev + `URL: ${port.url}\n`);
        
        // Test swagger endpoint
        const swaggerResponse = await fetch(`${port.url}/swagger`, {
          method: 'GET',
          mode: 'cors'
        });
        
        setDebugInfo(prev => prev + `Swagger Status: ${swaggerResponse.status}\n`);
        
        // Test API endpoint
        const apiResponse = await fetch(`${port.url}/api/auth/verify`, {
          method: 'GET',
          mode: 'cors'
        });
        
        setDebugInfo(prev => prev + `API Status: ${apiResponse.status}\n`);
        
        if (swaggerResponse.ok || apiResponse.status !== 0) {
          setDebugInfo(prev => prev + `✅ Backend is running on ${port.name}\n`);
        } else {
          setDebugInfo(prev => prev + `❌ Backend not responding on ${port.name}\n`);
        }
        
      } catch (error) {
        setDebugInfo(prev => prev + `Error on ${port.name}: ${error.message}\n`);
        setDebugInfo(prev => prev + `Error type: ${error.name}\n`);
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Admin Login Debug Tool</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <button 
                  className="btn btn-primary me-2" 
                  onClick={testAdminLogin}
                >
                  Test Admin Login
                </button>
                <button 
                  className="btn btn-secondary me-2" 
                  onClick={testUserLogin}
                >
                  Test User Login
                </button>
                <button 
                  className="btn btn-info" 
                  onClick={testBackendHealth}
                >
                  Test Backend Health
                </button>
              </div>
              
              {testResult && (
                <div className={`alert ${testResult.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
                  {testResult}
                </div>
              )}
              
              <div className="mt-3">
                <h5>Debug Information:</h5>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '5px',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  {debugInfo || 'Click a test button to see debug information...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginDebug;
