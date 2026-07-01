-- Create the table for vault folders
create table public.vault_folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Encrypted folder name
  encrypted_name text not null,
  name_iv text not null
);

-- Enable RLS on vault_folders
alter table public.vault_folders enable row level security;

-- Create Policies for vault_folders
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

-- Add folder_id to vault_items
alter table public.vault_items 
  add column folder_id uuid references public.vault_folders(id) on delete set null;
