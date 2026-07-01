'use client'

import { useState, useEffect } from 'react'
import { deriveKey, decryptText, encryptText } from '@/lib/crypto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Grid } from '@/components/ui/grid'
import { StatCard } from '@/components/ui/stat-card'
import { Logo } from '@/components/ui/logo'
import { addVaultItem, addVaultFolder, deleteVaultItem, updateVaultItem } from './actions'
import zxcvbn from 'zxcvbn'

function VaultItemCard({ 
  item, 
  onDelete, 
  onUpdate,
  folders
}: { 
  item: any, 
  onDelete: (id: string) => void,
  onUpdate: (id: string, updatedRecord: any) => Promise<void>,
  folders: any[]
}) {
  const [revealed, setRevealed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [editRecord, setEditRecord] = useState({
    title: item.title,
    username: item.username,
    password: item.password,
    url: item.url || '',
    notes: item.notes || '',
    folderId: item.folder_id || 'all'
  })

  if (isEditing) {
    return (
      <form onSubmit={async (e) => {
        e.preventDefault()
        setIsSaving(true)
        await onUpdate(item.id, editRecord)
        setIsSaving(false)
        setIsEditing(false)
      }} className="border border-sci-amber bg-surface p-4 flex flex-col gap-3 rounded-sm shadow-[0_0_10px_rgba(255,136,0,0.1)]">
        <h4 className="font-mono text-sci-amber text-xs uppercase tracking-widest border-b border-sci-amber/30 pb-1">EDIT RECORD</h4>
        <Input placeholder="TITLE" className="h-8 text-xs" value={editRecord.title} onChange={e => setEditRecord({...editRecord, title: e.target.value})} required />
        <Input placeholder="USERNAME" className="h-8 text-xs" value={editRecord.username} onChange={e => setEditRecord({...editRecord, username: e.target.value})} required />
        <Input placeholder="PASSWORD" type="text" className="h-8 text-xs" value={editRecord.password} onChange={e => setEditRecord({...editRecord, password: e.target.value})} required />
        <select 
          className="flex h-8 w-full border border-border bg-surface px-2 py-1 text-xs font-mono text-text-primary uppercase focus-visible:outline-none focus-visible:border-sci-amber transition-colors rounded-sm"
          value={editRecord.folderId} 
          onChange={e => setEditRecord({...editRecord, folderId: e.target.value})}
        >
          <option value="all">NO FOLDER (ROOT)</option>
          {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <Input placeholder="URL (OPTIONAL)" className="h-8 text-xs" value={editRecord.url} onChange={e => setEditRecord({...editRecord, url: e.target.value})} />
        <Input placeholder="NOTES (OPTIONAL)" className="h-8 text-xs" value={editRecord.notes} onChange={e => setEditRecord({...editRecord, notes: e.target.value})} />
        
        <div className="flex gap-2 mt-2">
          <Button type="button" variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => { setIsEditing(false); setEditRecord({...item, folderId: item.folder_id || 'all'}) }}>CANCEL</Button>
          <Button type="submit" variant="warning" size="sm" className="flex-1 text-xs" disabled={isSaving}>{isSaving ? '...' : 'SAVE'}</Button>
        </div>
      </form>
    )
  }

  return (
    <div className="border border-border bg-surface p-4 flex flex-col gap-2 hover:border-sci-green transition-colors group relative rounded-sm">
      <div className="flex justify-between items-start mb-1 gap-2">
        <div className="font-mono text-sm font-bold text-sci-bone tracking-wider uppercase truncate group-hover:text-sci-green transition-colors">
          {item.title}
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(true)} className="text-[10px] text-sci-amber hover:text-white transition-colors">[EDIT]</button>
          {isDeleting ? (
            <div className="flex gap-1 items-center bg-red-950/50 px-1 border border-sci-red rounded-sm">
              <span className="text-[8px] text-sci-red tracking-widest">SURE?</span>
              <button onClick={() => onDelete(item.id)} className="text-[10px] text-sci-red hover:text-white font-bold px-1">Y</button>
              <button onClick={() => setIsDeleting(false)} className="text-[10px] text-text-muted hover:text-white font-bold px-1">N</button>
            </div>
          ) : (
            <button onClick={() => setIsDeleting(true)} className="text-[10px] text-sci-red hover:text-white transition-colors">[DEL]</button>
          )}
        </div>
      </div>

      <div className="font-mono text-xs text-sci-bone truncate">
        <span className="text-sci-green">USR:</span> {item.username}
      </div>
      <div className="font-mono text-xs text-sci-bone truncate flex items-center gap-2">
        <span className="text-sci-green">PWD:</span> 
        <span className="flex-1">{revealed ? item.password : '••••••••••••'}</span>
        <button 
          onClick={() => setRevealed(!revealed)}
          className="text-[10px] text-text-muted hover:text-sci-bone transition-colors shrink-0"
        >
          {revealed ? '[HIDE]' : '[VIEW]'}
        </button>
      </div>
    </div>
  )
}

