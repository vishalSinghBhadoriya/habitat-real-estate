alter table public.properties add column floor_plan text;
grant insert (floor_plan), update (floor_plan) on public.properties to authenticated;

alter table public.properties add constraint floor_plan_owned_path check (
 floor_plan is null or floor_plan ~ ('^'||owner_id||'/'||id||'/floor-[0-9a-f-]+[.](jpeg|png|webp|avif)$')
);
create index property_floor_plan on public.properties(floor_plan) where floor_plan is not null;
create index property_image_paths_index on public.properties using gin(images);

drop policy visible_images on storage.objects;
create policy visible_images on storage.objects for select to anon,authenticated using (
 bucket_id='property-images' and (
  (storage.foldername(name))[1]=(select auth.uid())::text or
  exists(select 1 from public.properties p where p.status='published' and
   (p.images @> array[storage.objects.name] or p.floor_plan=storage.objects.name))
 )
);

create policy remove_unused_own_media on storage.objects for delete to authenticated using (
 bucket_id='property-images' and (storage.foldername(name))[1]=(select auth.uid())::text and
 not exists(select 1 from public.properties p where p.owner_id=(select auth.uid()) and
 (p.images @> array[storage.objects.name] or p.floor_plan=storage.objects.name))
);
