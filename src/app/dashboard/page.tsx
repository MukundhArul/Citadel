import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import VaultDashboard from './vault-dashboard'
import { Logo } from '@/components/ui/logo'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: items, error: itemsError } = await supabase
    .from('vault_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (itemsError) {
    console.error('Error fetching items:', itemsError)
  }

  const { data: folders, error: foldersError } = await supabase
    .from('vault_folders')
    .select('*')
    .order('created_at', { ascending: true })
    
  if (foldersError) {
    console.error('Error fetching folders:', foldersError)
  }

  const { data: auditLogs, error: logsError } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (logsError) {
    console.error('Error fetching audit logs:', logsError)
  }

  return (
    <main className="flex-1 flex flex-col p-8 max-w-5xl mx-auto w-full">
      <VaultDashboard 
        userId={user.id} 
        userEmail={user.email ?? "unknown"} 
        initialItems={items || []} 
        initialFolders={folders || []} 
        initialLogs={auditLogs || []} 
      />
    </main>
  )
}
