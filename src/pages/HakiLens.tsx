import { useState } from "react"
import LawyerSidebar from "../components/LawyerSidebar"
import { Search, Database, Sparkles } from "lucide-react"
import TourGuide from "../components/TourGuide"
import DeepResearchTab from "../components/DeepResearchTab"
import CaseDatabaseTab from "../components/CaseDatabaseTab"
import AiAssistantTab from "../components/AiAssistantTab"

export default function HakiLens() {
  const [activeTab, setActiveTab] = useState("deep-research")
  const [showTour, setShowTour] = useState(false)

  const tabs = [
    {
      id: "deep-research",
      label: "Deep Research",
      icon: Search,
      component: DeepResearchTab
    },
    {
      id: "case-database",
      label: "Case Database",
      icon: Database,
      component: CaseDatabaseTab
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: Sparkles,
      component: AiAssistantTab
    }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DeepResearchTab

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showTour && <TourGuide onComplete={() => setShowTour(false)} />}
      <LawyerSidebar onTourStart={() => setShowTour(true)} />
      <div className="flex-1 ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HakiLens - Kenya Law Research Hub</h1>
            </div>
            <p className="text-gray-600">Comprehensive legal research with Kenya Law scraping, AI analysis, and document management</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <div className="flex gap-1 px-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                        activeTab === tab.id 
                          ? "border-blue-600 text-blue-600" 
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-8">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}