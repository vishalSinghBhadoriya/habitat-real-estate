create table public.saved_properties (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 property_id uuid not null references public.properties(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,property_id)
);
alter table public.saved_properties enable row level security;
revoke all on public.saved_properties from anon,authenticated;
grant select,delete on public.saved_properties to authenticated;
grant insert (user_id,property_id) on public.saved_properties to authenticated;
create policy saved_read on public.saved_properties for select to authenticated using (user_id=(select auth.uid()));
create policy saved_add on public.saved_properties for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.properties p where p.id=property_id and p.status='published'));
create policy saved_remove on public.saved_properties for delete to authenticated using (user_id=(select auth.uid()));
