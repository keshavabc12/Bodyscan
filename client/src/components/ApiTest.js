import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ApiTest() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/test');
      setTestResult(response.data);
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
        {loading ? 'Testing...' : 'Test API Connection'}
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
    </div>
  );
}

export default ApiTest; 