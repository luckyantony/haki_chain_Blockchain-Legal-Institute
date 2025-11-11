import { useCallback, useEffect, useMemo, useState } from "react"
import LawyerSidebar from "../components/LawyerSidebar"
import { Wand2, FileText, AlertCircle, FileDown, Mail, Share, History, Save, CheckCircle2 } from "lucide-react"
import TourGuide from "../components/TourGuide"
import { generateDocument } from "../lib/llm"
import { useProcess, DraftVersion } from "../contexts/ProcessContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { exportToDocx, exportToPDF, sendToEmail, sendToHakiDocs } from "../lib/exporters"
import { toast } from "../../hooks/use-toast"
import { formatLegalLetter, sanitizeLegalContent } from "../lib/legalFormatter"
import { motion, AnimatePresence } from "framer-motion"
import { FullViewToggleButton } from "../components/FullViewToggleButton"
import { useFullViewToggle } from "../hooks/useFullViewToggle"
import { LegalRichEditor } from "../components/LegalRichEditor"

const templatePresets = [
  {
    id: "lod-standard",
    name: "Letter of Demand – Outstanding Invoices",
    category: "Litigation",
    documentType: "Letter of Demand",
    summary:
      "Standard letter of demand requiring payment of outstanding professional fees with notice of intended legal action.",
    defaultDescription:
      "Our firm has been instructed to demand settlement of the outstanding professional fees owing to our client.",
    content: `HAKICHAIN ADVOCATES LLP
1ST FLOOR, HAKI TOWERS, PARLIAMENT ROAD, NAIROBI
P.O. BOX 12345-00100 NAIROBI | TEL: +254 700 000000 | EMAIL: INFO@HAKICHAIN.CO.KE

11 July 2025

______________________________
______________________________
______________________________

RE: OUTSTANDING PROFESSIONAL FEES

1. TAKE NOTICE that you are lawfully indebted to our client in the sum of Kenya Shillings ___________ being outstanding professional fees for legal services rendered between ___________ and ___________.

2. DESPITE repeated reminders and demand, the entire sum remains unpaid beyond the agreed payment period.

3. WE ARE INSTRUCTED to demand, as we hereby do, immediate settlement of the aforesaid sum within seven (7) days from the date hereof together with any applicable interest pursuant to the retainer agreement.

4. TAKE FURTHER NOTICE that in default of compliance we hold firm instructions to institute recovery proceedings without further reference to you and at your risk as to costs and consequences.

Yours faithfully,

______________________________
For: HAKICHAIN ADVOCATES LLP`,
  },
  {
    id: "nda-startup",
    name: "Mutual NDA – Early Stage Venture",
    category: "Corporate / Business",
    documentType: "Non-Disclosure Agreement",
    summary:
      "Mutual non-disclosure agreement for preliminary commercial discussions between a start-up and investor.",
    defaultDescription:
      "Mutual NDA covering confidential information exchanged during preliminary venture and investment discussions.",
    content: `HAKICHAIN ADVOCATES LLP
1ST FLOOR, HAKI TOWERS, PARLIAMENT ROAD, NAIROBI
P.O. BOX 12345-00100 NAIROBI | TEL: +254 700 000000 | EMAIL: INFO@HAKICHAIN.CO.KE

11 July 2025

NON-DISCLOSURE AGREEMENT

1. PARTIES: This Agreement is made between ____________________ of ____________________ ("Party A") and ____________________ of ____________________ ("Party B").

2. PURPOSE: The Parties wish to explore a potential commercial relationship concerning ____________________ and anticipate disclosure of proprietary information.

3. CONFIDENTIAL INFORMATION: Each Party undertakes to keep strictly confidential all non-public technical, financial, commercial or strategic information disclosed by the other Party in any form.

4. OBLIGATIONS: Confidential Information shall be used solely for the Purpose, kept secure, disclosed only to personnel with a need to know, and returned or destroyed upon request.

5. TERM: This Agreement commences on the Effective Date and remains in force for three (3) years. Obligations of confidentiality survive termination for a further three (3) years.

6. GOVERNING LAW: This Agreement is governed by the laws of the Republic of Kenya and the Parties submit to the exclusive jurisdiction of the High Court of Kenya.

SIGNED by the Parties on the date appearing above.

______________________________
Party A Signature

______________________________
Party B Signature`,
  },
]

