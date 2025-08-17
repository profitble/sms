"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { 
  maxLogin,
  addAssistant,
  toggleAssistant,
  deleteAssistant,
  loadOpenBlasts,
  loadRecipients,
  assignRecipients,
  unassignRecipients,
  fetchAssistants
} from './actions'

type Assistant = {
  id: string
  display_name: string
  code: string
  active: boolean
  notes: string | null
  created_at: string
}

type Blast = {
  id: string
  message: string
  created_at: string
  status: string
}

type Recipient = {
  id: string
  phone_e164: string
  state: 'pending' | 'sent' | 'deleted'
  assigned_to: string | null
  assistant_name?: string
}

type ToastState = {
  show: boolean
  message: string
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 30}`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export default function MaxPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [newAssistant, setNewAssistant] = useState({ displayName: '', code: '' })
  const [blasts, setBlasts] = useState<Blast[]>([])
  const [selectedBlastId, setSelectedBlastId] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [totalRecipients, setTotalRecipients] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectedAssistantId, setSelectedAssistantId] = useState('')
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' })
  
  const pageSize = 50

  const showToast = (message: string) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 2000)
  }
  
  const loadData = useCallback(async () => {
    try {
      const [assistantsData, blastsData] = await Promise.all([
        fetchAssistants(),
        loadOpenBlasts()
      ])
      setAssistants(assistantsData)
      setBlasts(blastsData)
      if (blastsData.length > 0 && !selectedBlastId) {
        setSelectedBlastId(blastsData[0].id)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }, [selectedBlastId])
  
  const loadRecipientsData = useCallback(async () => {
    if (!selectedBlastId) return
    try {
      const result = await loadRecipients(selectedBlastId, currentPage, pageSize)
      setRecipients(result.recipients)
      setTotalRecipients(result.total)
      setSelected(new Set())
    } catch (error) {
      console.error('Failed to load recipients:', error)
    }
  }, [selectedBlastId, currentPage, pageSize])

  useEffect(() => {
    const hasSession = getCookie('max_session') === '1'
    setIsAuthenticated(hasSession)
    if (hasSession) {
      loadData()
    }
  }, [loadData])
  
  useEffect(() => {
    if (selectedBlastId) {
      loadRecipientsData()
    }
  }, [selectedBlastId, currentPage, loadRecipientsData])

  const handleLogin = async (formData: FormData) => {
    setLoading(true)
    try {
      const result = await maxLogin(formData)
      if (result.ok) {
        setCookie('max_session', '1')
        setIsAuthenticated(true)
        setPassword('')
        await loadData()
      } else {
        showToast('Invalid password')
      }
    } catch {
      showToast('Login failed')
    }
    setLoading(false)
  }

  const handleAddAssistant = async (formData: FormData) => {
    setLoading(true)
    try {
      const result = await addAssistant(formData)
      if (result.ok) {
        setNewAssistant({ displayName: '', code: '' })
        await loadData()
        showToast('Assistant added successfully')
      } else {
        showToast(result.error || 'Failed to add assistant')
      }
    } catch {
      showToast('Failed to add assistant')
    }
    setLoading(false)
  }

  const handleToggleActive = async (id: string) => {
    const formData = new FormData()
    formData.append('id', id)
    const result = await toggleAssistant(formData)
    if (result.ok) {
      await loadData()
      showToast('Assistant updated successfully')
    } else {
      showToast('Failed to update assistant')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assistant?')) return
    
    const formData = new FormData()
    formData.append('id', id)
    const result = await deleteAssistant(formData)
    if (result.ok) {
      await loadData()
      showToast('Assistant deleted successfully')
    } else {
      showToast('Failed to delete assistant')
    }
  }
  
  const handleLogout = () => {
    deleteCookie('max_session')
    window.location.reload()
  }
  
  const handleSelectAll = () => {
    setSelected(new Set(recipients.map(r => r.id)))
  }
  
  const handleClearSelection = () => {
    setSelected(new Set())
  }
  
  const handleRowSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selected)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelected(newSelected)
  }
  
  const handleAssignRecipients = async () => {
    if (selected.size === 0) {
      showToast('No recipients selected')
      return
    }
    if (!selectedAssistantId) {
      showToast('Please select an assistant')
      return
    }
    
    const result = await assignRecipients(Array.from(selected), selectedAssistantId)
    if (result.ok) {
      showToast(`Assigned ${selected.size} recipient(s) successfully`)
      setSelected(new Set())
      setSelectedAssistantId('')
      await loadRecipientsData()
    } else {
      showToast(result.error || 'Failed to assign recipients')
    }
  }
  
  const handleUnassignRecipients = async () => {
    if (selected.size === 0) {
      showToast('No recipients selected')
      return
    }
    
    const result = await unassignRecipients(Array.from(selected))
    if (result.ok) {
      showToast(`Unassigned ${selected.size} recipient(s) successfully`)
      setSelected(new Set())
      await loadRecipientsData()
    } else {
      showToast(result.error || 'Failed to unassign recipients')
    }
  }
  
  const totalPages = Math.ceil(totalRecipients / pageSize)
  const startItem = totalRecipients === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalRecipients)
  const selectedCount = selected.size
  const allVisibleSelected = recipients.length > 0 && recipients.every(r => selected.has(r.id))
  const someVisibleSelected = recipients.some(r => selected.has(r.id))
  const activeAssistants = assistants.filter(a => a.active)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center pb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <CardTitle className="text-2xl">Max Login</CardTitle>
            <CardDescription>Enter password to access the Max console.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleLogin} className="space-y-4">
              <div className="space-y-5">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter Max password"
                />
              </div>
              <Button
                type="submit"
                variant="neumorphic-primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Max Console</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assistant management and task assignment</p>
            </div>
          </div>
          <Button variant="neumorphic-secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Assistants</CardTitle>
              <CardDescription>Manage assistant accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
            <form action={handleAddAssistant} className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <Label className="text-xs font-medium">Display Name</Label>
                  <Input
                    type="text"
                    name="display_name"
                    value={newAssistant.displayName}
                    onChange={(e) => setNewAssistant(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Assistant Name"
                    required
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Code</Label>
                  <Input
                    type="text"
                    name="code"
                    value={newAssistant.code}
                    onChange={(e) => setNewAssistant(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Short code"
                    required
                    className="h-9"
                  />
                </div>
                <Button
                  type="submit"
                  variant="neumorphic-primary"
                  disabled={loading}
                  className="h-9 px-3 text-sm"
                >
                  Add Assistant
                </Button>
              </div>
            </form>

            {assistants.length === 0 ? (
              <p className="text-gray-500 dark:text-neutral-400 text-center py-4 text-sm">No assistants yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-300 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-300 uppercase">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-300 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {assistants.map(assistant => (
                      <tr key={assistant.id} className="bg-white dark:bg-neutral-800">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{assistant.display_name}</td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900 dark:text-white">{assistant.code}</td>
                        <td className="px-4 py-2">
                          <span className={`text-xs rounded-full px-2 py-1 ${
                            assistant.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {assistant.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <Button
                              variant={assistant.active ? "neumorphic-secondary" : "neumorphic-green"}
                              onClick={() => handleToggleActive(assistant.id)}
                              className="h-7 px-2 text-xs"
                            >
                              {assistant.active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="neumorphic-secondary"
                              onClick={() => handleDelete(assistant.id)}
                              className="h-7 px-2 text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignment Tool</CardTitle>
              <CardDescription>Assign recipients to assistants for campaign delivery</CardDescription>
            </CardHeader>
            <CardContent>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Select Open Blast</Label>
                {blasts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-neutral-400">No open blasts available</p>
                ) : (
                  <select
                    value={selectedBlastId}
                    onChange={(e) => { setSelectedBlastId(e.target.value); setCurrentPage(1); }}
                    className="w-full h-9 text-sm px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                  >
                    {blasts.map(blast => (
                      <option key={blast.id} value={blast.id}>
                        {new Date(blast.created_at).toLocaleDateString()} - {blast.message.substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {selectedBlastId && (
                <>
                  {selectedCount > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Selected: {selectedCount}
                        </span>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="neumorphic-secondary"
                            onClick={handleSelectAll}
                            className="h-8 text-xs px-3"
                          >
                            Select All (visible)
                          </Button>
                          <Button
                            variant="neumorphic-secondary"
                            onClick={handleClearSelection}
                            className="h-8 text-xs px-3"
                          >
                            Clear
                          </Button>
                          <select
                            value={selectedAssistantId}
                            onChange={(e) => setSelectedAssistantId(e.target.value)}
                            className="h-8 text-xs px-2 border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select Assistant</option>
                            {activeAssistants.map(assistant => (
                              <option key={assistant.id} value={assistant.id}>
                                {assistant.display_name}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="neumorphic-primary"
                            onClick={handleAssignRecipients}
                            className="h-8 text-xs px-3"
                          >
                            Assign
                          </Button>
                          <Button
                            variant="neumorphic-secondary"
                            onClick={handleUnassignRecipients}
                            className="h-8 text-xs px-3"
                          >
                            Unassign
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-neutral-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-300 uppercase w-12">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              ref={(input) => {
                                if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
                              }}
                              onChange={(e) => e.target.checked ? handleSelectAll() : handleClearSelection()}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-300 uppercase">Phone</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-300 uppercase">State</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-300 uppercase">Assigned To</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                        {recipients.map((recipient, index) => (
                          <tr
                            key={recipient.id}
                            className={index % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-gray-50 dark:bg-neutral-700/50'}
                          >
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selected.has(recipient.id)}
                                onChange={(e) => handleRowSelect(recipient.id, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm font-mono text-gray-900 dark:text-white">
                              {recipient.phone_e164}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`text-xs rounded-full px-2 py-1 ${
                                recipient.state === 'sent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                recipient.state === 'deleted' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {recipient.state}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {recipient.assistant_name || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {totalPages > 1 && (
                      <div className="px-4 py-3 border-t border-gray-200 dark:border-neutral-700 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-neutral-400">
                          {startItem}–{endItem} of {totalRecipients}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="neumorphic-secondary"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-8 px-3 text-xs"
                          >
                            Prev
                          </Button>
                          <Button
                            variant="neumorphic-secondary"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 px-3 text-xs"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            </CardContent>
          </Card>
        </div>
        
        {toast.show && (
          <div className="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg bg-green-600 text-white text-sm z-50">
            {toast.message}
          </div>
        )}
      </div>
    </div>
  )
}