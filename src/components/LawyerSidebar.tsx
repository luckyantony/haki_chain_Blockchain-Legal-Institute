"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  LayoutGrid,
  Briefcase,
  Search,
  Wand2,
  Eye,
  Clock,
  FileText,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react"

interface LawyerSidebarProps {
  onTourStart?: () => void
}

export default function LawyerSidebar({ onTourStart }: LawyerSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid, href: "/dashboard" },
    { id: "cases", label: "Cases", icon: Briefcase, href: "/dashboard?tab=cases" },
    { id: "haki-lens", label: "HakiLens", icon: Search, href: "/dashboard?tab=haki-lens" },
    { id: "haki-draft", label: "HakiDraft", icon: Wand2, href: "/dashboard?tab=haki-draft" },
    { id: "haki-review", label: "HakiReview", icon: Eye, href: "/dashboard?tab=haki-review" },
    { id: "haki-reminders", label: "HakiReminders", icon: Clock, href: "/dashboard?tab=haki-reminders" },
    { id: "documents", label: "Documents", icon: FileText, href: "/dashboard?tab=documents" },
  ]

  const bottomItems = [
    { id: "take-tour", label: "Take Tour", icon: HelpCircle, onClick: onTourStart },
    { id: "settings", label: "Settings", icon: Settings, href: "/dashboard?tab=settings" },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:hidden z-40 p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
          isOpen ? "w-64" : "w-20"
        } md:static md:w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
              HC
            </div>
            {isOpen && <span className="font-bold text-gray-900">HakiChain</span>}
          </div>

          {/* Main Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  location.pathname === item.href || (location.search.includes(item.id) && item.id !== "overview")
                    ? "bg-teal-100 text-teal-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom Menu */}
          <div className="border-t border-gray-200 p-3 space-y-2">
            {bottomItems.map((item) => {
              if (item.onClick) {
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition text-left"
                    title={!isOpen ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span>{item.label}</span>}
                  </button>
                )
              }
              return (
                <Link
                  key={item.id}
                  to={item.href!}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  title={!isOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>

          {/* Toggle Button */}
          <div className="hidden md:flex p-3 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
