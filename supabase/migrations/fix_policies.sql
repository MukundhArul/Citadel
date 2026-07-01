-- Fix RLS Policies for vault_items
drop policy if exists "Users can only see their own vault items." on public.vault_items;
drop policy if exists "Users can insert their own vault items." on public.vault_items;
drop policy if exists "Users can update their own vault items." on public.vault_items;
drop policy if exists "Users can delete their own vault items." on public.vault_items;

create policy "Users can only see their own vault items."
  on public.vault_items for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own vault items."
  on public.vault_items for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own vault items."
  on public.vault_items for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own vault items."
  on public.vault_items for delete
  using ( auth.uid() = user_id );

-- Also ensure vault_folders policies are fully in place
drop policy if exists "Users can only see their own vault folders." on public.vault_folders;
drop policy if exists "Users can insert their own vault folders." on public.vault_folders;
drop policy if exists "Users can update their own vault folders." on public.vault_folders;
drop policy if exists "Users can delete their own vault folders." on public.vault_folders;

create policy "Users can only see their own vault folders."
  on public.vault_folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own vault folders."
  on public.vault_folders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own vault folders."
  on public.vault_folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own vault folders."
  on public.vault_folders for delete
  using ( auth.uid() = user_id );
