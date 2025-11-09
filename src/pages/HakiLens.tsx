import { useEffect } from "react"
import LawyerSidebar from "../components/LawyerSidebar"
import { Search, Database, Sparkles, AlertCircle } from "lucide-react"
import TourGuide from "../components/TourGuide"
import { legalResearch } from "../lib/llm"
import { useProcess } from "../contexts/ProcessContext"
import { LegalMarkdownRenderer } from "../components/LegalMarkdownRenderer"

export default function HakiLens() {
  const { getProcessState, updateProcessState } = useProcess()
  const lensState = getProcessState("hakiLens")
  const {
    showTour,
    activeTab,
    deepResearchMode,
    searchUrl,
    caseSearchTerm,
    sortBy,
    aiQuestion,
    searching,
    searchResult,
    searchError,
    aiAnswer,
    aiLoading,
    aiError,
  } = lensState

  useEffect(() => {
    console.log("[HakiLens] mounted")
    return () => {
      console.log("[HakiLens] unmounted")
    }
  }, [])

  useEffect(() => {
    console.log("[HakiLens] state updated", lensState)
  }, [lensState])

  const handleDeepResearch = async () => {
    if (!searchUrl) {
      alert("Please enter a URL to research")
      return
    }

    updateProcessState("hakiLens", {
      searching: true,
      searchError: null,
      searchResult: "",
    })

    try {
      const prompt = `Perform deep legal research on the following URL: ${searchUrl}

Research Mode: ${deepResearchMode}

Please analyze the content and provide:
1. Summary of the legal case or content
2. Key legal issues identified
3. Relevant legal precedents or references
4. Jurisdiction and court information (if applicable)
5. Important dates and parties involved
6. Legal analysis and implications

Note: This is a research request. Analyze the URL content and provide comprehensive legal research findings.`

      const response = await legalResearch(prompt)

      if (response.error) {
        updateProcessState("hakiLens", {
          searchError: response.error,
          searchResult: "",
        })
      } else if (response.content) {
        updateProcessState("hakiLens", {
          searchResult: `Deep Research Results for: ${searchUrl}\n\nMode: ${deepResearchMode}\n\n${response.content}`,
          searchError: null,
        })
      } else {
        updateProcessState("hakiLens", {
          searchError: "No research results generated. Please try again.",
          searchResult: "",
        })
      }
    } catch (err) {
      updateProcessState("hakiLens", {
        searchError: err instanceof Error ? err.message : "An unexpected error occurred during research.",
        searchResult: "",
      })
    } finally {
      updateProcessState("hakiLens", {
        searching: false,
      })
    }
  }

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) {
      alert("Please enter a question")
      return
    }

    updateProcessState("hakiLens", {
      aiLoading: true,
      aiError: null,
      aiAnswer: "",
    })

    try {
      const context = caseSearchTerm ? `Search context: ${caseSearchTerm}` : undefined
      const response = await legalResearch(aiQuestion, context)

      if (response.error) {
        updateProcessState("hakiLens", {
          aiError: response.error,
          aiAnswer: "",
        })
      } else if (response.content) {
        updateProcessState("hakiLens", {
          aiAnswer: response.content,
          aiError: null,
        })
      } else {
        updateProcessState("hakiLens", {
          aiError: "No answer generated. Please try again.",
          aiAnswer: "",
        })
      }
    } catch (err) {
      updateProcessState("hakiLens", {
        aiError: err instanceof Error ? err.message : "An unexpected error occurred.",
        aiAnswer: "",
      })
    } finally {
      updateProcessState("hakiLens", {
        aiLoading: false,
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showTour && <TourGuide onComplete={() => updateProcessState("hakiLens", { showTour: false })} />}
      <LawyerSidebar onTourStart={() => updateProcessState("hakiLens", { showTour: true })} />
      <div className="flex-1 ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HakiLens - Comprehensive Legal Research Hub</h1>
            </div>
            <p className="text-gray-600">Advanced case deep research, database management, and AI-powered analysis</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <div className="flex gap-1 px-6">
                <button
                  onClick={() => updateProcessState("hakiLens", { activeTab: "deep-research" })}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                    activeTab === "deep-research" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Deep Research
                </button>
                <button
                  onClick={() => updateProcessState("hakiLens", { activeTab: "case-database" })}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                    activeTab === "case-database" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Case Database
                </button>
                <button
                  onClick={() => updateProcessState("hakiLens", { activeTab: "ai-assistant" })}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                    activeTab === "ai-assistant" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  AI Assistant
                </button>
              </div>
            </div>

            <div className="p-8">
              {activeTab === "deep-research" && (
                <div>
                  <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
                    <button
                      onClick={() => updateProcessState("hakiLens", { deepResearchMode: "auto-detect" })}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        deepResearchMode === "auto-detect" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Auto Detect
                    </button>
                    <button
                      onClick={() => updateProcessState("hakiLens", { deepResearchMode: "listing-crawl" })}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        deepResearchMode === "listing-crawl" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Listing Crawl
                    </button>
                    <button
                      onClick={() => updateProcessState("hakiLens", { deepResearchMode: "single-case" })}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        deepResearchMode === "single-case" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Single Case
                    </button>
                  </div>

                  <div className="max-w-3xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL to Deep Research</label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={searchUrl}
                        onChange={(e) => updateProcessState("hakiLens", { searchUrl: e.target.value })}
                        placeholder="https://example.com/case-page-or-listing"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleDeepResearch}
                        disabled={searching}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
                      >
                        {searching ? "Searching..." : "Deep Research"}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {deepResearchMode === "auto-detect" && "Automatically detects cases or listings"}
                      {deepResearchMode === "listing-crawl" && "Crawls paginated listings"}
                      {deepResearchMode === "single-case" && "Research single case detail page"}
                    </p>
                  </div>

                  {searchError && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-red-900 mb-1">Research Error</h3>
                          <p className="text-sm text-red-700">{searchError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {searchResult && (
                    <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-3">Research Results</h3>
                      <LegalMarkdownRenderer content={searchResult} />
                      <button
                        onClick={() =>
                          updateProcessState("hakiLens", {
                            searchResult: "",
                            searchError: null,
                          })
                        }
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Clear Results
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "case-database" && (
                <div>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={caseSearchTerm}
                        onChange={(e) => updateProcessState("hakiLens", { caseSearchTerm: e.target.value })}
                        placeholder="Search cases by title, parties, or content..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => updateProcessState("hakiLens", { sortBy: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="date_created">Date Created</option>
                      <option value="title">Title</option>
                      <option value="court">Court</option>
                      <option value="case_number">Case Number</option>
                    </select>
                  </div>

                  <div className="text-center py-16">
                    <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Cases Found</h3>
                    <p className="text-gray-600">Try adjusting your search or load more cases.</p>
                  </div>
                </div>
              )}

              {activeTab === "ai-assistant" && (
                <div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-medium text-purple-900 mb-1">AI Legal Assistant</h3>
                        <p className="text-sm text-purple-700">
                          Ask questions about your case database. The AI will search through case content and provide answers based on relevant cases.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ask a Legal Question</label>
                    <textarea
                      value={aiQuestion}
                      onChange={(e) => updateProcessState("hakiLens", { aiQuestion: e.target.value })}
                      placeholder="e.g., What are the key precedents for contract disputes in commercial law?"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      disabled={aiLoading}
                    ></textarea>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleAIQuestion}
                        disabled={aiLoading}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {aiLoading ? "Thinking..." : "Ask AI"}
                      </button>
                    </div>
                    {aiError && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-red-900 mb-1">Error</h3>
                            <p className="text-sm text-red-700">{aiError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {aiAnswer && (
                      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="font-medium text-purple-900 mb-2">AI Answer</h3>
                        <LegalMarkdownRenderer content={aiAnswer} className="text-purple-900" />
                        <button
                          onClick={() =>
                            updateProcessState("hakiLens", {
                              aiAnswer: "",
                              aiError: null,
                            })
                          }
                          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          Clear Answer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
