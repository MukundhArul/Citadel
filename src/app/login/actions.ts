'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
      redirect(`/login?error=${encodeURIComponent('VAULT ALREADY EXISTS. PLEASE DECRYPT EXISTING VAULT (LOGIN).')}&mode=register`)
    }
    redirect(`/login?error=${encodeURIComponent(error.message)}&mode=register`)
  }

  // If email enumeration protection is ON, Supabase returns a fake user object with empty identities array instead of an error
  if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
    redirect(`/login?error=${encodeURIComponent('VAULT ALREADY EXISTS. PLEASE DECRYPT EXISTING VAULT (LOGIN).')}&mode=register`)
  }

  if (!authData.session) {
    redirect('/login?message=Please check your email to verify your account.&mode=register')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
