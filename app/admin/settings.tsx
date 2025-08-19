"use client"

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export default function SettingsPage() {
  const handleLogout = () => {
    localStorage.removeItem('admin-logged-in')
    window.location.href = '/admin'
  }


  // Get masked environment variables for display
  const whatsappNumber = process.env.NEXT_PUBLIC_WA_NUMBER_E164 || '+19095290130'
  const whatsappKeyword = process.env.NEXT_PUBLIC_WA_KEYWORD || 'Not configured'

  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber === 'Not configured') return phoneNumber
    
    // Remove any non-digit characters except the leading +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    
    // Check if it starts with + and has enough digits
    if (cleaned.startsWith('+') && cleaned.length >= 11) {
      const countryCode = cleaned.substring(1, cleaned.length - 10) // Everything except last 10 digits
      const areaCode = cleaned.substring(cleaned.length - 10, cleaned.length - 7) // Next 3 digits
      const firstPart = cleaned.substring(cleaned.length - 7, cleaned.length - 4) // Next 3 digits
      const secondPart = cleaned.substring(cleaned.length - 4) // Last 4 digits
      
      return `+${countryCode} (${areaCode}) ${firstPart} - ${secondPart}`
    }
    
    return phoneNumber // Return as-is if format is unexpected
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          System configuration and management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Environment Info */}
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-lg">Environment Info</CardTitle>
            <CardDescription>Current system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp Number
              </label>
              <div className="text-sm font-mono bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border">
                {formatPhoneNumber(whatsappNumber)}
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp Keyword
              </label>
              <div className="text-sm font-mono bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border">
                {whatsappKeyword}
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
    </div>
  )
}