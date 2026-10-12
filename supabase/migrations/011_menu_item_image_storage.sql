-- Public bucket for menu item photos (uploaded by admin / restaurant managers).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "menu_images_public_read"
  on storage.objects for select
  using (bucket_id = 'menu-images');

create policy "menu_images_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'menu-images'
    and public.is_admin()
  );

create policy "menu_images_manager_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'menu-images'
    and public.is_restaurant_manager_for(((storage.foldername(name))[1])::uuid)
  );

create policy "menu_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'menu-images' and public.is_admin())
  with check (bucket_id = 'menu-images' and public.is_admin());

create policy "menu_images_manager_update"
  on storage.objects for update
  using (
    bucket_id = 'menu-images'
    and public.is_restaurant_manager_for(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'menu-images'
    and public.is_restaurant_manager_for(((storage.foldername(name))[1])::uuid)
  );

create policy "menu_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'menu-images' and public.is_admin());

create policy "menu_images_manager_delete"
  on storage.objects for delete
  using (
    bucket_id = 'menu-images'
    and public.is_restaurant_manager_for(((storage.foldername(name))[1])::uuid)
  );