const formatTimestamp = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)

const formatVersionLabel = (version: DraftVersion) => {
  const date = new Date(version.createdAt)
  return formatTimestamp(date)
}

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

const documentTypesByCategory: Record<string, string[]> = {
  "General Documents": ["Letter of Demand", "Affidavit", "Power of Attorney", "Statutory Declaration"],
  "Litigation": ["Statement of Claim", "Statement of Defense", "Notice of Motion", "Submissions"],
  "Corporate / Business": ["Memorandum of Association", "Articles of Association", "Shareholders Agreement", "Board Resolution"],
  "Real Estate / Property": ["Sale Agreement", "Lease Agreement", "Transfer Documents", "Charge Documents"],
  "Family Law": ["Divorce Petition", "Custody Agreement", "Maintenance Order", "Prenuptial Agreement"],
  "Succession / Estate": ["Will", "Grant of Probate", "Letters of Administration", "Succession Cause"],
  "Employment / Labor": ["Employment Contract", "Termination Letter", "Non-Disclosure Agreement", "Non-Compete Agreement"],
  "Intellectual Property": ["Trademark Application", "Patent Application", "Copyright Assignment", "License Agreement"],
  "Immigration": ["Work Permit Application", "Visa Application", "Citizenship Application", "Appeal Letter"],
  "Regulatory / Compliance": ["Compliance Certificate", "Regulatory Submission", "Audit Report", "Complaint Response"],
  "Academic / Legal Research": ["Legal Opinion", "Research Memorandum", "Case Summary", "Legislative Brief"],
}

