create table public.properties (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 slug text not null unique check (slug ~ '^[a-z0-9-]{3,100}$'),
 title text not null check (length(btrim(title)) between 5 and 100),
 city text not null check (length(btrim(city)) between 2 and 80),
 locality text not null check (length(btrim(locality)) between 2 and 80),
 category text not null check (category in ('Apartment','Independent house','Duplex','Villa','Residential plot','Commercial plot','Office','Shop','Warehouse','PG','Hostel')),
 mode text not null check (mode in ('Buy','Rent','Plots','Commercial','PG')),
 price numeric(14,2) not null check (price > 0 and price <= 10000000000),
 area numeric(12,2) not null check (area > 0 and area <= 100000000),
 bhk integer not null check (bhk between 0 and 20),
 furnishing text not null check (furnishing in ('Furnished','Semi-furnished','Unfurnished')),
 facing text not null check (facing in ('North','East','South','West','Unspecified')),
 description text not null check (length(btrim(description)) between 20 and 4000),
 images text[] not null default '{}' check (cardinality(images)<=8),
 lat numeric(5,2) check (lat between 6 and 38),
 lng numeric(5,2) check (lng between 68 and 98),
 status text not null default 'draft' check(status in ('draft','published')),
 created_at timestamptz not null default now(),
 check ((lat is null) = (lng is null)),
 check (mode=case when category in ('Residential plot','Commercial plot') then 'Plots' when category in ('Office','Shop','Warehouse') then 'Commercial' when category in ('PG','Hostel') then 'PG' when mode='Rent' then 'Rent' else 'Buy' end)
);
create index properties_inventory on public.properties(status,mode,created_at desc);
create index properties_owner on public.properties(owner_id,created_at desc);
create function public.validate_image_paths() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from unnest(new.images) as x(path) where x.path is null or
  x.path !~ ('^'||new.owner_id||'/'||new.id||'/[a-zA-Z0-9_-]+\.(jpeg|png|webp|avif)$')) then
  raise exception 'Invalid property image path';
 end if;
 return new;
end $$;
create trigger property_image_paths before insert or update on public.properties for each row execute function public.validate_image_paths();
alter table public.properties enable row level security;
revoke all on public.properties from anon, authenticated;
grant select on public.properties to anon, authenticated;
grant insert (id,owner_id,slug,title,city,locality,category,mode,price,area,bhk,furnishing,facing,description,images,lat,lng,status),
 update (title,city,locality,category,mode,price,area,bhk,furnishing,facing,description,images,lat,lng,status) on public.properties to authenticated;
create policy property_public on public.properties for select using (status='published' or owner_id=(select auth.uid()));
create policy property_create on public.properties for insert to authenticated with check (owner_id=(select auth.uid()));
create policy property_update on public.properties for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));

create table public.enquiries (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 requester_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(btrim(name)) between 2 and 100),
 contact text not null check(length(btrim(contact)) between 5 and 100),
 method text not null check(method in ('Email','Phone')),
 message text not null check(length(btrim(message)) between 1 and 2000),
 created_at timestamptz not null default now()
);
create table public.visits (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 requester_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(btrim(name)) between 2 and 100),
 contact text not null check(length(btrim(contact)) between 5 and 100),
 method text not null check(method in ('Email','Phone')),
 message text not null default '' check(length(message)<=2000),
 date date not null,
 time time not null,
 status text not null default 'pending' check(status in ('pending','accepted','declined','cancelled')),
 created_at timestamptz not null default now()
);
create index enquiries_property on public.enquiries(property_id);
create index visits_property on public.visits(property_id);
create index enquiries_requester on public.enquiries(requester_id,created_at desc);
create index visits_requester on public.visits(requester_id,created_at desc);
alter table public.enquiries enable row level security;
alter table public.visits enable row level security;
revoke all on public.enquiries,public.visits from anon,authenticated;
grant select on public.enquiries,public.visits to authenticated;
grant insert (property_id,requester_id,name,contact,method,message) on public.enquiries to authenticated;
grant insert (property_id,requester_id,name,contact,method,message,date,time) on public.visits to authenticated;
create policy enquiry_read on public.enquiries for select to authenticated using(requester_id=(select auth.uid()) or exists(select 1 from public.properties p where p.id=property_id and p.owner_id=(select auth.uid())));
create policy visit_read on public.visits for select to authenticated using(requester_id=(select auth.uid()) or exists(select 1 from public.properties p where p.id=property_id and p.owner_id=(select auth.uid())));
create policy enquiry_insert on public.enquiries for insert to authenticated with check(requester_id=(select auth.uid()) and exists(select 1 from public.properties p where p.id=property_id and p.status='published' and p.owner_id<>(select auth.uid())));
create policy visit_insert on public.visits for insert to authenticated with check(requester_id=(select auth.uid()) and date >= (now() at time zone 'Asia/Kolkata')::date and exists(select 1 from public.properties p where p.id=property_id and p.status='published' and p.owner_id<>(select auth.uid())));
create function public.limit_requests() returns trigger language plpgsql security definer set search_path='' as $$
declare recent bigint;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.requester_id::text));
 select (select count(*) from public.enquiries where requester_id=new.requester_id and created_at>now()-interval '1 hour')+
        (select count(*) from public.visits where requester_id=new.requester_id and created_at>now()-interval '1 hour') into recent;
 if recent>=8 then raise exception 'Hourly request limit reached'; end if;
 return new;
end $$;
revoke all on function public.limit_requests() from public;
create trigger enquiries_limit before insert on public.enquiries for each row execute function public.limit_requests();
create trigger visits_limit before insert on public.visits for each row execute function public.limit_requests();
create function public.set_visit_status(visit_id uuid,new_status text) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.visits v set status=new_status from public.properties p
 where v.id=visit_id and p.id=v.property_id and
 ((v.status='pending' and new_status in ('accepted','declined') and p.owner_id=auth.uid()) or
 (v.status in ('pending','accepted') and new_status='cancelled' and v.requester_id=auth.uid()));
 if not found then raise exception 'Visit unavailable or invalid transition'; end if;
end $$;
revoke all on function public.set_visit_status(uuid,text) from public,anon;
grant execute on function public.set_visit_status(uuid,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values ('property-images','property-images',false,8388608,array['image/jpeg','image/png','image/webp','image/avif']);
create policy own_image_upload on storage.objects for insert to authenticated with check (bucket_id='property-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy visible_images on storage.objects for select to anon,authenticated using (bucket_id='property-images' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.properties p where p.status='published' and name=any(p.images))));
