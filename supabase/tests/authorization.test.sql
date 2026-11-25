begin;
create extension if not exists pgtap with schema extensions;
select plan(15);
insert into auth.users (id,email) values
 ('00000000-0000-4000-8000-000000000001','owner@example.test'),
 ('00000000-0000-4000-8000-000000000002','other@example.test');
insert into public.properties(id,owner_id,slug,title,city,locality,category,mode,price,area,bhk,furnishing,facing,description,status) values
 ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','test-draft','Test draft','Indore','Rau','Apartment','Buy',4000000,1000,2,'Unfurnished','East','Authorization test draft only.','draft'),
 ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','test-public','Test public','Indore','Rau','Apartment','Buy',4000000,1000,2,'Unfurnished','East','Authorization test published only.','published');
set local role anon;
select is((select count(*) from public.properties where slug like 'test-%'),1::bigint,'Anonymous visitors only see published listings');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';
select is((select count(*) from public.properties where slug='test-draft'),0::bigint,'Another account cannot see the draft');
select results_eq($$update public.properties set title='Unauthorized update' where slug='test-public' returning title$$,$$select null::text limit 0$$,'Another account cannot edit published listings');
select lives_ok($$insert into public.saved_properties(property_id) values ('10000000-0000-4000-8000-000000000002')$$,'Account can save a public property');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('property-images','00000000-0000-4000-8000-000000000001/10000000-0000-4000-8000-000000000001/test.webp')$$,'42501',null,'Another account cannot upload to an owner folder');
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
select is((select count(*) from public.saved_properties),0::bigint,'Favourites stay private to the saver');
select is((select count(*) from public.properties where slug='test-draft'),1::bigint,'Owner can read their draft');
select throws_ok($$update public.properties set floor_plan='00000000-0000-4000-8000-000000000002/10000000-0000-4000-8000-000000000001/floor-123.webp' where slug='test-draft'$$,'23514',null,'A floor plan must use its listing and owner path');
select lives_ok($$insert into storage.objects(bucket_id,name) values ('property-images','00000000-0000-4000-8000-000000000001/10000000-0000-4000-8000-000000000001/floor-123.webp')$$,'Owner may upload a floor plan');
select lives_ok($$update public.properties set floor_plan='00000000-0000-4000-8000-000000000001/10000000-0000-4000-8000-000000000001/floor-123.webp' where slug='test-draft'$$,'Owner may attach their floor plan');
set local role anon;
select is((select count(*) from storage.objects where bucket_id='property-images' and name like '%/floor-123.webp'),0::bigint,'Draft media remains private');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
select results_eq($$update public.properties set status='published' where slug='test-draft' returning status$$,$$values ('published'::text)$$,'Owner can publish a draft');
set local role anon;
select is((select count(*) from storage.objects where bucket_id='property-images' and name like '%/floor-123.webp'),1::bigint,'Published floor plan can be read');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';
select results_eq($$delete from public.properties where slug='test-draft' returning id$$,$$select null::uuid limit 0$$,'Another account cannot delete a listing');
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
select results_eq($$delete from public.properties where slug='test-draft' returning slug$$,$$values ('test-draft'::text)$$,'Owner can delete a listing');
select * from finish();
rollback;
