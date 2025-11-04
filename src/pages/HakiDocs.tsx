import { useState } from "react"
import LawyerSidebar from "../components/LawyerSidebar"
import { FileText, Upload, Search, Filter } from "lucide-react"
import TourGuide from "../components/TourGuide"

export default function HakiDocs() {
  const [showTour, setShowTour] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showTour && <TourGuide onComplete={() => setShowTour(false)} />}
      <LawyerSidebar onTourStart={() => setShowTour(true)} />
      <div className="flex-1 ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">HakiDocs</h1>
                </div>
                <p className="text-gray-600">Central document repository for HakiChain</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                  <Upload className="w-4 h-4" />
                  Upload Files
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
                  Select from HakiDocs
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="doc">DOC</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">Upload your first document to get started</p>
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
              Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
