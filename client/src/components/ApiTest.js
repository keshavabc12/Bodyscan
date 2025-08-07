import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ApiTest() {
  const [testResult, setTestResult] = useState(null);
  const [healthResult, setHealthResult] = useState(null);
  const [adminResult, setAdminResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const [testResponse, healthResponse, adminResponse] = await Promise.all([
        api.get('/api/test'),
        api.get('/api/health'),
        api.get('/api/admin/check')
      ]);
      
      setTestResult(testResponse.data);
      setHealthResult(healthResponse.data);
      setAdminResult(adminResponse.data);
    } catch (err) {
      setError(err.message);
      console.error('API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="container mt-4">
      <h3>API Configuration Test</h3>
      <button 
        className="btn btn-primary mb-3" 
        onClick={testApi}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test All APIs'}
      </button>
      
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {testResult && (
        <div className="alert alert-success">
          <h5>✅ API Test Successful!</h5>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}

      {healthResult && (
        <div className="alert alert-info">
          <h5>🏥 Health Check</h5>
          <pre>{JSON.stringify(healthResult, null, 2)}</pre>
        </div>
      )}

      {adminResult && (
        <div className="alert alert-warning">
          <h5>👤 Admin Check</h5>
          <pre>{JSON.stringify(adminResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ApiTest; 