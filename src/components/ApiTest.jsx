import React, { useState, useEffect } from 'react'
import { apiClient } from '../lib/api'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ApiTest() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [healthResponse, setHealthResponse] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    testApiConnection()
  }, [])

  const testApiConnection = async () => {
    try {
      setApiStatus('checking')
      setError('')
      
      const response = await apiClient.getHealth()
      setHealthResponse(response)
      setApiStatus('success')
    } catch (error) {
      console.error('API Test Failed:', error)
      setError(error.message)
      setApiStatus('error')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">HakiLens API Status</h2>
      
      <div className="flex items-center gap-3 mb-4">
        {apiStatus === 'checking' && (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-blue-600">Checking API connection...</span>
          </>
        )}
        
        {apiStatus === 'success' && (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-600">API is connected and working!</span>
          </>
        )}
        
        {apiStatus === 'error' && (
          <>
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-600">API connection failed</span>
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {healthResponse && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">Health Check Response:</h3>
          <pre className="text-sm text-green-700 overflow-x-auto">
            {JSON.stringify(healthResponse, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={testApiConnection}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Test Again
      </button>
    </div>
  )
}