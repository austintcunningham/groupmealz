-- Pending branding (manager uploads) vs live (customer-facing after admin approval).
-- Safe to re-run if a prior attempt stopped mid-file (e.g. policy already exists).

alter table public.restaurants
  add column if not exists pending_logo_url text,
  add column if not exists pending_banner_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-branding',
  'restaurant-branding',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "restaurant_branding_public_read" on storage.objects;
create policy "restaurant_branding_public_read"
  on storage.objects for select
  using (bucket_id = 'restaurant-branding');

drop policy if exists "restaurant_branding_admin_insert" on storage.objects;
create policy "restaurant_branding_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'restaurant-branding'
    and public.is_admin()
  );

drop policy if exists "restaurant_branding_manager_insert" on storage.objects;
create policy "restaurant_branding_manager_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'restaurant-branding'
    and public.is_restaurant_manager_for(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "restaurant_branding_admin_update" on storage.objects;
create policy "restaurant_branding_admin_update"
  on storage.objects for update
  using (bucket_id = 'restaurant-branding' and public.is_admin())
  with check (bucket_id = 'restaurant-branding' and public.is_admin());

drop policy if exists "restaurant_branding_manager_update" on storage.objects;
create policy "restaurant_branding_manager_update"
  on storage.objects for update
  using (
    bucket_id = 'restaurant-branding'
    and public.is_restaurant_manager_for(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'restaurant-branding'
    and public.is_restaurant_manager_for(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "restaurant_branding_admin_delete" on storage.objects;
create policy "restaurant_branding_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'restaurant-branding' and public.is_admin());

drop policy if exists "restaurant_branding_manager_delete" on storage.objects;
create policy "restaurant_branding_manager_delete"
  on storage.objects for delete
  using (
    bucket_id = 'restaurant-branding'
    and public.is_restaurant_manager_for(((storage.foldername(name))[1])::uuid)
  );
