import { useState } from "react"
import LawyerSidebar from "../components/LawyerSidebar"
import { Clock, Plus, Sparkles } from "lucide-react"
import TourGuide from "../components/TourGuide"

export default function HakiReminders() {
  const [showTour, setShowTour] = useState(false)

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
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">HakiReminders</h1>
                </div>
                <p className="text-gray-600">AI-powered reminder management with Kanban workflow</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200">
                  <Sparkles className="w-4 h-4" />
                  AI Suggestions
                  <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-xs">0</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  New Reminder
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="bg-blue-50 border-l-4 border-blue-600 px-4 py-2 mb-4">
                <h3 className="font-semibold text-blue-900">Scheduled</h3>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No scheduled reminders</p>
              </div>
            </div>

            <div>
              <div className="bg-green-50 border-l-4 border-green-600 px-4 py-2 mb-4">
                <h3 className="font-semibold text-green-900">Sent</h3>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No sent reminders</p>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 border-l-4 border-gray-600 px-4 py-2 mb-4">
                <h3 className="font-semibold text-gray-900">History</h3>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No history reminders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
