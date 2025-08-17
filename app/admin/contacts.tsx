"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
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

async function uploadCsv(file: File): Promise<{ imported: number; skipped: number; invalid: number }> {
  // MVP placeholder - in production, implement server-side CSV processing
  console.log('CSV upload:', file.name)
  return { imported: 5, skipped: 2, invalid: 1 }
}

async function fetchContacts(filters: { phoneFilter?: string; dateFrom?: string; dateTo?: string }): Promise<InboundRecord[]> {
  // MVP placeholder - in production, fetch from Supabase
  console.log('Fetching contacts with filters:', filters)
  return [
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
    }
  ]
}

async function exportCsv(filters: { phoneFilter?: string; dateFrom?: string; dateTo?: string }): Promise<void> {
  // MVP placeholder - in production, export filtered data from Supabase
  console.log('Exporting with filters:', filters)
  const csvContent = 'phone_e164,keyword,received_at,country_iso2\n+14155551234,JOIN,2024-01-01,US\n+14155555678,JOIN,2024-01-02,US'
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'contacts.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function ContactsPage() {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<InboundRecord[]>([])
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; invalid: number } | null>(null)
  const [filters, setFilters] = useState({ phoneFilter: '', dateFrom: '', dateTo: '' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const loadContacts = useCallback(async () => {
    try {
      const data = await fetchContacts(filters)
      setContacts(data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }, [filters])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000)
  }

  const handleSelectAll = () => {
    const allVisible = new Set(contacts.map(c => c.phone_e164))
    setSelected(allVisible)
  }

  const handleClearSelection = () => {
    setSelected(new Set())
  }

  const handleRowSelect = (phone: string, checked: boolean) => {
    const newSelected = new Set(selected)
    if (checked) {
      newSelected.add(phone)
    } else {
      newSelected.delete(phone)
    }
    setSelected(newSelected)
  }

  const handleHeaderCheckbox = (checked: boolean) => {
    if (checked) {
      handleSelectAll()
    } else {
      handleClearSelection()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const result = await uploadCsv(file)
      setImportResult(result)
      await loadContacts()
    } catch {
      showToast('Upload failed', 'error')
    }
    setLoading(false)
    e.target.value = ''
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      await exportCsv(filters)
      showToast('Export completed successfully')
    } catch {
      showToast('Export failed', 'error')
    }
    setLoading(false)
  }

  const selectedCount = selected.size
  const allVisibleSelected = contacts.length > 0 && contacts.every(c => selected.has(c.phone_e164))
  const someVisibleSelected = contacts.some(c => selected.has(c.phone_e164))

  return (
    <div className="space-y-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contacts</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and filter your contact database.
        </p>
      </div>

      {importResult && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-800 dark:text-green-200">Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm text-green-700 dark:text-green-300">
              <div><span className="font-medium">Imported:</span> {importResult.imported}</div>
              <div><span className="font-medium">Skipped:</span> {importResult.skipped}</div>
              <div><span className="font-medium">Invalid:</span> {importResult.invalid}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-lg">Import CSV</CardTitle>
            <CardDescription className="mt-2">Upload a CSV file to import contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 dark:file:bg-sky-900 dark:file:text-sky-300"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-lg">Filters & Export</CardTitle>
            <CardDescription className="mt-2">Filter contacts and export data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="phone-filter" className="text-sm font-medium">Phone Contains</Label>
              <Input
                id="phone-filter"
                type="text"
                value={filters.phoneFilter}
                onChange={(e) => setFilters(f => ({ ...f, phoneFilter: e.target.value }))}
                placeholder="Search by phone number"
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-3">
                <Label htmlFor="date-from" className="text-sm font-medium">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  className="h-10"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="date-to" className="text-sm font-medium">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>
            <Button
              variant="neumorphic-green"
              onClick={handleExport}
              disabled={loading}
              className="w-full h-9"
            >
              Export CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedCount > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-blue-800 dark:text-blue-200 border-blue-300">
                  {selectedCount} selected
                </Badge>
                <div className="flex gap-3">
                  <Button
                    variant="neumorphic-secondary"
                    onClick={handleSelectAll}
                    className="h-8 text-xs px-3"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="neumorphic-secondary"
                    onClick={handleClearSelection}
                    className="h-8 text-xs px-3"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-lg">Contacts ({contacts.length})</CardTitle>
          <CardDescription className="mt-2">All contacts in your database</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {contacts.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              No contacts found. Import a CSV file to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
                        }}
                        onChange={(e) => handleHeaderCheckbox(e.target.checked)}
                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        aria-label="Select all contacts"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Received At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.has(contact.phone_e164)}
                          onChange={(e) => handleRowSelect(contact.phone_e164, e.target.checked)}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          aria-label={`Select contact ${contact.phone_e164}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                        {contact.phone_e164}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {contact.keyword ? (
                          <Badge variant="outline">{contact.keyword}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {contact.country_iso2 || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(contact.received_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}