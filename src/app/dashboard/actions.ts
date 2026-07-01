'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function addVaultItem(data: any) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.from('vault_items').insert({
    user_id: user.id,
    encrypted_title: data.encryptedTitle.ciphertext,
    title_iv: data.encryptedTitle.iv,
    encrypted_username: data.encryptedUsername.ciphertext,
    username_iv: data.encryptedUsername.iv,
    encrypted_password: data.encryptedPassword.ciphertext,
    password_iv: data.encryptedPassword.iv,
    encrypted_url: data.encryptedUrl?.ciphertext || null,
    url_iv: data.encryptedUrl?.iv || null,
    encrypted_notes: data.encryptedNotes?.ciphertext || null,
    notes_iv: data.encryptedNotes?.iv || null,
    folder_id: data.folderId || null,
  })

  if (error) {
    console.error('Insert error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function addVaultFolder(data: any) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: folder, error } = await supabase.from('vault_folders').insert({
    user_id: user.id,
    encrypted_name: data.encryptedName.ciphertext,
    name_iv: data.encryptedName.iv,
  }).select().single()

  if (error) {
    console.error('Insert error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, folder }
}

export async function deleteVaultItem(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('vault_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateVaultItem(id: string, data: any) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('vault_items')
    .update({
      encrypted_title: data.encryptedTitle.ciphertext,
      title_iv: data.encryptedTitle.iv,
      encrypted_username: data.encryptedUsername.ciphertext,
      username_iv: data.encryptedUsername.iv,
      encrypted_password: data.encryptedPassword.ciphertext,
      password_iv: data.encryptedPassword.iv,
      encrypted_url: data.encryptedUrl?.ciphertext || null,
      url_iv: data.encryptedUrl?.iv || null,
      encrypted_notes: data.encryptedNotes?.ciphertext || null,
      notes_iv: data.encryptedNotes?.iv || null,
      folder_id: data.folderId || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Update error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
