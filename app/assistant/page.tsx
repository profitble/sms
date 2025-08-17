"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'

type Blast = {
  id: string
  message: string
  created_at: string
  status: string
}

type PhoneTask = {
  id: string
  phone_e164: string
  completed: boolean
  failed: boolean
  failed_reason?: string
  completed_at?: string
}

type ToastState = {
  show: boolean
  message: string
  type: 'success' | 'error'
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 30}`
}


async function fetchOpenBlasts(): Promise<Blast[]> {
  try {
    const response = await fetch('/api/blasts?status=open')
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

async function fetchBlastTasks(blastId: string): Promise<PhoneTask[]> {
  // MVP placeholder - in production, fetch from Supabase
  console.log('Fetching tasks for blast:', blastId)
  return [
    {
      id: '1',
      phone_e164: '+14155551234',
      completed: false,
      failed: false
    },
    {
      id: '2',
      phone_e164: '+14155555678',
      completed: true,
      failed: false,
      completed_at: new Date().toISOString()
    },
    {
      id: '3',
      phone_e164: '+14155559999',
      completed: false,
      failed: true,
      failed_reason: 'Number blocked'
    },
    {
      id: '4',
      phone_e164: '+14155552222',
      completed: false,
      failed: false
    },
    {
      id: '5',
      phone_e164: '+14155553333',
      completed: false,
      failed: false
    }
  ]
}

async function updateTaskStatus(taskId: string, completed: boolean, failed: boolean = false, reason?: string): Promise<boolean> {
  // MVP placeholder - in production, update Supabase
  console.log('Updating task:', { taskId, completed, failed, reason })
  return true
}

export default function AssistantPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [blasts, setBlasts] = useState<Blast[]>([])
  const [selectedBlastId, setSelectedBlastId] = useState('')
  const [tasks, setTasks] = useState<PhoneTask[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const loadTasks = useCallback(async (blastId: string) => {
    if (blastId) {
      const data = await fetchBlastTasks(blastId)
      setTasks(data)
    }
  }, [])

  const loadOpenBlasts = useCallback(async () => {
    const data = await fetchOpenBlasts()
    setBlasts(data)
    if (data.length > 0 && !selectedBlastId) {
      setSelectedBlastId(data[0].id)
    }
  }, [selectedBlastId])

  useEffect(() => {
    const hasSession = getCookie('assistant_session') === '1'
    setIsAuthenticated(hasSession)
    if (hasSession) {
      loadOpenBlasts()
    }
  }, [loadOpenBlasts])

  useEffect(() => {
    if (selectedBlastId) {
      loadTasks(selectedBlastId)
    }
  }, [selectedBlastId, loadTasks])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'login', 
          role: 'assistant', 
          password 
        })
      })
      
      if (response.ok) {
        setCookie('assistant_session', '1')
        setIsAuthenticated(true)
        setPassword('')
        await loadOpenBlasts()
      } else {
        alert('Invalid password')
      }
    } catch {
      alert('Login failed')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    document.cookie = 'assistant_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.reload()
  }

  const selectedBlast = blasts.find(b => b.id === selectedBlastId)
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.phone_e164.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && !task.completed && !task.failed) ||
      (filter === 'completed' && task.completed) ||
      (filter === 'failed' && task.failed)
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    failed: tasks.filter(t => t.failed).length,
    pending: tasks.filter(t => !t.completed && !t.failed).length
  }

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    const success = await updateTaskStatus(taskId, completed)
    if (success) {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, completed, failed: false, completed_at: completed ? new Date().toISOString() : undefined }
          : task
      ))
      showToast(completed ? 'Task marked as completed!' : 'Task marked as pending')
    } else {
      showToast('Failed to update task', 'error')
    }
  }

  const handleTaskFailed = async (taskId: string, reason: string) => {
    const success = await updateTaskStatus(taskId, false, true, reason)
    if (success) {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: false, failed: true, failed_reason: reason }
          : task
      ))
      showToast('Task marked as failed')
    } else {
      showToast('Failed to update task', 'error')
    }
  }

  const handleMarkAllComplete = async () => {
    const pendingTasks = tasks.filter(t => !t.completed && !t.failed)
    for (const task of pendingTasks) {
      await updateTaskStatus(task.id, true)
    }
    setTasks(prev => prev.map(task => 
      !task.completed && !task.failed 
        ? { ...task, completed: true, completed_at: new Date().toISOString() }
        : task
    ))
    showToast(`Marked ${pendingTasks.length} tasks as completed!`)
  }

  const copyMessage = () => {
    if (selectedBlast) {
      navigator.clipboard.writeText(selectedBlast.message)
      showToast('Message copied to clipboard!')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center pb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <CardTitle className="text-2xl">Assistant Login</CardTitle>
            <CardDescription>Enter password to access the assistant console</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-5">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter assistant password"
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
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assistant Console</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Campaign task management</p>
            </div>
          </div>
          <Button variant="neumorphic-secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Campaign Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Campaign</CardTitle>
            <CardDescription>Choose the campaign to work on</CardDescription>
          </CardHeader>
          <CardContent>
            {blasts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No open campaigns available</p>
            ) : (
              <select
                value={selectedBlastId}
                onChange={(e) => setSelectedBlastId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {blasts.map(blast => (
                  <option key={blast.id} value={blast.id}>
                    {new Date(blast.created_at).toLocaleDateString()} - {blast.message.substring(0, 50)}...
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        {selectedBlast && (
          <div className="space-y-8">
            {/* Message Instructions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Message Instructions</CardTitle>
                    <CardDescription>Message to send for this campaign</CardDescription>
                  </div>
                  <Button variant="neumorphic-secondary" onClick={copyMessage} className="h-9">
                    Copy Message
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedBlast.message}</p>
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>{stats.completed} of {stats.total} tasks completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</div>
                    <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Phone Numbers ({filteredTasks.length})</CardTitle>
                    <CardDescription>Check off numbers as you send messages</CardDescription>
                  </div>
                  {stats.pending > 0 && (
                    <Button variant="neumorphic-green" onClick={handleMarkAllComplete}>
                      Mark All Complete
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search phone numbers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'pending', 'completed', 'failed'] as const).map((filterType) => (
                      <Button
                        key={filterType}
                        variant={filter === filterType ? "neumorphic-primary" : "neumorphic-secondary"}
                        onClick={() => setFilter(filterType)}
                        className="capitalize h-9 text-sm"
                      >
                        {filterType}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Task List */}
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No numbers match your search' : 'No tasks found'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
                            disabled={task.failed}
                            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                          />
                          <div>
                            <p className="font-mono text-gray-900 dark:text-white">{task.phone_e164}</p>
                            {task.completed_at && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Completed {new Date(task.completed_at).toLocaleString()}
                              </p>
                            )}
                            {task.failed_reason && (
                              <p className="text-xs text-red-600 dark:text-red-400">
                                Failed: {task.failed_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {task.completed && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              ✓ Sent
                            </Badge>
                          )}
                          {task.failed && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              ✗ Failed
                            </Badge>
                          )}
                          {!task.completed && !task.failed && (
                            <>
                              <Badge variant="outline">Pending</Badge>
                              <Button
                                variant="neumorphic-secondary"
                                onClick={() => {
                                  const reason = prompt('Enter failure reason:')
                                  if (reason) handleTaskFailed(task.id, reason)
                                }}
                                className="h-8 text-xs px-3"
                              >
                                ⚠️ Report Issue
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Toast Notifications */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white text-sm z-50 animate-in slide-in-from-bottom-2 duration-300 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}