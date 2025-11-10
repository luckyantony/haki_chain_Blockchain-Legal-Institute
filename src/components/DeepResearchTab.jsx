import React, { useState } from 'react';
import { Search, ExternalLink, Loader2, AlertCircle, CheckCircle, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import kenyaLawApi from '../lib/kenyaLawApi';
import MarkdownRenderer from './MarkdownRenderer';
import CaseChatModal from './CaseChatModal';

export default function DeepResearchTab() {
  const [searchMode, setSearchMode] = useState('auto-detect');
  const [searchUrl, setSearchUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [chatModal, setChatModal] = useState({ isOpen: false, caseData: null });
  const [expandedCases, setExpandedCases] = useState({});

  const suggestedUrls = kenyaLawApi.getSuggestedUrls();

  const handleSearch = async () => {
    if (!searchUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    if (!kenyaLawApi.isValidKenyaLawUrl(searchUrl)) {
      setError('Please enter a valid Kenya Law URL (kenyalaw.org)');
      return;
    }

    setSearching(true);
    setError(null);
    setResults(null);

    try {
      const result = await kenyaLawApi.scrapeKenyaLaw({
        url: searchUrl,
        limit: searchMode === 'single-case' ? 1 : 10,
        scrape_links: searchMode !== 'single-case'
      });

      setResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestedUrl = (url) => {
    setSearchUrl(url);
    setError(null);
  };

  const openChatModal = (caseData) => {
    setChatModal({ isOpen: true, caseData });
  };

  const closeChatModal = () => {
    setChatModal({ isOpen: false, caseData: null });
  };

  const toggleCaseExpansion = (index) => {
    setExpandedCases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getSearchModeDescription = () => {
    switch (searchMode) {
      case 'auto-detect':
        return 'Automatically detects and scrapes cases or document listings';
      case 'listing-crawl':
        return 'Crawls through paginated case listings and document collections';
      case 'single-case':
        return 'Scrapes a single case or document page in detail';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Mode Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Research Mode</h3>
        <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-200">
          {[
            { key: 'auto-detect', label: 'Auto Detect' },
            { key: 'listing-crawl', label: 'Listing Crawl' },
            { key: 'single-case', label: 'Single Document' }
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => setSearchMode(mode.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                searchMode === mode.key
                  ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          {getSearchModeDescription()}
        </p>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kenya Law URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={searchUrl}
            onChange={(e) => setSearchUrl(e.target.value)}
            placeholder="https://new.kenyalaw.org/akn/..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchUrl.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Start Research
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested URLs */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested URLs</h4>
        <div className="grid gap-2">
          {suggestedUrls.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedUrl(item.url)}
              className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">
                    {item.description}
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-1">
                    {item.url}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.type === 'listing' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.type}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Research Failed</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Research Completed</h4>
                <p className="text-sm text-green-700">
                  Successfully scraped {results.total_pages} page(s) in {results.duration?.toFixed(2)}s
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Total Pages:</span>
                <span className="ml-2 text-gray-900">{results.total_pages}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="ml-2 text-gray-900">{results.duration?.toFixed(2)}s</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Document ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs">{results.document_id}</span>
              </div>
            </div>

            {results.results && results.results.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Scraped Documents</h5>
                <div className="space-y-4">
                  {results.results.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h6 className="font-medium text-gray-900">
                                {doc.title || `Document ${index + 1}`}
                              </h6>
                              <div className="flex items-center gap-2 ml-auto">
                                <button
                                  onClick={() => openChatModal(doc)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-1 text-sm font-medium"
                                  title="Chat with this case"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  Chat with Case
                                </button>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                  title="Open original document"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 break-all">{doc.url}</p>
                          </div>
                        </div>
                        
                        {doc.content && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                Content ({doc.content_length || doc.content.length} characters)
                              </p>
                              <button
                                onClick={() => toggleCaseExpansion(index)}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {expandedCases[index] ? (
                                  <>
                                    <ChevronDown className="w-4 h-4" />
                                    Show Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronRight className="w-4 h-4" />
                                    Show Full Content
                                  </>
                                )}
                              </button>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                              {expandedCases[index] ? (
                                <div className="prose prose-sm max-w-none">
                                  <MarkdownRenderer content={doc.content} />
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-gray-700 mb-2">Content Preview:</p>
                                  <MarkdownRenderer content={doc.content.substring(0, 500) + '...'} />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Modal */}
      <CaseChatModal
        isOpen={chatModal.isOpen}
        onClose={closeChatModal}
        caseData={chatModal.caseData}
        documentId={results?.document_id}
      />
    </div>
  );
}