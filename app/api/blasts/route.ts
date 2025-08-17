import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../lib/supabase'

async function isAuthenticated(requiredSession: string): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(requiredSession)?.value === '1'
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const isAssistant = await isAuthenticated('assistant_session')
  const isMax = await isAuthenticated('max_session')
  
  if (!isAssistant && !isMax) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase.from('blasts').select('*').order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Failed to fetch blasts:', error)
    return NextResponse.json({ error: 'Failed to fetch blasts' }, { status: 500 })
  }
}