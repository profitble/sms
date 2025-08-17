"use server"

import { createClient } from '@supabase/supabase-js'

const serverClient = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

export async function createBlast(formData: FormData) {
  const message = formData.get('message') as string
  const selectedJson = formData.get('selectedJson') as string
  const filtersJson = formData.get('filtersJson') as string
  
  if (!message?.trim()) {
    return { ok: false, error: "Message is required" }
  }
  
  let selected: string[]
  try {
    selected = JSON.parse(selectedJson || '[]')
    selected = [...new Set(selected)].filter(phone => phone?.trim())
  } catch {
    return { ok: false, error: "Invalid selection data" }
  }
  
  if (selected.length === 0) {
    return { ok: false, error: "Select at least one recipient" }
  }
  
  try {
    const client = serverClient()
    
    const { data: blast, error: blastError } = await client
      .from('blasts')
      .insert({
        message: message.trim(),
        status: 'open',
        filters_json: filtersJson || null,
        cost_estimate_cents: selected.length * 10
      })
      .select('id')
      .single()
    
    if (blastError) throw blastError
    
    const recipients = selected.map(phone => ({
      blast_id: blast.id,
      phone_e164: phone,
      state: 'pending'
    }))
    
    const { error: recipientsError } = await client
      .from('blast_recipients')
      .insert(recipients)
    
    if (recipientsError) throw recipientsError
    
    return { ok: true, blastId: blast.id, count: selected.length }
  } catch (error) {
    console.error('Create blast error:', error)
    return { ok: false, error: "Failed to create campaign" }
  }
}

export async function listRecentBlasts() {
  try {
    const client = serverClient()
    
    const { data: blasts, error } = await client
      .from('blasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) throw error
    
    const blastsWithCounts = await Promise.all(
      (blasts || []).map(async (blast) => {
        const [pending, sent, deleted] = await Promise.all([
          client.from('blast_recipients').select('*', { count: 'exact', head: true }).eq('blast_id', blast.id).eq('state', 'pending'),
          client.from('blast_recipients').select('*', { count: 'exact', head: true }).eq('blast_id', blast.id).eq('state', 'sent'),
          client.from('blast_recipients').select('*', { count: 'exact', head: true }).eq('blast_id', blast.id).eq('state', 'deleted')
        ])
        
        return {
          ...blast,
          pending_count: pending.count || 0,
          sent_count: sent.count || 0,
          deleted_count: deleted.count || 0
        }
      })
    )
    
    return blastsWithCounts
  } catch (error) {
    console.error('List blasts error:', error)
    return []
  }
}

export async function setBlastStatus(formData: FormData) {
  const blastId = formData.get('blastId') as string
  const status = formData.get('status') as 'open' | 'closed'
  
  try {
    const client = serverClient()
    
    const { error } = await client
      .from('blasts')
      .update({ status })
      .eq('id', blastId)
    
    if (error) throw error
    
    return { ok: true }
  } catch (error) {
    console.error('Set blast status error:', error)
    return { ok: false, error: "Failed to update campaign status" }
  }
}