export default function HakiDraft() {
  const { getProcessState, updateProcessState } = useProcess()
  const draftState = getProcessState("hakiDraft")
  const {
    showTour,
    category,
    documentType,
    clientName,
    caseType,
    description,
    jurisdiction,
    generating,
    generatedDoc,
    editorContent,
    templateId,
    versions,
    lastSavedVersionId,
    approvedVersionId,
    error,
  } = draftState
  const { isFullView, toggleFullView } = useFullViewToggle("hakidraft-full-view")
  const [showHistory, setShowHistory] = useState(false)

  const selectedTemplate = useMemo(
    () => templatePresets.find((template) => template.id === templateId),
    [templateId]
  )

  const sortedVersions = useMemo(
    () =>
      [...versions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [versions]
  )

  const editorValue = editorContent ?? generatedDoc ?? ""
  const hasEditorContent = editorValue.trim().length > 0

  const handleTemplateSelect = useCallback(
    (presetId: string) => {
      if (!presetId) {
        updateProcessState("hakiDraft", { templateId: undefined })
        return
      }

      const template = templatePresets.find((preset) => preset.id === presetId)
      if (!template) {
        updateProcessState("hakiDraft", { templateId: undefined })
        return
      }

      updateProcessState("hakiDraft", (prev) => ({
        ...prev,
        templateId: template.id,
        category: template.category || prev.category,
        documentType: template.documentType || prev.documentType,
        description: template.defaultDescription || prev.description,
        generatedDoc: template.content,
        editorContent: template.content,
        lastSavedVersionId: null,
        approvedVersionId: null,
        error: null,
      }))

      toast({
        title: "Template loaded",
        description: template.summary,
      })
    },
    [updateProcessState]
  )

  const handleEditorChange = useCallback(
    (nextValue: string) => {
      updateProcessState("hakiDraft", { editorContent: nextValue })
    },
    [updateProcessState]
  )

  const handleSaveVersion = useCallback(
    (options?: { silent?: boolean }) => {
      let savedId: string | undefined
      let contentEmpty = false
      updateProcessState("hakiDraft", (prev) => {
        const contentToSave = (prev.editorContent || prev.generatedDoc || "").trim()
        if (!contentToSave) {
          contentEmpty = true
          return prev
        }

        const now = new Date()
        const id = `${now.getTime()}`
        const versionTitle = `${prev.documentType || "Draft"} · ${formatTimestamp(now)}`
        const newVersion: DraftVersion = {
          id,
          title: versionTitle,
          content: contentToSave,
          createdAt: now.toISOString(),
          templateId: prev.templateId,
          documentType: prev.documentType,
          approved: false,
        }

        savedId = id

        return {
          ...prev,
          versions: [newVersion, ...prev.versions],
          lastSavedVersionId: id,
        }
      })

      if (contentEmpty) {
        toast({
          title: "Nothing to save",
          description: "Generate or edit the draft before saving a version.",
        })
        return undefined
      }

      if (savedId && !options?.silent) {
        toast({
          title: "Version saved",
          description: "Snapshot added to the history timeline.",
        })
      }

      return savedId
    },
    [updateProcessState]
  )

  const handleRestoreVersion = useCallback(
    (versionId: string) => {
      const version = versions.find((entry) => entry.id === versionId)
      if (!version) return

      updateProcessState("hakiDraft", (prev) => ({
        ...prev,
        editorContent: version.content,
        generatedDoc: version.content,
        lastSavedVersionId: versionId,
      }))

      toast({
        title: "Version restored",
        description: version.title,
      })
    },
    [updateProcessState, versions]
  )

  const handleMarkApproved = useCallback(() => {
    let targetVersionId = lastSavedVersionId
    if (!targetVersionId) {
      targetVersionId = handleSaveVersion({ silent: true })
    }

    if (!targetVersionId) return

    updateProcessState("hakiDraft", (prev) => ({
      ...prev,
      approvedVersionId: targetVersionId,
      versions: prev.versions.map((version) =>
        version.id === targetVersionId
          ? { ...version, approved: true }
          : { ...version, approved: false }
      ),
    }))

    toast({
      title: "Version approved",
      description: "Marked as the client-ready draft.",
    })
    setShowHistory(true)
  }, [handleSaveVersion, lastSavedVersionId, updateProcessState])

  useEffect(() => {
    console.log("[HakiDraft] mounted")
    return () => {
      console.log("[HakiDraft] unmounted")
    }
  }, [])

  useEffect(() => {
    console.log("[HakiDraft] state updated", draftState)
  }, [draftState])

  const handleJurisdictionToggle = (country: string) => {
    updateProcessState("hakiDraft", (prev) => {
      const hasCountry = prev.jurisdiction.includes(country)
      const nextJurisdiction = hasCountry
        ? prev.jurisdiction.filter((c) => c !== country)
        : [...prev.jurisdiction, country]

      return {
        ...prev,
        jurisdiction: nextJurisdiction,
      }
    })
  }

  const handleGenerate = async () => {
    if (!category || !documentType || !clientName) {
      alert("Please fill in required fields (Category, Document Type, and Client Name)")
      return
    }

    updateProcessState("hakiDraft", {
      generating: true,
      error: null,
      generatedDoc: "",
    })

    try {
      const prompt = `Generate a professional legal document with the following specifications:

Document Type: ${documentType}
Category: ${category}
Jurisdiction(s): ${jurisdiction.join(", ")}
Client Name: ${clientName}
${caseType ? `Case Type: ${caseType}` : ""}
${description ? `Case Description: ${description}` : ""}

Requirements:
1. Generate a complete, professionally formatted ${documentType} document
2. Include all standard clauses and provisions relevant to ${category}
3. Ensure compliance with ${jurisdiction.join(" and ")} legal requirements
4. Include proper headers, date (${new Date().toLocaleDateString()}), and client information
5. Make the document ready for use by legal professionals
6. Include placeholders where specific details need to be filled in (e.g., [PARTY NAME], [AMOUNT], [DATE])
7. Follow proper legal document structure and formatting

Generate the complete document now:`

      const response = await generateDocument(prompt)

      if (response.error) {
        updateProcessState("hakiDraft", {
          error: response.error,
          generatedDoc: "",
        })
      } else if (response.content) {
        const sanitized = sanitizeLegalContent(response.content)
        const formattedDoc = formatLegalLetter({
          documentTitle: documentType || "Legal Document",
          firmName: undefined,
          firmAddress: undefined,
          firmContact: undefined,
          recipientName: clientName || undefined,
          recipientAddress: description || undefined,
          subject: caseType || documentType,
          body: sanitized,
          signerName: "____________________",
          signerTitle: "For: ____________________",
        })

        updateProcessState("hakiDraft", (prev) => {
          const now = new Date()
          const versionId = `${now.getTime()}`
          const versionTitle = `${documentType || prev.documentType || "Draft"} · ${formatTimestamp(now)}`
          const newVersion: DraftVersion = {
            id: versionId,
            title: versionTitle,
            content: formattedDoc,
            createdAt: now.toISOString(),
            templateId: prev.templateId,
            documentType: documentType || prev.documentType,
            approved: false,
          }

          return {
            ...prev,
            generatedDoc: formattedDoc,
            editorContent: formattedDoc,
            error: null,
            versions: [newVersion, ...prev.versions],
            lastSavedVersionId: versionId,
            approvedVersionId: null,
          }
        })
      } else {
        updateProcessState("hakiDraft", {
          error: "No content generated. Please try again.",
          generatedDoc: "",
        })
      }
    } catch (err) {
      updateProcessState("hakiDraft", {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please check your API configuration.",
        generatedDoc: "",
      })
    } finally {
      updateProcessState("hakiDraft", {
        generating: false,
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showTour && <TourGuide onComplete={() => updateProcessState("hakiDraft", { showTour: false })} />}
      <LawyerSidebar onTourStart={() => updateProcessState("hakiDraft", { showTour: true })} />
      <motion.div className="flex-1 ml-[280px] p-8" layout>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Document Generator</h1>
                <p className="text-gray-600">Generate professional legal documents with AI assistance</p>
              </div>
            </div>
            <FullViewToggleButton isFullView={isFullView} onToggle={toggleFullView} />
          </div>

          <motion.div layout className="flex flex-col gap-8">
            <motion.div layout className="flex flex-col lg:flex-row gap-8">
              <AnimatePresence initial={false} mode="sync">
                {!isFullView && (
                  <motion.div
                    key="hakidraft-config"
                    layout
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full lg:w-1/2"
                  >
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                      <h2 className="text-lg font-semibold text-gray-900">Document Configuration</h2>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="template-preset">
                          Load Template
                        </label>
                        <select
                          id="template-preset"
                          value={templateId ?? ""}
                          onChange={(e) => handleTemplateSelect(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="">Select a preset (optional)</option>
                          {templatePresets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.name}
                            </option>
                          ))}
                        </select>
                        {selectedTemplate && (
                          <p className="mt-2 text-xs text-gray-500 leading-relaxed">{selectedTemplate.summary}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="document-category">
                          Document Category *
                        </label>
                        <select
                          id="document-category"
                          value={category}
                          onChange={(e) => {
                            updateProcessState("hakiDraft", {
                              category: e.target.value,
                              documentType: "",
                            })
                          }}
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
                          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="document-type">
                            Document Type *
                          </label>
                          <select
                            id="document-type"
                            value={documentType}
                            onChange={(e) => updateProcessState("hakiDraft", { documentType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="">Select document type</option>
                            {documentTypesByCategory[category]?.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-name">
                          Client Name *
                        </label>
                        <input
                          id="client-name"
                          type="text"
                          value={clientName}
                          onChange={(e) => updateProcessState("hakiDraft", { clientName: e.target.value })}
                          placeholder="Enter client full name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="case-type">
                          Case Type
                        </label>
                        <input
                          id="case-type"
                          type="text"
                          value={caseType}
                          onChange={(e) => updateProcessState("hakiDraft", { caseType: e.target.value })}
                          placeholder="e.g., Civil, Criminal, Family Law"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="case-description">
                          Case Description
                        </label>
                        <textarea
                          id="case-description"
                          value={description}
                          onChange={(e) => updateProcessState("hakiDraft", { description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        ></textarea>
                      </div>

                      <div>
                        <fieldset className="space-y-2">
                          <legend className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</legend>
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
                        </fieldset>
                      </div>

                      <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating ? "Generating..." : "Generate Document"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                key="hakidraft-output"
                layout
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`w-full ${isFullView ? "" : "lg:w-1/2"}`}
              >
                <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Draft Workspace</h2>
                      {selectedTemplate && (
                        <p className="text-sm text-gray-500">Template: {selectedTemplate.name}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSaveVersion()}
                        disabled={!hasEditorContent}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-teal-400 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Save className="h-4 w-4" />
                        Save Version
                      </button>
                      <button
                        onClick={handleMarkApproved}
                        disabled={!hasEditorContent}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-teal-400 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Approved
                      </button>
                      <button
                        onClick={() => setShowHistory((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-teal-400 hover:text-teal-600"
                      >
                        <History className="h-4 w-4" />
                        {showHistory ? "Hide History" : "Version History"}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-red-900 mb-1">Generation Error</h3>
                          <p className="text-sm text-red-700">{error}</p>
                          <p className="text-xs text-red-600 mt-2">Please check your API configuration in the .env file.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    {hasEditorContent ? (
                      <LegalRichEditor value={editorValue} onChange={handleEditorChange} />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <FileText className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
                        <p className="text-sm text-gray-600">
                          Fill in the form, load a template, or begin drafting directly in the editor.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={!hasEditorContent}
                        >
                          Export
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            const content = editorValue.trim()
                            if (!content) {
                              toast({
                                title: "Nothing to export",
                                description: "Add or generate content before exporting.",
                              })
                              return
                            }
                            exportToPDF(content, `${documentType || "hakidraft-document"}.pdf`)
                            toast({ title: "Exported", description: "Document saved as PDF." })
                          }}
                        >
                          <FileDown className="h-4 w-4" /> Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const content = editorValue.trim()
                            if (!content) {
                              toast({
                                title: "Nothing to export",
                                description: "Add or generate content before exporting.",
                              })
                              return
                            }
                            await exportToDocx(content, `${documentType || "hakidraft-document"}.docx`)
                            toast({ title: "Exported", description: "Document saved as DOCX." })
                          }}
                        >
                          <FileText className="h-4 w-4" /> Export as DOCX
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const content = editorValue.trim()
                            if (!content) {
                              toast({
                                title: "Nothing to send",
                                description: "Add or generate content before sending.",
                              })
                              return
                            }
                            const result = sendToEmail(content)
                            if (result.sent && result.email) {
                              toast({ title: "Sent", description: `Document sent to ${result.email}` })
                            }
                          }}
                        >
                          <Mail className="h-4 w-4" /> Send to Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const content = editorValue.trim()
                            if (!content) {
                              toast({
                                title: "Nothing to send",
                                description: "Add or generate content before sending.",
                              })
                              return
                            }
                            sendToHakiDocs(content)
                            toast({ title: "Sent", description: "Sent to HakiDocs (dev mode)." })
                          }}
                        >
                          <Share className="h-4 w-4" /> Send to HakiDocs
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                      onClick={() =>
                        updateProcessState("hakiDraft", (prev) => ({
                          ...prev,
                          generatedDoc: "",
                          editorContent: "",
                          error: null,
                          lastSavedVersionId: null,
                          approvedVersionId: null,
                        }))
                      }
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Clear
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {showHistory && (
                      <motion.div
                        key="history"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="border border-gray-200 rounded-lg bg-gray-50 p-4 max-h-72 overflow-y-auto space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">Version History</p>
                          <button
                            onClick={() => setShowHistory(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Close
                          </button>
                        </div>
                        {sortedVersions.length === 0 ? (
                          <p className="text-xs text-gray-500">No saved versions yet.</p>
                        ) : (
                          sortedVersions.map((version) => {
                            const isLatest = version.id === lastSavedVersionId
                            const isApproved = version.id === approvedVersionId
                            return (
                              <div
                                key={version.id}
                                className={`rounded-lg border px-3 py-3 text-sm shadow-sm ${
                                  isApproved
                                    ? "border-teal-500 bg-teal-50"
                                    : isLatest
                                    ? "border-blue-300 bg-blue-50"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="font-semibold text-gray-900">{version.title}</p>
                                      <p className="text-xs text-gray-500">{formatVersionLabel(version)}</p>
                                    </div>
                                    <button
                                      onClick={() => handleRestoreVersion(version.id)}
                                      className="text-xs font-medium text-teal-700 hover:text-teal-900"
                                    >
                                      Restore
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-600 overflow-hidden text-ellipsis">
                                    {version.content.split("\\n").find((line) => line.trim().length > 0)?.slice(0, 160) ||
                                      "—"}
                                  </p>
                                  {isApproved && (
                                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Approved version
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
