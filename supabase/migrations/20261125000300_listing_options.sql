alter table public.properties add column whatsapp text
 check (whatsapp is null or whatsapp ~ '^91[6-9][0-9]{9}$');
grant insert (whatsapp),update (whatsapp) on public.properties to authenticated;
grant delete on public.properties to authenticated;
create policy property_delete on public.properties for delete to authenticated using (owner_id=(select auth.uid()));

create table public.profiles (
 id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 name text not null check (length(btrim(name)) between 2 and 100),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select,insert on public.profiles to authenticated;
grant update(name) on public.profiles to authenticated;
create policy profile_own on public.profiles for all to authenticated
 using (id=(select auth.uid())) with check (id=(select auth.uid()));
