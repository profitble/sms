import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../lib/supabase'

async function isMaxAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('max_session')?.value === '1'
  } catch {
    return false
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isMaxAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { active } = await request.json()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('assistants')
      .update({ active })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update assistant:', error)
    return NextResponse.json({ error: 'Failed to update assistant' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isMaxAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { id } = await params
    
    const { error } = await supabase
      .from('assistants')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete assistant:', error)
    return NextResponse.json({ error: 'Failed to delete assistant' }, { status: 500 })
  }
}