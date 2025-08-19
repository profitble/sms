"use client";

import { useState, useEffect, useCallback } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'

type InboundRecord = {
  id: string
  phone_e164: string
  keyword: string | null
  raw_text: string | null
  country_iso2: string | null
  received_at: string
}

type ToastState = {
  show: boolean
  message: string
  type: 'success' | 'error'
}

// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
  'US': '🇺🇸',
  'CA': '🇨🇦', 
  'GB': '🇬🇧',
  'JP': '🇯🇵',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'AU': '🇦🇺',
  'BR': '🇧🇷'
}

async function fetchContacts(countryFilter?: string, keywordFilter?: string): Promise<InboundRecord[]> {
  // MVP placeholder - in production, fetch from Supabase
  console.log('Fetching contacts with filter:', countryFilter, keywordFilter)
  const allContacts = [
    {
      id: '1',
      phone_e164: '+14155551234',
      keyword: 'JOIN',
      raw_text: 'JOIN please',
      country_iso2: 'US',
      received_at: new Date().toISOString()
    },
    {
      id: '2', 
      phone_e164: '+14155555678',
      keyword: 'JOIN',
      raw_text: 'JOIN updates',
      country_iso2: 'US',
      received_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      phone_e164: '+819012345678',
      keyword: 'JOIN',
      raw_text: 'JOIN service',
      country_iso2: 'JP',
      received_at: new Date(Date.now() - 172800000).toISOString()
    }
  ]
  
  let filtered = allContacts
  if (countryFilter && countryFilter !== 'All') {
    filtered = filtered.filter(contact => contact.country_iso2 === countryFilter)
  }
  if (keywordFilter && keywordFilter !== 'All') {
    filtered = filtered.filter(contact => (contact.keyword || '') === keywordFilter)
  }
  return filtered
}

