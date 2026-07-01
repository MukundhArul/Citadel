'use client'

import { useState } from 'react'
import { deriveKey, decryptText, encryptText } from '@/lib/crypto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addVaultItem, addVaultFolder } from './actions'

function VaultItemCard({ item }: { item: any }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="border border-border bg-surface p-4 flex flex-col gap-2 hover:border-sci-blue transition-colors group relative rounded-sm">
      <div className="font-mono text-sm font-bold text-sci-bone tracking-wider uppercase mb-2 truncate group-hover:text-sci-green transition-colors pr-8">
        {item.title}
      </div>
      <div className="font-mono text-xs text-sci-bone truncate">
        <span className="text-sci-blue">USR:</span> {item.username}
      </div>
      <div className="font-mono text-xs text-sci-bone truncate flex items-center gap-2">
        <span className="text-sci-blue">PWD:</span> 
        <span className="flex-1">{revealed ? item.password : '••••••••••••'}</span>
        <button 
          onClick={() => setRevealed(!revealed)}
          className="text-[10px] text-text-muted hover:text-sci-bone transition-colors"
        >
          {revealed ? '[HIDE]' : '[VIEW]'}
        </button>
      </div>
    </div>
  )
}

export default function VaultDashboard({ userId, initialItems, initialFolders }: { userId: string, initialItems: any[], initialFolders: any[] }) {
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
        id: crypto.randomUUID(), // Optimistic ID
        title: newRecord.title,
        username: newRecord.username,
        password: newRecord.password,
        url: newRecord.url,
        notes: newRecord.notes,
        folder_id: payload.folderId,
      }, ...decryptedItems])
      
      // Keep them in the current folder view, but clear form
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
              <div className="text-sci-red text-xs border border-sci-red p-2 bg-red-950/20 font-mono">
                [ERROR]: {error}
              </div>
            )}
            <Button type="submit" variant="warning" disabled={isDecrypting}>
              {isDecrypting ? 'DECRYPTING...' : 'DECRYPT VAULT'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const displayedItems = activeFolderId === 'all' 
    ? decryptedItems 
    : decryptedItems.filter(item => item.folder_id === activeFolderId)

  return (
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

        <div className="flex flex-col gap-2 mt-4">
          <div className="text-xs font-mono text-text-muted tracking-widest uppercase mb-2 border-b border-border pb-2">DIRECTORY</div>
          
          <select 
            className="flex h-11 w-full border border-border bg-surface px-3 py-2 text-[0.875rem] font-mono text-sci-blue uppercase focus-visible:outline-none focus-visible:border-sci-green transition-colors rounded-sm cursor-pointer"
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
              <Input placeholder="PASSWORD" type="password" value={newRecord.password} onChange={e => setNewRecord({...newRecord, password: e.target.value})} required />
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
          <div className="text-xs font-mono text-sci-blue tracking-widest uppercase mb-4 border-b border-border pb-2">
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
                <VaultItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
