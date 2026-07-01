import { SupabaseClient } from '@supabase/supabase-js'

export async function logAudit(
  supabase: SupabaseClient,
  action: string,
  details: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    details
  })

  if (error) {
    console.error('Audit log error:', error)
    return { error: error.message }
  }

  return { success: true }
}
