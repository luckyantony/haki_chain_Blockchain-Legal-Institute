import React, { useState, useEffect } from 'react';
import { Search, Database, Calendar, ExternalLink, FileText } from 'lucide-react';

export default function CaseDatabaseTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_created');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Mock data for demonstration - in real implementation, this would come from your backend
  const mockCases = [
    {
      id: 1,
      title: 'African Charter on Maritime Security and Safety',
      court: 'African Union',
      case_number: 'AU/Charter/2016',
      date_created: '2016-10-15',
      parties: ['African Union Member States'],
      summary: 'Charter establishing framework for maritime security and safety in Africa',
      document_type: 'Charter',
      url: 'https://new.kenyalaw.org/akn/aa-au/act/charter/2016/maritime-security-and-safety-and-development-in-africa/eng@2016-10-15',
      content_preview: 'The African Charter on Maritime Security and Safety and Development in Africa, also known as the Lomé Charter, establishes a comprehensive framework...'
    },
    // Add more mock cases as needed
  ];

  useEffect(() => {
    // Simulate loading cases
    setLoading(true);
    setTimeout(() => {
      setCases(mockCases);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCases = cases.filter(case_ =>
    case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.parties.some(party => party.toLowerCase().includes(searchTerm.toLowerCase())) ||
    case_.case_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCases = [...filteredCases].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'court':
        return a.court.localeCompare(b.court);
      case 'case_number':
        return a.case_number.localeCompare(b.case_number);
      case 'date_created':
      default:
        return new Date(b.date_created) - new Date(a.date_created);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cases by title, parties, or case number..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date_created">Date Created</option>
            <option value="title">Title</option>
            <option value="court">Court</option>
            <option value="case_number">Case Number</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {sortedCases.length} of {cases.length} cases
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : sortedCases.length === 0 ? (
        <div className="text-center py-16">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No Cases Found' : 'No Cases Available'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms or filters.'
              : 'Start by running a deep research to populate your database.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCases.map((case_) => (
            <div
              key={case_.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCase(case_)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1 hover:text-blue-600">
                    {case_.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {case_.document_type}
                    </span>
                    <span>{case_.court}</span>
                    <span>{case_.case_number}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(case_.date_created)}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {case_.content_preview}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Parties:</span>
                  <span className="text-sm text-gray-700">
                    {case_.parties.join(', ')}
                  </span>
                </div>
                <a
                  href={case_.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Source
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Case Details
              </h2>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedCase.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Court:</span>
                      <span className="ml-2 text-gray-900">{selectedCase.court}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Case Number:</span>
                      <span className="ml-2 text-gray-900">{selectedCase.case_number}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="ml-2 text-gray-900">{formatDate(selectedCase.date_created)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-900">{selectedCase.document_type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Parties</h4>
                  <p className="text-gray-900">{selectedCase.parties.join(', ')}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                  <p className="text-gray-900">{selectedCase.summary}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Content Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedCase.content_preview}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <a
                    href={selectedCase.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Full Document
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}