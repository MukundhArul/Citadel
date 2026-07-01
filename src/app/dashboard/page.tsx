import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import VaultDashboard from './vault-dashboard'

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

  return (
    <main className="flex-1 flex flex-col p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-12 border-b border-border pb-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-sci-green tracking-widest uppercase" style={{ textShadow: "var(--text-glow-green)" }}>
            MISSION CONTROL
          </h1>
          <div className="text-xs text-sci-green tracking-[0.2em] mt-1 uppercase">
            OPERATOR: {user.email}
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-xs font-mono text-sci-bone hover:text-sci-red transition-colors tracking-widest uppercase">
            [ TERMINATE SESSION ]
          </button>
        </form>
      </header>

      <VaultDashboard userId={user.id} initialItems={items || []} initialFolders={folders || []} />
    </main>
  )
}
