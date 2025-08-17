"use client"

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export default function SettingsPage() {
  const handleLogout = () => {
    localStorage.removeItem('admin-logged-in')
    window.location.href = '/admin'
  }


  // Get masked environment variables for display
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'Not configured'
  const whatsappKeyword = process.env.NEXT_PUBLIC_WHATSAPP_KEYWORD || 'Not configured'

  const maskString = (str: string) => {
    if (str === 'Not configured' || str.length <= 4) return str
    return str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2)
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="flex-shrink-0 w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">⚙️</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            System configuration and management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Environment Info */}
        <Card>
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🌐</span>
              </div>
              <CardTitle className="text-lg">Environment Info</CardTitle>
            </div>
            <CardDescription>Current system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp Number
              </label>
              <div className="text-sm font-mono bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border">
                {maskString(whatsappNumber)}
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp Keyword
              </label>
              <div className="flex items-center gap-3">
                <div className="text-sm font-mono bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border flex-1">
                  {maskString(whatsappKeyword)}
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-lg">Admin Actions</CardTitle>
            <CardDescription className="mt-2">Administrative functions and logout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="neumorphic-secondary"
              onClick={handleLogout}
              className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg text-blue-800 dark:text-blue-200">About This System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            This admin interface manages campaigns and contacts for the SMS notification system. 
            Use the Campaigns section to create and manage messaging campaigns, and the Contacts section to view and manage your subscriber list.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}