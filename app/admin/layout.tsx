"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import SettingsPage from './settings'

const sidebarItems = [
  { key: "campaigns", label: "Campaigns" },
  { key: "settings", label: "Settings" }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState<string>("campaigns")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


  const renderContent = () => {
    switch (activeTab) {
      case "settings":
        return <SettingsPage />
      default:
        return children
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-sky-600 text-white font-bold text-sm sm:text-xs">
              A
            </div>
            <h1 className="text-xl sm:text-lg font-semibold text-gray-900 dark:text-white">
              Admin Portal
            </h1>
          </div>
          <Button
            variant="neumorphic-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-transparent border-0 shadow-none p-2"
          >
            <span className="sr-only">Toggle menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.key
                return (
                  <Button
                    key={item.key}
                    variant={isActive ? "neumorphic-primary" : "neumorphic-white"}
                    onClick={() => {
                      setActiveTab(item.key)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full justify-start h-14 sm:h-11 px-4 text-base sm:text-sm ${isActive ? '' : 'text-gray-700 bg-transparent border-0 shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'}`}
                  >
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      isActive ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'
                    }`} aria-hidden="true" />
                    {item.label}
                  </Button>
                )
              })}
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <Link href="/">
                  <Button variant="neumorphic-white" className="w-full justify-start h-12 sm:h-10 text-base sm:text-sm text-gray-600 bg-transparent border-0 shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400">
                    <span>← Back to Join</span>
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 rounded-lg bg-sky-600 text-white font-bold text-base sm:text-sm">
                A
              </div>
              <div>
                <h1 className="text-xl sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Portal
                </h1>
                <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400">Management Dashboard</p>
              </div>
            </div>
            
            <nav className="space-y-3">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.key
                return (
                  <Button
                    key={item.key}
                    variant={isActive ? "neumorphic-primary" : "neumorphic-white"}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full justify-start h-14 sm:h-12 px-4 text-base sm:text-sm ${isActive ? '' : 'text-gray-700 bg-transparent border-0 shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className={`w-2 h-2 rounded-full mr-4 ${
                      isActive ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'
                    }`} aria-hidden="true" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </div>
          
          <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-800">
            <Link href="/">
              <Button variant="neumorphic-white" className="w-full justify-start h-12 sm:h-10 text-base sm:text-sm text-gray-600 bg-transparent border-0 shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400">
                <span>← Back to Join</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex-1">
          <main className="p-6 sm:p-4 lg:p-8 xl:p-12">
            <div className="max-w-6xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}