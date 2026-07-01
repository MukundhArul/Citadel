-- Create the table for vault items
create table public.vault_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Encrypted payload fields
  encrypted_title text not null,
  title_iv text not null,
  
  encrypted_username text not null,
  username_iv text not null,
  
  encrypted_password text not null,
  password_iv text not null,
  
  encrypted_url text,
  url_iv text,
  
  encrypted_notes text,
  notes_iv text
);

-- Enable RLS
alter table public.vault_items enable row level security;

-- Create Policies
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

-- Create the table for audit logs
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  action text not null,
  details text not null
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Create Policies
create policy "Users can only see their own audit logs."
  on public.audit_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own audit logs."
  on public.audit_logs for insert
  with check ( auth.uid() = user_id );
