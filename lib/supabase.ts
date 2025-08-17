import { createClient } from '@supabase/supabase-js'

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceRoleKey)
}