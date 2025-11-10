import React, { useState, useEffect } from 'react'
import { apiClient } from '../lib/api'
import { FileText, Image, MessageSquare, Brain, Download, Loader2, AlertCircle, Eye } from 'lucide-react'

export default function CaseManagement() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [caseDocuments, setCaseDocuments] = useState([])
  const [caseImages, setCaseImages] = useState([])
  const [caseSummary, setCaseSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    try {
      setLoading(true)
      setError('')
      const casesData = await apiClient.getAllCases()
      setCases(Array.isArray(casesData) ? casesData : [])
    } catch (error) {
      console.error('Error loading cases:', error)
      setError('Failed to load cases: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCaseSelect = async (caseId) => {
    try {
      setLoading(true)
      setError('')
      
      const [caseData, documents, images] = await Promise.allSettled([
        apiClient.getCase(caseId),
        apiClient.getCaseDocuments(caseId),
        apiClient.getCaseImages(caseId)
      ])
      
      if (caseData.status === 'fulfilled') {
        setSelectedCase(caseData.value)
      }
      
      if (documents.status === 'fulfilled') {
        setCaseDocuments(Array.isArray(documents.value) ? documents.value : [])
      }
      
      if (images.status === 'fulfilled') {
        setCaseImages(Array.isArray(images.value) ? images.value : [])
      }
      
    } catch (error) {
      console.error('Error loading case details:', error)
      setError('Failed to load case details: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSummarizeCase = async (caseId) => {
    try {
      setLoading(true)
      setError('')
      const summary = await apiClient.summarizeCase(caseId)
      setCaseSummary(summary.summary || summary)
    } catch (error) {
      console.error('Error summarizing case:', error)
      setError('Failed to summarize case: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cases List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Legal Cases</h2>
              <button
                onClick={loadCases}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
            
            {loading && cases.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <p className="text-gray-600 text-sm mt-2">Loading cases...</p>
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No cases available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cases.map((case_item) => (
                  <div
                    key={case_item.id}
                    onClick={() => handleCaseSelect(case_item.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCase?.id === case_item.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-medium text-gray-800 text-sm">
                      {case_item.title || case_item.case_name || `Case ${case_item.id}`}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1">
                      {case_item.court || 'Unknown Court'}
                    </p>
                    {case_item.date && (
                      <p className="text-gray-500 text-xs">{case_item.date}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Case Details */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <div className="space-y-6">
              
              {/* Case Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCase.title || selectedCase.case_name || `Case ${selectedCase.id}`}
                  </h2>
                  <button
                    onClick={() => handleSummarizeCase(selectedCase.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    AI Summary
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedCase.court && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Court</label>
                      <p className="text-gray-800">{selectedCase.court}</p>
                    </div>
                  )}
                  {selectedCase.date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <p className="text-gray-800">{selectedCase.date}</p>
                    </div>
                  )}
                  {selectedCase.judge && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Judge</label>
                      <p className="text-gray-800">{selectedCase.judge}</p>
                    </div>
                  )}
                  {selectedCase.status && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-800">{selectedCase.status}</p>
                    </div>
                  )}
                </div>

                {selectedCase.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-600 mt-1">{selectedCase.description}</p>
                  </div>
                )}

                {caseSummary && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Summary
                    </h3>
                    <p className="text-purple-700">{caseSummary}</p>
                  </div>
                )}
              </div>

              {/* Documents and Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Documents */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents ({caseDocuments.length})
                  </h3>
                  
                  {caseDocuments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No documents available</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {caseDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {doc.filename || doc.name || `Document ${index + 1}`}
                          </span>
                          <div className="flex gap-1 ml-2">
                            {doc.filename && (
                              <a
                                href={apiClient.getPdfUrl(doc.filename)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="View PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                            {doc.filename && (
                              <a
                                href={apiClient.getPdfUrl(doc.filename)}
                                download
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Images ({caseImages.length})
                  </h3>
                  
                  {caseImages.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No images available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {caseImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={apiClient.getImageUrl(img.filename)}
                            alt={img.filename || `Image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => window.open(apiClient.getImageUrl(img.filename), '_blank')}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b truncate">
                            {img.filename || `Image ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a Case</h3>
              <p>Choose a case from the list to view its details, documents, and images</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}