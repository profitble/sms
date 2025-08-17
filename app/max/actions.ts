"use server"

import { createClient } from '@supabase/supabase-js'

const serverClient = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

export async function maxLogin(formData: FormData) {
  const password = formData.get('password') as string
  // Compare with MAX_PASSWORD env var
  if (password === process.env.MAX_PASSWORD) {
    return { ok: true }
  }
  return { ok: false }
}

export async function addAssistant(formData: FormData) {
  const display_name = formData.get('display_name') as string
  const code = formData.get('code') as string
  
  if (!display_name?.trim() || !code?.trim()) {
    return { ok: false, error: "Name and code are required" }
  }
  
  try {
    const client = serverClient()
    const { error } = await client
      .from('assistants')
      .insert({ display_name: display_name.trim(), code: code.trim(), active: true })
    
    if (error) {
      if (error.code === '23505') { // unique constraint violation
        return { ok: false, error: "Code already exists" }
      }
      throw error
    }
    return { ok: true }
  } catch (error) {
    console.error('Add assistant error:', error)
    return { ok: false, error: "Failed to add assistant" }
  }
}

export async function toggleAssistant(formData: FormData) {
  const id = formData.get('id') as string
  
  try {
    const client = serverClient()
    const { data: assistant, error: fetchError } = await client
      .from('assistants')
      .select('active')
      .eq('id', id)
      .single()
    
    if (fetchError || !assistant) throw fetchError
    
    const { error } = await client
      .from('assistants')
      .update({ active: !assistant.active })
      .eq('id', id)
    
    if (error) throw error
    return { ok: true }
  } catch (error) {
    console.error('Toggle assistant error:', error)
    return { ok: false, error: "Failed to toggle assistant" }
  }
}

export async function deleteAssistant(formData: FormData) {
  const id = formData.get('id') as string
  
  try {
    const client = serverClient()
    // First unassign all recipients from this assistant
    await client
      .from('blast_recipients')
      .update({ assigned_to: null })
      .eq('assigned_to', id)
    
    // Then delete the assistant
    const { error } = await client
      .from('assistants')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { ok: true }
  } catch (error) {
    console.error('Delete assistant error:', error)
    return { ok: false, error: "Failed to delete assistant" }
  }
}

export async function loadOpenBlasts() {
  try {
    const client = serverClient()
    const { data, error } = await client
      .from('blasts')
      .select('id, message, created_at, status')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Load open blasts error:', error)
    return []
  }
}

export async function loadRecipients(blastId: string, page: number, pageSize: number = 50) {
  try {
    const client = serverClient()
    const { data, error, count } = await client
      .from('blast_recipients')
      .select(`
        id, phone_e164, state, assigned_to,
        assistants(display_name)
      `, { count: 'exact' })
      .eq('blast_id', blastId)
      .order('created_at', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1)
    
    if (error) throw error
    
    const recipients = (data || []).map(row => ({
      id: row.id,
      phone_e164: row.phone_e164,
      state: row.state,
      assigned_to: row.assigned_to,
      assistant_name: (row.assistants as { display_name?: string } | null)?.display_name || undefined
    }))
    
    return { recipients, total: count || 0 }
  } catch (error) {
    console.error('Load recipients error:', error)
    return { recipients: [], total: 0 }
  }
}

export async function assignRecipients(ids: string[], assistantId: string) {
  try {
    const client = serverClient()
    const { error } = await client
      .from('blast_recipients')
      .update({ assigned_to: assistantId })
      .in('id', ids)
    
    if (error) throw error
    return { ok: true }
  } catch (error) {
    console.error('Assign recipients error:', error)
    return { ok: false, error: "Failed to assign recipients" }
  }
}

export async function unassignRecipients(ids: string[]) {
  try {
    const client = serverClient()
    const { error } = await client
      .from('blast_recipients')
      .update({ assigned_to: null })
      .in('id', ids)
    
    if (error) throw error
    return { ok: true }
  } catch (error) {
    console.error('Unassign recipients error:', error)
    return { ok: false, error: "Failed to unassign recipients" }
  }
}

export async function fetchAssistants() {
  try {
    const client = serverClient()
    const { data, error } = await client
      .from('assistants')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Fetch assistants error:', error)
    return []
  }
}