export default function VaultDashboard({ 
  userId, 
  userEmail,
  initialItems,
  initialFolders
}: { 
  userId: string, 
  userEmail: string,
  initialItems: any[],
  initialFolders: any[]
}) {
  const [masterPassword, setMasterPassword] = useState('')
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null)
  const [error, setError] = useState('')
  const [isDecrypting, setIsDecrypting] = useState(false)
  
  const [decryptedItems, setDecryptedItems] = useState<any[]>([])
  const [decryptedFolders, setDecryptedFolders] = useState<any[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string | 'all'>('all')

  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [newRecord, setNewRecord] = useState({ title: '', username: '', password: '', url: '', notes: '', folderId: 'all' })
  const [newFolderName, setNewFolderName] = useState('')

  // -------------------------------------------------------------
  // AUTO-LOCK TIMER (5 minutes of inactivity)
  // -------------------------------------------------------------
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const lockVault = () => {
      setCryptoKey(null)
      setDecryptedItems([])
      setDecryptedFolders([])
      setMasterPassword('')
      setError('Vault auto-locked due to inactivity.')
    }

    const resetTimer = () => {
      clearTimeout(timeout)
      // 5 minutes
      timeout = setTimeout(lockVault, 5 * 60 * 1000)
    }

    if (cryptoKey) {
      window.addEventListener('mousemove', resetTimer)
      window.addEventListener('keydown', resetTimer)
      window.addEventListener('click', resetTimer)
      resetTimer()
    }

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('click', resetTimer)
    }
  }, [cryptoKey])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsDecrypting(true)
    setError('')
    
    try {
      const key = await deriveKey(masterPassword, userId)
      
      const items = await Promise.all(
        initialItems.map(async (item) => {
          try {
            return {
              ...item,
              title: await decryptText(item.encrypted_title, item.title_iv, key),
              username: await decryptText(item.encrypted_username, item.username_iv, key),
              password: await decryptText(item.encrypted_password, item.password_iv, key),
              url: item.encrypted_url ? await decryptText(item.encrypted_url, item.url_iv, key) : '',
              notes: item.encrypted_notes ? await decryptText(item.encrypted_notes, item.notes_iv, key) : '',
            }
          } catch (err) {
            console.error("Failed to decrypt item", item.id, err)
            throw new Error('Invalid master password')
          }
        })
      )

      const folders = await Promise.all(
        initialFolders.map(async (folder) => {
          try {
            return {
              ...folder,
              name: await decryptText(folder.encrypted_name, folder.name_iv, key),
            }
          } catch (err) {
            console.error("Failed to decrypt folder", folder.id, err)
            throw new Error('Invalid master password')
          }
        })
      )
      
      setCryptoKey(key)
      setDecryptedItems(items)
      setDecryptedFolders(folders)
    } catch (err) {
      setError('Decryption failed. Incorrect master password.')
      setCryptoKey(null)
    } finally {
      setIsDecrypting(false)
    }
  }

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cryptoKey || !newFolderName) return
    setIsSaving(true)
    
    try {
      const encryptedName = await encryptText(newFolderName, cryptoKey)
      
      const res = await addVaultFolder({ encryptedName })
      if (res.error) throw new Error(res.error)

      const newFolder = { ...res.folder, name: newFolderName }
      setDecryptedFolders([...decryptedFolders, newFolder])
      setActiveFolderId(newFolder.id) // Auto-select new folder
      setNewFolderName('')
      setIsAddingFolder(false)
    } catch (err) {
      console.error("Error saving folder:", err)
      alert("Failed to save folder.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cryptoKey) return
    setIsSaving(true)
    
    try {
      const encryptedTitle = await encryptText(newRecord.title, cryptoKey)
      const encryptedUsername = await encryptText(newRecord.username, cryptoKey)
      const encryptedPassword = await encryptText(newRecord.password, cryptoKey)
      const encryptedUrl = newRecord.url ? await encryptText(newRecord.url, cryptoKey) : { ciphertext: null, iv: null }
      const encryptedNotes = newRecord.notes ? await encryptText(newRecord.notes, cryptoKey) : { ciphertext: null, iv: null }

      const payload = {
        encryptedTitle,
        encryptedUsername,
        encryptedPassword,
        encryptedUrl,
        encryptedNotes,
        folderId: newRecord.folderId === 'all' ? null : newRecord.folderId
      }

      const res = await addVaultItem(payload)
      if (res.error) throw new Error(res.error)

      setDecryptedItems([{
        id: res.item.id, // Real database ID
        title: newRecord.title,
        username: newRecord.username,
        password: newRecord.password,
        url: newRecord.url,
        notes: newRecord.notes,
        folder_id: payload.folderId,
      }, ...decryptedItems])
      
      if (payload.folderId) {
        setActiveFolderId(payload.folderId)
      }
      setIsAddingItem(false)
      setNewRecord({ title: '', username: '', password: '', url: '', notes: '', folderId: activeFolderId })
    } catch (err) {
      console.error("Error saving record:", err)
      alert("Failed to save record.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await deleteVaultItem(id)
      if (res.error) throw new Error(res.error)
      setDecryptedItems(decryptedItems.filter(item => item.id !== id))
    } catch (err) {
      console.error("Failed to delete", err)
      alert("Failed to delete record")
    }
  }

  const handleUpdateRecord = async (id: string, updatedData: any) => {
    if (!cryptoKey) return
    try {
      const encryptedTitle = await encryptText(updatedData.title, cryptoKey)
      const encryptedUsername = await encryptText(updatedData.username, cryptoKey)
      const encryptedPassword = await encryptText(updatedData.password, cryptoKey)
      const encryptedUrl = updatedData.url ? await encryptText(updatedData.url, cryptoKey) : { ciphertext: null, iv: null }
      const encryptedNotes = updatedData.notes ? await encryptText(updatedData.notes, cryptoKey) : { ciphertext: null, iv: null }

      const payload = {
        encryptedTitle,
        encryptedUsername,
        encryptedPassword,
        encryptedUrl,
        encryptedNotes,
        folderId: updatedData.folderId === 'all' ? null : updatedData.folderId
      }

      const res = await updateVaultItem(id, payload)
      if (res.error) throw new Error(res.error)

      setDecryptedItems(decryptedItems.map(item => item.id === id ? {
        ...item,
        title: updatedData.title,
        username: updatedData.username,
        password: updatedData.password,
        url: updatedData.url,
        notes: updatedData.notes,
        folder_id: payload.folderId
      } : item))

    } catch (err) {
      console.error("Failed to update", err)
      alert("Failed to update record")
    }
  }

  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      folders: decryptedFolders.map(f => ({ id: f.id, name: f.name })),
      records: decryptedItems.map(item => ({
        id: item.id,
        folder_id: item.folder_id,
        title: item.title,
        username: item.username,
        password: item.password,
        url: item.url,
        notes: item.notes,
      }))
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citadel-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!cryptoKey) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 max-w-md mx-auto w-full">
        <div className="w-full border border-border bg-surface p-8" style={{ clipPath: "var(--clip-corner-md)" }}>
          <div className="mb-6">
            <h2 className="font-mono text-lg font-bold text-sci-amber tracking-widest uppercase mb-1" style={{ textShadow: "0 0 8px rgba(255, 136, 0, 0.6)" }}>
              VAULT LOCKED
            </h2>
            <p className="text-xs text-sci-amber-light font-mono tracking-widest uppercase">
              DECRYPTION KEY REQUIRED
            </p>
          </div>
          
          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
            <Input 
              type="password" 
              placeholder="ENTER MASTER PASSWORD" 
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              required
            />
            {error && (
              <div className="text-sci-amber text-xs border border-sci-amber p-2 bg-sci-amber/10 font-mono">
                [ALERT]: {error}
              </div>
            )}
            {isDecrypting ? (
              <div className="py-4">
                <div className="text-center font-mono text-sci-cyan animate-pulse tracking-widest text-sm">
                  PROCESSING DATA...
                </div>
              </div>
            ) : (
              <Button type="submit" variant="exec" className="w-full">
                INITIALIZE DECRYPTION
              </Button>
            )}
          </form>
        </div>
      </div>
    )
  }

  const displayedItems = activeFolderId === 'all' 
    ? decryptedItems 
    : decryptedItems.filter(item => item.folder_id === activeFolderId)

  // Calculate statistics
  const passwordOccurrences = decryptedItems.filter(item => item.password).map(i => i.password)
  const duplicatesSet = new Set(passwordOccurrences.filter((item, index) => passwordOccurrences.indexOf(item) !== index))
  const duplicateRecordsCount = decryptedItems.filter(item => item.password && duplicatesSet.has(item.password)).length

  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="flex justify-between items-end mb-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="w-6 h-6 text-sci-green" />
            <h1 className="font-mono text-2xl font-bold text-sci-green tracking-widest uppercase" style={{ textShadow: "var(--text-glow-green)" }}>
              MISSION CONTROL
            </h1>
          </div>
          <div className="text-xs text-sci-amber-light tracking-[0.2em] mt-1 uppercase">
            OPERATOR: {userEmail}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-xs font-mono text-sci-bone hover:text-sci-red transition-colors tracking-widest uppercase">
              [ TERMINATE SESSION ]
            </button>
          </form>
          <button onClick={handleExportData} className="text-xs font-mono text-sci-amber hover:text-sci-amber-light transition-colors tracking-widest uppercase">
            [ EXPORT DECRYPTED DATA ]
          </button>
        </div>
      </header>

      {/* Top Stats Grid */}
      <Grid preset="4-col" gap="1rem">
        <StatCard 
          label="VAULT STATUS" 
          value="SECURE" 
          variant="ACTIVE" 
          sublabel="SYSTEM NOMINAL" 
        />
        <StatCard 
          label="TOTAL RECORDS" 
          value={decryptedItems.length} 
          variant="DEFAULT" 
          sublabel="ENCRYPTED ENTRIES" 
        />
        <StatCard 
          label="DIRECTORIES" 
          value={decryptedFolders.length} 
          variant="DEFAULT"
          sublabel="ACTIVE FOLDERS" 
        />
        <StatCard 
          label="PASSWORD REUSE" 
          value={duplicateRecordsCount} 
          variant={duplicateRecordsCount > 0 ? "CRITICAL" : "ACTIVE"} 
          sublabel={duplicateRecordsCount > 0 ? "DUPLICATE PASSWORDS" : "ZERO DUPLICATES"} 
        />
      </Grid>

      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex flex-col gap-6 flex-shrink-0">
        <div className="flex flex-col gap-2">
          <Button variant="exec" onClick={() => setIsAddingItem(true)} disabled={isAddingItem}>
            + NEW RECORD
          </Button>
          <Button variant="info" onClick={() => setIsAddingFolder(true)} disabled={isAddingFolder}>
            + NEW FOLDER
          </Button>
        </div>

        {/* Add Folder Form */}
        {isAddingFolder && (
          <form onSubmit={handleAddFolder} className="flex flex-col gap-3 border border-sci-blue bg-surface p-4 rounded-sm" style={{ boxShadow: "0 0 15px rgba(68, 102, 204, 0.1)" }}>
            <h3 className="font-mono text-sci-blue text-xs tracking-widest uppercase">CREATE FOLDER:</h3>
            <Input placeholder="FOLDER NAME" className="w-full text-xs" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} required />
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setIsAddingFolder(false)}>
                CANCEL
              </Button>
              <Button type="submit" variant="info" size="sm" className="flex-1" disabled={isSaving}>
                {isSaving ? 'SAVING' : 'SAVE'}
              </Button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-2">
          <div className="text-xs font-mono text-text-muted tracking-widest uppercase mb-2 border-b border-border pb-2">DIRECTORY</div>
          
          <select 
            className="flex h-11 w-full border border-border bg-surface px-3 py-2 text-[0.875rem] font-mono text-sci-green uppercase focus-visible:outline-none focus-visible:border-sci-green transition-colors rounded-sm cursor-pointer"
            value={activeFolderId} 
            onChange={e => setActiveFolderId(e.target.value)}
          >
            <option value="all">ALL RECORDS</option>
            {decryptedFolders.map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Add Record Form */}
        {isAddingItem && (
          <form onSubmit={handleAddRecord} className="border border-sci-green bg-surface p-6 flex flex-col gap-4 rounded-sm" style={{ boxShadow: "0 0 20px rgba(0, 237, 63, 0.05)" }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-mono text-sci-green text-sm tracking-widest uppercase">ADD NEW RECORD</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="TITLE" value={newRecord.title} onChange={e => setNewRecord({...newRecord, title: e.target.value})} required />
              
              <div className="flex flex-col justify-end">
                <select 
                  className="flex h-11 w-full rounded-sm border border-border bg-surface px-3 py-2 text-[0.875rem] font-mono text-text-primary uppercase focus-visible:outline-none focus-visible:border-sci-green transition-colors"
                  value={newRecord.folderId} 
                  onChange={e => setNewRecord({...newRecord, folderId: e.target.value})}
                >
                  <option value="all">NO FOLDER (ROOT)</option>
                  {decryptedFolders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <Input placeholder="USERNAME" value={newRecord.username} onChange={e => setNewRecord({...newRecord, username: e.target.value})} required />
              
              <div className="flex flex-col gap-1">
                <Input placeholder="PASSWORD" type="text" value={newRecord.password} onChange={e => setNewRecord({...newRecord, password: e.target.value})} required />
                {newRecord.password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex flex-1 h-1 bg-surface border border-border">
                      <div 
                        className={`h-full transition-all ${
                          zxcvbn(newRecord.password).score <= 1 ? 'bg-sci-red' : 
                          zxcvbn(newRecord.password).score <= 3 ? 'bg-sci-amber' : 
                          'bg-sci-green'
                        }`}
                        style={{ width: `${(zxcvbn(newRecord.password).score + 1) * 20}%` }}
                      ></div>
                    </div>
                    <span className={`text-[9px] font-mono tracking-widest uppercase ${
                      zxcvbn(newRecord.password).score <= 1 ? 'text-sci-red' : 
                      zxcvbn(newRecord.password).score <= 3 ? 'text-sci-amber' : 
                      'text-sci-green'
                    }`}>
                      {zxcvbn(newRecord.password).score <= 1 ? 'CRITICAL' : 
                       zxcvbn(newRecord.password).score <= 3 ? 'WARNING' : 
                       'SECURE'}
                    </span>
                  </div>
                )}
              </div>

              <Input placeholder="URL (OPTIONAL)" value={newRecord.url} onChange={e => setNewRecord({...newRecord, url: e.target.value})} />
              <Input placeholder="NOTES (OPTIONAL)" value={newRecord.notes} onChange={e => setNewRecord({...newRecord, notes: e.target.value})} />
            </div>
            
            <div className="flex gap-4 mt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddingItem(false)}>
                CANCEL
              </Button>
              <Button type="submit" variant="exec" disabled={isSaving} className="flex-1">
                {isSaving ? 'ENCRYPTING & SAVING...' : 'SAVE RECORD'}
              </Button>
            </div>
          </form>
        )}

        {/* Records List */}
        <div>
          <div className="text-xs font-mono text-sci-green tracking-widest uppercase mb-4 border-b border-border pb-2">
            {activeFolderId === 'all' ? 'ALL RECORDS' : decryptedFolders.find(f => f.id === activeFolderId)?.name || 'FOLDER'} 
            {' '}— {displayedItems.length} FOUND
          </div>

          {displayedItems.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border text-text-muted font-mono text-sm tracking-widest uppercase rounded-sm">
              NO RECORDS
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedItems.map(item => (
                <VaultItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteRecord} 
                  onUpdate={handleUpdateRecord} 
                  folders={decryptedFolders} 
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
    </div>
  )
}
