import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../lib/supabase'

async function isMaxAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('max_session')?.value === '1'
  } catch {
    return false
  }
}

export async function GET() {
  if (!await isMaxAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('assistants')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Failed to fetch assistants:', error)
    return NextResponse.json({ error: 'Failed to fetch assistants' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!await isMaxAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { display_name, code } = await request.json()
    
    if (!display_name || !code) {
      return NextResponse.json({ error: 'Display name and code are required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('assistants')
      .insert({ display_name, code })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create assistant:', error)
    return NextResponse.json({ error: 'Failed to create assistant' }, { status: 500 })
  }
}