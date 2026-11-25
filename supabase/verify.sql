-- Read-only checks. Run after all four migrations.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename in
 ('properties', 'profiles', 'saved_properties', 'enquiries', 'visits')
order by tablename;

select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'property-images';

select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'properties' and column_name = 'floor_plan';

select schemaname, tablename, policyname, cmd
from pg_policies
where (schemaname = 'storage' and tablename = 'objects')
   or (schemaname = 'public' and tablename in ('properties', 'profiles', 'saved_properties', 'enquiries', 'visits'))
order by schemaname, tablename, policyname;
