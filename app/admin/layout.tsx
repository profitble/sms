"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import ContactsPage from './contacts'
import SettingsPage from './settings'

const sidebarItems = [
  { key: "campaigns", label: "Campaigns" },
  { key: "contacts", label: "Contacts" },
  { key: "settings", label: "Settings" }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState<string>("campaigns")


  const renderContent = () => {
    switch (activeTab) {
      case "contacts":
        return <ContactsPage />
      case "settings":
        return <SettingsPage />
      default:
        return children
    }
  }

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-600 text-white font-bold text-sm">
              A
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Admin Portal
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Management Dashboard</p>
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
                  className={`w-full justify-start h-12 px-4 ${isActive ? '' : 'text-gray-700 bg-transparent border-0 shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'}`}
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
            <Button variant="neumorphic-white" className="w-full justify-start h-10 text-gray-600 bg-transparent border-0 shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400">
              <span>← Back to Join</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-8 lg:p-12 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}