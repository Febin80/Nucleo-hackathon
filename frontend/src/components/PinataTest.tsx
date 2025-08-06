import React, { useState } from 'react';
import { pinataService } from '../services/pinata';

const PinataTest: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setError(null);
      console.log('Testing Pinata connection...');
      const isConnected = await pinataService.testConnection();
      setConnectionStatus(isConnected);
      console.log('Connection test result:', isConnected);
    } catch (err) {
      console.error('Connection test error:', err);
      setError(err instanceof Error ? err.message : 'Connection test failed');
      setConnectionStatus(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      console.log('Uploading file to Pinata:', file.name);
      const cid = await pinataService.uploadFile(file);
      setUploadResult(cid);
      console.log('Upload successful, CID:', cid);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const testJSONUpload = async () => {
    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    const testData = {
      message: 'Test JSON upload to Pinata',
      timestamp: new Date().toISOString(),
      type: 'test',
      data: {
        platform: 'Nucleo - Denuncias Anónimas',
        version: '1.0'
      }
    };

    try {
      console.log('Uploading JSON to Pinata:', testData);
      const cid = await pinataService.uploadJSON(testData);
      setUploadResult(cid);
      console.log('JSON upload successful, CID:', cid);
    } catch (err) {
      console.error('JSON upload error:', err);
      setError(err instanceof Error ? err.message : 'JSON upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Pinata IPFS Test</h2>
      
      {/* Connection Test */}
      <div className="mb-6">
        <button
          onClick={testConnection}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Test Connection
        </button>
        
        {connectionStatus !== null && (
          <div className={`mt-2 p-2 rounded ${connectionStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Connection: {connectionStatus ? 'Success ✅' : 'Failed ❌'}
          </div>
        )}
      </div>

      {/* File Upload Test */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">File Upload Test</h3>
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* JSON Upload Test */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">JSON Upload Test</h3>
        <button
          onClick={testJSONUpload}
          disabled={isUploading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Upload Test JSON'}
        </button>
      </div>

      {/* Loading State */}
      {isUploading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          Uploading to Pinata... Please wait.
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}

      {/* Success Result */}
      {uploadResult && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          <p className="font-semibold">Upload Successful!</p>
          <p className="text-sm">CID: {uploadResult}</p>
          <div className="mt-2">
            <p className="text-sm font-medium">Gateway URLs:</p>
            {pinataService.getGatewayUrls(uploadResult).map((url, index) => (
              <div key={index} className="text-xs">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h4 className="font-semibold text-gray-800 mb-2">Instructions:</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. First, test the connection to verify Pinata credentials</li>
          <li>2. Try uploading a small file (image, text, etc.)</li>
          <li>3. Test JSON upload functionality</li>
          <li>4. Check the generated gateway URLs to verify content</li>
        </ol>
      </div>
    </div>
  );
};

export default PinataTest;