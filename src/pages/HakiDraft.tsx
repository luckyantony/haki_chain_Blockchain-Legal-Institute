import { useState } from "react"
import LawyerSidebar from "../components/LawyerSidebar"
import { Wand2, FileText } from "lucide-react"
import TourGuide from "../components/TourGuide"

const documentCategories = [
  "General Documents",
  "Litigation",
  "Corporate / Business",
  "Real Estate / Property",
  "Family Law",
  "Succession / Estate",
  "Employment / Labor",
  "Intellectual Property",
  "Immigration",
  "Regulatory / Compliance",
  "Academic / Legal Research",
]

export default function HakiDraft() {
  const [showTour, setShowTour] = useState(false)
  const [category, setCategory] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [clientName, setClientName] = useState("")
  const [caseType, setCaseType] = useState("")
  const [description, setDescription] = useState("")
  const [jurisdiction, setJurisdiction] = useState<string[]>(["Kenya"])

  const handleJurisdictionToggle = (country: string) => {
    setJurisdiction((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showTour && <TourGuide onComplete={() => setShowTour(false)} />}
      <LawyerSidebar onTourStart={() => setShowTour(true)} />
      <div className="flex-1 ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Document Generator</h1>
            </div>
            <p className="text-gray-600">Generate professional legal documents with AI assistance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Document Configuration</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select document category</option>
                  {documentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select document type</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
                <input
                  type="text"
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  placeholder="e.g., Civil, Criminal, Family Law"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Case Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
                <div className="space-y-2">
                  {["Kenya", "Uganda", "Nigeria", "Ghana"].map((country) => (
                    <label key={country} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={jurisdiction.includes(country)}
                        onChange={() => handleJurisdictionToggle(country)}
                        className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition">
                Generate Document
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Document</h2>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
                <p className="text-sm text-gray-600">
                  Fill in the form and click "Generate Document" to create your legal template.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