// Desktop Component - Optimized for larger screens
function DesktopAdminPage() {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<InboundRecord[]>([])
  const [message, setMessage] = useState('Join our exclusive updates! Reply STOP to opt out.')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [countryFilter, setCountryFilter] = useState('All')
  const [keywordFilter, setKeywordFilter] = useState('All')
  const [allContacts, setAllContacts] = useState<InboundRecord[]>([])
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    if (cleaned.startsWith('+') && cleaned.length >= 11) {
      const countryCode = cleaned.substring(1, cleaned.length - 10)
      const areaCode = cleaned.substring(cleaned.length - 10, cleaned.length - 7)
      const firstPart = cleaned.substring(cleaned.length - 7, cleaned.length - 4)
      const secondPart = cleaned.substring(cleaned.length - 4)
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`
    }
    return phoneNumber
  }

  const loadContacts = useCallback(async () => {
    try {
      const data = await fetchContacts(countryFilter, keywordFilter)
      setContacts(data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }, [countryFilter, keywordFilter])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Load unfiltered contacts once to power filter dropdowns
  useEffect(() => {
    fetchContacts()
      .then(setAllContacts)
      .catch((err) => console.error('Failed to load all contacts:', err))
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      showToast('Please select an image file', 'error')
    }
    e.target.value = ''
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSendCampaign = async () => {
    if (!message.trim()) {
      showToast('Please enter a message', 'error')
      return
    }
    if (contacts.length === 0) {
      showToast('No contacts to send to', 'error') 
      return
    }
    
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast(`Campaign sent to ${contacts.length} contacts!`)
    }, 2000)
  }

  const filterSource = (allContacts.length ? allContacts : contacts)
  const uniqueCountries = ['All', ...new Set(filterSource.map(c => c.country_iso2).filter(Boolean))] as string[]
  const uniqueKeywords = ['All', ...new Set(filterSource.map(c => c.keyword).filter(Boolean))] as string[]

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar - Fixed */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Campaign Launch</h1>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Connected</span>
            </div>
          </div>
          <Button 
            onClick={handleSendCampaign}
            disabled={loading || contacts.length === 0}
            variant="neumorphic-primary"
            className="px-8 py-2.5 h-auto text-base font-medium rounded-lg"
          >
            {loading ? 'Sending...' : `Send To ${contacts.length} Contacts`}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Message Composer */}
        <div className="w-[26rem] bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Message Section */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">Compose Message</h3>
              <div className="space-y-6">
                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your campaign message..."
                    className="w-full h-24 px-4 py-3 text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed"
                    maxLength={160}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-500 font-medium">{message.length}/160 characters</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                    Add Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Attachment"
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Message Preview */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">Preview</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">S</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {message || "Enter your campaign message..."}
                      </p>
                      {imagePreview && (
                        <div className="mt-3">
                          <img
                            src={imagePreview}
                            alt="Message attachment"
                            className="max-w-full h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-500">SMS</span>
                        <span className="text-sm text-gray-400">now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Stats - Always Visible */}
          <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-base text-gray-600 dark:text-gray-400">Contacts</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">{contacts.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-base text-gray-600 dark:text-gray-400">Last Sent</span>
                <span className="text-base font-semibold text-gray-600 dark:text-gray-400">2 hrs ago</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-base text-gray-600 dark:text-gray-400">Total Sent</span>
                <span className="text-base font-semibold text-gray-600 dark:text-gray-400">1,247</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Contact List */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Contact List Header */}
          <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                  Contacts ({contacts.length.toLocaleString()})
                </h2>
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">Filter:</label>
                  <div className="relative">
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="appearance-none text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 pr-8 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-500 min-w-32"
                    >
                      {uniqueCountries.map(country => (
                        <option key={country} value={country}>
                          {country === 'All' ? 'All Countries' : `${countryFlags[country] || '🌍'} ${country}`}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                  </div>
                  <div className="relative">
                    <select
                      value={keywordFilter}
                      onChange={(e) => setKeywordFilter(e.target.value)}
                      className="appearance-none text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 pr-8 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-500 min-w-32"
                    >
                      {uniqueKeywords.map(kw => (
                        <option key={kw} value={kw}>
                          {kw === 'All' ? 'All Keywords' : kw}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                  </div>
                </div>
              </div>
              <Button variant="neumorphic-secondary" className="px-5 py-2 h-auto text-sm font-medium rounded-lg">
                Add Contact
              </Button>
            </div>
          </div>

          {/* Contact List Table Header */}
          <div className="px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-10 gap-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-1">Country</div>
              <div className="col-span-4">Phone Number</div>
              <div className="col-span-3">Date Added</div>
              <div className="col-span-2">Keyword</div>
            </div>
          </div>

          {/* Scrollable Contact List */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
            {contacts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center space-y-3">
                  <p className="text-lg font-medium">No contacts yet</p>
                  <p className="text-sm">Add a contact to get started</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {contacts.map((contact) => (
                  <div key={contact.id} className="px-8 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="grid grid-cols-10 gap-6 items-center">
                      <div className="col-span-1">
                        <span className="text-xl">{countryFlags[contact.country_iso2 || ''] || '🌍'}</span>
                      </div>
                      <div className="col-span-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-white font-medium">
                          {formatPhoneNumber(contact.phone_e164)}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(contact.received_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="col-span-2">
                        {contact.keyword ? (
                          <Badge variant="outline" className="text-xs px-3 py-1 font-medium">
                            {contact.keyword}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Load More Indicator for large lists */}
                {contacts.length > 50 && (
                  <div className="px-8 py-6 text-center border-t border-gray-200 dark:border-gray-700">
                    <Button variant="neumorphic-secondary" className="text-sm px-6 py-2 h-auto font-medium rounded-lg">
                      Load More Contacts
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

// Mobile Component - Optimized for smaller screens
function MobileAdminPage() {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<InboundRecord[]>([])
  const [message, setMessage] = useState('Join our exclusive updates! Reply STOP to opt out.')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [countryFilter, setCountryFilter] = useState('All')
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })
  const [allContacts, setAllContacts] = useState<InboundRecord[]>([])

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    if (cleaned.startsWith('+') && cleaned.length >= 11) {
      const countryCode = cleaned.substring(1, cleaned.length - 10)
      const areaCode = cleaned.substring(cleaned.length - 10, cleaned.length - 7)
      const firstPart = cleaned.substring(cleaned.length - 7, cleaned.length - 4)
      const secondPart = cleaned.substring(cleaned.length - 4)
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`
    }
    return phoneNumber
  }

  const loadContacts = useCallback(async () => {
    try {
      const data = await fetchContacts(countryFilter)
      setContacts(data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }, [countryFilter])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Load unfiltered contacts once to power filter dropdowns
  useEffect(() => {
    fetchContacts()
      .then(setAllContacts)
      .catch((err) => console.error('Failed to load all contacts (mobile):', err))
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      showToast('Please select an image file', 'error')
    }
    e.target.value = ''
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSendCampaign = async () => {
    if (!message.trim()) {
      showToast('Please enter a message', 'error')
      return
    }
    if (contacts.length === 0) {
      showToast('No contacts to send to', 'error') 
      return
    }
    
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast(`Campaign sent to ${contacts.length} contacts!`)
    }, 2000)
  }

  const filterSource = (allContacts.length ? allContacts : contacts)
  const uniqueCountries = ['All', ...new Set(filterSource.map(c => c.country_iso2).filter(Boolean))] as string[]

  return (
    <div className="p-4 space-y-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Launch</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
          </div>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Send messages to your contacts instantly.
        </p>
      </div>

      {/* Primary Action */}
      <div className="mb-6">
        <Button 
          onClick={handleSendCampaign}
          disabled={loading || contacts.length === 0}
          variant="neumorphic-primary"
          className="w-full h-12 text-base font-semibold"
        >
          {loading ? 'Sending...' : `Send Campaign to ${contacts.length} contacts`}
        </Button>
      </div>

      {/* Message Composer */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your campaign message..."
              className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none text-sm"
              maxLength={160}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{message.length}/160 characters</span>
              <span className="text-xs text-gray-400">SMS optimized</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center justify-center px-3 py-2 h-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {selectedImage && (
                <span className="text-xs text-gray-500">{selectedImage.name}</span>
              )}
            </div>
            
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Message attachment"
                  className="max-w-24 max-h-24 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Campaign Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center py-2">
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">{contacts.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Contacts</div>
            </div>
            <div className="text-center py-2">
              <div className="text-xl font-bold text-green-600 mb-1">2 hrs ago</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Last Sent</div>
            </div>
            <div className="text-center py-2">
              <div className="text-xl font-bold text-sky-600 mb-1">1,247</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Messages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Contacts ({contacts.length})</CardTitle>
              <CardDescription className="mt-1 text-sm">
                {contacts.length === 0 ? 'Add contacts to get started' : 'Ready to send campaigns'}
              </CardDescription>
            </div>
            <Button variant="neumorphic-secondary" className="px-3 h-8 text-xs rounded-xl">
              Add Contact
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Label className="text-sm font-medium">Filter:</Label>
            <div className="relative">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-8 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 min-w-[120px]"
              >
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>
                    {country === 'All' ? 'All Countries' : `${countryFlags[country] || '🌍'} ${country}`}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No contacts yet. Add a contact to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{countryFlags[contact.country_iso2 || ''] || '🌍'}</span>
                      <div>
                        <div className="font-mono text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {formatPhoneNumber(contact.phone_e164)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(contact.received_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {contact.keyword && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        {contact.keyword}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {contacts.length > 5 && (
                <div className="text-center pt-3">
                  <Button variant="neumorphic-secondary" className="text-sm px-4 h-8 rounded-xl">
                    View all {contacts.length} contacts
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg shadow-lg text-white text-xs z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return isMobile ? <MobileAdminPage /> : <DesktopAdminPage />
}