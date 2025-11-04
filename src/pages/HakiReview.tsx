import { useState } from "react"
import LawyerSidebar from "../components/LawyerSidebar"
import { Eye, Upload, MessageSquare } from "lucide-react"
import TourGuide from "../components/TourGuide"

export default function HakiReview() {
  const [showTour, setShowTour] = useState(false)
  const [message, setMessage] = useState("")

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showTour && <TourGuide onComplete={() => setShowTour(false)} />}
      <LawyerSidebar onTourStart={() => setShowTour(true)} />
      <div className="flex-1 ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HakiReview</h1>
            </div>
            <p className="text-gray-600">AI-powered document analysis and legal review</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop your PDF, DOCX, or DOC file here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  Select File
                </button>
                <p className="text-xs text-gray-500 mt-4">Supported formats: PDF, DOCX, DOC</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">HakiReview Assistant</h2>
              <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
                  Chat
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm">
                  Edit
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm">
                  E-Sign
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm text-blue-900">
                  Hi! I'm your AI document assistant. I can help you review, analyze, edit, and sign your legal
                  documents. Upload a document to get started!
                </p>
                <p className="text-xs text-blue-600 mt-2">05:03 PM</p>
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me about your document..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
